#!/usr/bin/env node
/*
  Generates denormalized JSON snapshots for Platform, Game, BaseRom with their active branches.
  - Active branch rules:
    * Platform: PlatformBranch where isActive=true
    * Game: GameRomBranch via active GameRom? Not guaranteed; instead, attach the active GameRomBranch reachable from any BaseRomBranch related to this Game (if present). For now, attach none if not directly resolvable in one hop.
    * BaseRom: BaseRomBranch where isActive=true
  Emits:
    - src/generated/platforms.json
    - src/generated/baseroms.json
    - src/generated/games.json
*/

import fs from 'node:fs';
import path from 'node:path';

import { slugify } from './slugify.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://adwobxutnpmjbmhdxrzx.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV';

const OUT_DIR = path.join(process.cwd(), 'src', 'generated');

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch ${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

function writeOut(file, payload) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(payload, null, 2), 'utf8');
}

async function genPlatforms() {
  const rows = await fetchJSON(`${SUPABASE_URL}/rest/v1/Platform?select=*`);
  const out = [];
  for (const p of rows) {
    // active PlatformBranch
    const branches = await fetchJSON(`${SUPABASE_URL}/rest/v1/PlatformBranch?platformId=eq.${p.id}&isActive=eq.true&select=id,name,version,isActive,notes,addressingModes,instructionSet,vectors,createdAt,updatedAt`);
    const b = branches && branches[0];
    out.push({
      id: p.id,
      name: p.name,
      slug: slugify(p.name),
      meta: p.meta ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      activeBranch: b
        ? { 
            id: b.id, 
            name: b.name ?? null, 
            version: b.version ?? null, 
            notes: b.notes ?? [],
            addressingModes: b.addressingModes ?? null,
            instructionSet: b.instructionSet ?? null,
            vectors: b.vectors ?? null,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt
          }
        : null,
    });
  }
  const map = Object.fromEntries(out.map((p) => [p.slug, p]));
  writeOut('platforms.json', { source: { table: 'Platform', fetchedAt: new Date().toISOString() }, platforms: map });
}

async function genBaseRoms() {
  const rows = await fetchJSON(`${SUPABASE_URL}/rest/v1/BaseRom?select=*`);
  const out = [];
  for (const b of rows) {
    const branches = await fetchJSON(`${SUPABASE_URL}/rest/v1/BaseRomBranch?baseRomId=eq.${b.id}&isActive=eq.true&select=id,name,version,isActive,notes,fileCrcs,createdAt,updatedAt,gameRomBranchId`);
    const br = branches && branches[0];
    out.push({
      id: b.id,
      name: b.name,
      slug: slugify(b.name),
      gameId: b.gameId,
      gameRomId: b.gameRomId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      activeBranch: br
        ? {
            id: br.id,
            name: br.name ?? null,
            version: br.version ?? null,
            fileCount: Array.isArray(br.fileCrcs) ? br.fileCrcs.length : 0,
            gameRomBranchId: br.gameRomBranchId,
          }
        : null,
    });
  }
  const map = Object.fromEntries(out.map((b) => [b.slug, b]));
  writeOut('baseroms.json', { source: { table: 'BaseRom', fetchedAt: new Date().toISOString() }, baseRoms: map });
}

async function genGames() {
  const rows = await fetchJSON(`${SUPABASE_URL}/rest/v1/Game?select=*`);
  const out = [];
  for (const g of rows) {
    // Attach a best-effort active GameRomBranch: pick any BaseRom of this game, then its active BaseRomBranch->gameRomBranchId
    const brs = await fetchJSON(`${SUPABASE_URL}/rest/v1/BaseRom?gameId=eq.${g.id}&select=id`);
    let gameRomBranch = null;
    if (brs && brs[0]) {
      const brBranches = await fetchJSON(`${SUPABASE_URL}/rest/v1/BaseRomBranch?baseRomId=eq.${brs[0].id}&isActive=eq.true&select=gameRomBranchId`);
      const grbId = brBranches && brBranches[0]?.gameRomBranchId;
      if (grbId) {
        const grbRows = await fetchJSON(`${SUPABASE_URL}/rest/v1/GameRomBranch?id=eq.${grbId}&select=id,name,version,isActive,createdAt,updatedAt`);
        gameRomBranch = grbRows && grbRows[0] ? { id: grbRows[0].id, name: grbRows[0].name ?? null, version: grbRows[0].version ?? null } : null;
      }
    }
    out.push({
      id: g.id,
      name: g.name,
      slug: slugify(g.name),
      meta: g.meta ?? null,
      platformId: g.platformId,
      developerId: g.developerId ?? null,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      activeBranch: gameRomBranch,
    });
  }
  const map = Object.fromEntries(out.map((g) => [g.slug, g]));
  writeOut('games.json', { source: { table: 'Game', fetchedAt: new Date().toISOString() }, games: map });
}

async function genDevelopers() {
  const rows = await fetchJSON(`${SUPABASE_URL}/rest/v1/Developer?select=*`);
  const out = rows.map((d) => ({
    id: d.id,
    name: d.name,
    slug: slugify(d.name),
    meta: d.meta ?? null,
    platformId: d.platformId,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
  const map = Object.fromEntries(out.map((d) => [d.slug, d]));
  writeOut('developers.json', { source: { table: 'Developer', fetchedAt: new Date().toISOString() }, developers: map });
}

async function genRegions() {
  const rows = await fetchJSON(`${SUPABASE_URL}/rest/v1/Region?select=*`);
  const out = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: slugify(r.name),
    meta: r.meta ?? null,
    platformId: r.platformId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  const map = Object.fromEntries(out.map((r) => [r.slug, r]));
  writeOut('regions.json', { source: { table: 'Region', fetchedAt: new Date().toISOString() }, regions: map });
}

async function main() {
  await genPlatforms();
  await genBaseRoms();
  await genGames();
  await genDevelopers();
  await genRegions();
  console.log('[entities-gen] Completed.');
}

main().catch((e) => {
  console.error('[entities-gen] Failed:', e.message || e);
  process.exit(1);
});


