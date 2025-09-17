# GaiaDocs – Agent Onboarding Context

This document is a 1:1 context dump for AI agents working on the GaiaDocs site. It removes the need to fetch external context and summarizes our architecture, data sources, generators, and routes. Follow this as the source of truth while implementing changes.

## Tech Stack
- Next.js (App Router), React 19, TypeScript
- Static export (`output: 'export'`) – no server runtime
- Tailwind CSS v4, shadcn-based local UI
- Supabase PostgREST public API for data (publishable anon key)

## Key Public APIs
- Base URL: `https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1`
- Headers (both required):
  - `apikey: sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV`
  - `Authorization: Bearer sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV`
- Example: Projects
  - GET `.../Project?select=*&order=updatedAt.desc`

## Schema (Prisma)
Canonical schema (source of truth):
- `https://raw.githubusercontent.com/Azarem/gaialabs-platform/refs/heads/main/apps/gaia-api/prisma/schema.prisma`

Core models (abbreviated):
- Platform, PlatformBranch (active branch per platform)
- Game, GameRom, GameRomBranch (active per game/region/platform)
- BaseRom, BaseRomBranch (active per baseRom)
- Region, Developer
- Project, ProjectBranch, ProjectFile

Branches are NOT standalone pages. We attach the active branch summary to the owning record.

## Static Generators (scripts/)
Run via package scripts. All output to `src/generated/`.

- `generate-schema-docs.mjs`
  - Downloads `schema.prisma` and emits `schema.json` with models, fields, attributes (`@id`, `@unique`, `@relation`, defaults), indexes, and relation flags.

- `generate-projects.mjs`
  - Fetches `Project` rows
  - Attaches active `ProjectBranch` with summary (modules, fileCount, related Game/Region/Platform names)
  - Enriches with BaseRomBranch, GameRomBranch, and PlatformBranch data including technical fields
  - Includes audit timestamps (createdAt, updatedAt) for all branch entities
  - Output: `projects.json` (array)

- `generate-entities.mjs`
  - Platforms → `platforms.json` (slug-keyed map)
  - Games → `games.json` (slug-keyed map)
  - BaseRoms → `baseroms.json` (slug-keyed map)
  - Developers → `developers.json` (slug-keyed map)
  - Regions → `regions.json` (slug-keyed map)
  - Each includes minimal active-branch summary where applicable
  - Platform branches include technical data: `addressingModes`, `instructionSet`, `vectors`

- `generate-gameroms.mjs`
  - Builds entries for active GameRom branches found via active BaseRomBranches
  - For each entry: `{ platform{name,slug}, game{name,slug}, region{name,slug}, path, branch{...} }`
  - branch includes:
    - `coplib`, `config`, `types` (strings/structs), `fixups`
    - `filesRaw`: original mapping
    - `files`: array of `{ key, startHex, endHex, type }` computed from `location + size - 1`, sorted by `location`
    - `blocks`: original mapping
    - `blocksList`: `{ key, startHex, endHex }` computed from min/max of child parts (location/size)
  - Output: `gameroms.json`

Env overrides for generators:
- `SUPABASE_URL`, `SUPABASE_ANON` (defaults set to public project)
- `GAIA_PRISMA_SCHEMA_URL` for schema source

## Package Scripts (package.json)
- `generate:schema`, `generate:projects`, `generate:entities`, `generate:gameroms`
- `predev`: runs all generators
- Build/export are static; add other pre* hooks if needed

## Routing (App Router)
Single canonical pattern for games:
- `/games/{platform}` → platform detail + games list
- `/games/{platform}/{game}` → game detail (within platform) + region list
- `/games/{platform}/{game}/{region}` → GameRom overview with links to:
  - `/files` – files table (Key, Start HEX, End HEX, Type)
  - `/files/{fileKey}` – file detail (minimal for now)
  - `/cops` – raw JSON view
  - `/blocks` – blocks list table with Start/End HEX; each links to detail
  - `/blocks/{block}` – block detail with parts table sorted by:
    - primary: `order` ascending (default 0)
    - secondary: `location` ascending
  - `/types/strings`, `/types/structs` – raw JSON views

Other pages:
- `/projects` – list using `projects.json`
- `/projects/{slug}` – project detail incl. active branch summary with separate cards for Project Branch, Modules, BaseRom Branch, and Platform Branch
- `/projects/{slug}/modules/{module-slug}` – individual module detail pages with configuration groups and metadata
- `/assembly/{platform}` – comprehensive technical documentation for platform assembly programming (addressing modes, instruction set, interrupt vectors)
- `/api` – Supabase REST overview + generated schema index
- `/api/{model}` – schema model detail from `schema.json`

