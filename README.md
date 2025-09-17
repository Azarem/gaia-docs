# GaiaDocs - Static Documentation Site

A blazing-fast static documentation site built with Next.js, showcasing GaiaLabs ROM analysis tools and published research projects.

## Features

- 🚀 **Static Site Generation** - Pre-rendered at build time for maximum performance
- 📱 **Responsive Design** - Works beautifully on all devices  
- 🎨 **Modern UI** - Clean, accessible design with Tailwind CSS v4
- 📖 **Comprehensive Documentation** - Getting started guides, API reference, and examples
- 🔍 **SEO Optimized** - Perfect for search engine discovery
- 🌐 **CDN Ready** - Optimized for global distribution

## Architecture

This is a **pure static site** that:
- Has zero runtime dependencies
- Fetches data at build time from the public Supabase REST API
- Displays published ROM analysis projects
- Provides documentation for the GaiaLabs ecosystem
- Operates completely independently from the collaborative editor (gaia-scribe)

## Development

```bash
# Install dependencies
pnpm install

# Run development server (port 3002)
pnpm dev

# Build static site
pnpm build

# Start production server
pnpm start
```

### Schema & API generation

- Schema docs are generated from the canonical Prisma schema at build/dev time:

  - Script: `scripts/generate-schema-docs.mjs`
  - Output: `src/generated/schema.json`
  - Override source via env: `GAIA_PRISMA_SCHEMA_URL="https://.../schema.prisma"`

```bash
# One-off
pnpm run generate:schema

# Auto-runs before dev/build/export
pnpm dev
pnpm build
pnpm export
```

### Public REST API (Supabase/PostgREST)

- Base URL: `https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1`
- Use the publishable anon key in both headers:

```bash
curl "https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1/Project?select=*" \
  -H "apikey: sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV" \
  -H "Authorization: Bearer sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV"
```

Pages using real data:
- `src/app/projects/page.tsx` — lists `Project` rows (SSG)
- `src/app/api/page.tsx` — overview, plus generated schema index
- `src/app/api/[model]/page.tsx` — model details generated from schema JSON

## Data Sources

The site consumes data from:
- **Supabase REST** - Auto-generated API over the Postgres schema
- **Static content** - Documentation, guides, and API references
- **Build-time APIs** - External data fetched during static generation

## Deployment

The site is configured for static export (`output: 'export'`) and can be deployed to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any CDN or static hosting service

## UI Components

Uses local UI components (not shared with gaia-scribe) for:
- Complete independence
- Optimized bundle size
- Static-first approach
- Zero client-side JavaScript for basic functionality

## Performance

- ✅ Pre-rendered HTML for instant loading
- ✅ Optimized images and assets
- ✅ Minimal JavaScript bundle
- ✅ Perfect Lighthouse scores
- ✅ CDN-ready static files