Note: No `games/[slug]` route to avoid conflicts. Only the nested `{platform}/{game}/{region}` pattern is used.

## Data Conventions
- **Slugs are generated using `scripts/slugify.mjs`** - normalizes to lowercase, removes diacritics, converts non-alphanumeric to hyphens
- All internal links MUST use slugified values, not `encodeURIComponent(name)`
- Entity JSON maps are keyed by slug for O(1) lookups
- Files:
  - `startHex = hex(location)`
  - `endHex = hex(location + size - 1)`
  - Ordered by `location`
- Blocks:
  - Aggregated `startHex/endHex` from parts (min location / max(location+size-1))
  - Detail parts sorted by `order` (asc), then `location` (asc)

## Example Requests
- Projects: `GET /rest/v1/Project?select=*&order=updatedAt.desc`
- Active ProjectBranch for a projectId: `GET /rest/v1/ProjectBranch?projectId=eq.{id}&isActive=eq.true`
- Active BaseRomBranch for baseRomId: `GET /rest/v1/BaseRomBranch?baseRomId=eq.{id}&isActive=eq.true`
- GameRomBranch by id: `GET /rest/v1/GameRomBranch?id=eq.{id}`
- Resolve names:
  - Game by id: `GET /rest/v1/Game?id=eq.{id}`
  - Region by id: `GET /rest/v1/Region?id=eq.{id}`
  - PlatformBranch → Platform: `GET /rest/v1/Platform?id=eq.{platformId}`

## Implementation Rules for Agents
- Always use pre-generated JSON in `src/generated` to render pages (SSG).
- Never hit Supabase at runtime (static export).
- Keep branch data attached to owners; no separate branch pages.
- Respect the routing pattern; don’t add `/games/[slug]`.
- When adding new schema-driven docs, parse `schema.json` and preserve attribute semantics.
- For new entities, use slug-keyed maps to avoid linear scans in page generation.

## Enhanced Project Detail Structure
Project detail pages (`/projects/{slug}`) now use a card-based layout with clear separation of concerns:

- **Project Branch Card**: Version information, file count, and audit timestamps only
- **Modules Card**: Full module hierarchy with individual module links to `/projects/{slug}/modules/{module-slug}`
- **BaseRom Branch Card**: BaseRom info, version, file count, with separate links for Game and Region (routing to games structure)
- **Platform Branch Card**: Platform information with link to Assembly Information page

Module detail pages show configuration groups with simplified group title display only.

## Common Tasks
- Adding a new table/section under GameRom:
  1) Extend `generate-gameroms.mjs` to include transformed table data
  2) Add a route under `/games/{platform}/{game}/{region}/...`
  3) Use Server Components and static params to generate paths

- Adding list/detail pages for developers/regions/platforms:
  - Read from their slug maps (`developers.json`, `regions.json`, `platforms.json`)
  - Use slugs for params and static generation

- Adding technical platform documentation:
  - Technical data is included in platform branches via `generate-entities.mjs`
  - Assembly documentation is consolidated at `/assembly/{platform}` to avoid route conflicts
  - Platform pages link to unified assembly documentation instead of separate sections

## Troubleshooting
- Route conflicts: Ensure only the nested game path exists. Avoid sibling dynamic segments with different param names at the same level.
  - **Assembly routes**: Use `/assembly/{platform}` instead of `/games/{platform}/technical-sections` to avoid conflicts with `/games/{platform}/{game}` structure
- 404 for manifest: Add `public/site.webmanifest` and ensure `metadata.manifest = '/site.webmanifest'`.
- Blank file ranges: Ensure `location` and `size` are present in source; we compute start/end as above.
- Module imports: For deeply nested routes, inline the `slugify` function instead of complex relative imports to avoid module resolution issues.

## Quick Start Commands
- Dev with data refresh: `pnpm dev` (runs all generators predev)
- Manual generation: `pnpm generate:projects && pnpm generate:entities && pnpm generate:gameroms && pnpm generate:schema`

## Links
- Prisma schema: `https://raw.githubusercontent.com/Azarem/gaialabs-platform/refs/heads/main/apps/gaia-api/prisma/schema.prisma`
- Supabase Project REST sample: `https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1/Project?apikey=sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV`
