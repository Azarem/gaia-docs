#!/usr/bin/env node
/*
  Generates denormalized GameRom pages data keyed by platform/game/region slugs.
  For each GameRomBranch active via BaseRomBranch or standalone GameRomBranch isActive, we assemble:
    - platformSlug, gameSlug, regionSlug
    - gameRomBranch core columns: coplib, config, files, blocks, fixups, types
    - files listing with friendly keys (crc, name when available)
*/

import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://adwobxutnpmjbmhdxrzx.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV';
const OUT_FILE = path.join(process.cwd(), 'src', 'generated', 'gameroms.json');

function slugify(name) {
  return encodeURIComponent(String(name || '').replace(/\s+/g, ' ').trim());
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Fetch ${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function listActiveGameRomBranches() {
  // Strategy: find active BaseRomBranches, then their GameRomBranch
  const brRows = await fetchJSON(`${SUPABASE_URL}/rest/v1/BaseRomBranch?isActive=eq.true&select=gameRomBranchId`);
  const ids = [...new Set(brRows.map((r) => r.gameRomBranchId).filter(Boolean))];
  const out = [];
  for (const id of ids) {
    const rows = await fetchJSON(`${SUPABASE_URL}/rest/v1/GameRomBranch?id=eq.${id}&select=id,name,version,isActive,coplib,config,files,blocks,fixups,types,gameRomId,platformBranchId`);
    if (rows[0]) out.push(rows[0]);
  }
  return out;
}

function toHex(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const v = Number(n);
  return '0x' + v.toString(16).toUpperCase();
}

async function enrichBranch(branch) {
  // gameRom -> game + region
  const grRows = await fetchJSON(`${SUPABASE_URL}/rest/v1/GameRom?id=eq.${branch.gameRomId}&select=id,crc,gameId,regionId`);
  const gameRom = grRows[0];
  const gRows = gameRom?.gameId ? await fetchJSON(`${SUPABASE_URL}/rest/v1/Game?id=eq.${gameRom.gameId}&select=id,name`) : [];
  const rRows = gameRom?.regionId ? await fetchJSON(`${SUPABASE_URL}/rest/v1/Region?id=eq.${gameRom.regionId}&select=id,name`) : [];
  const game = gRows[0];
  const region = rRows[0];
  // platformBranch -> platform
  const pbRows = await fetchJSON(`${SUPABASE_URL}/rest/v1/PlatformBranch?id=eq.${branch.platformBranchId}&select=id,name,platformId`);
  const platformBranch = pbRows[0];
  const pRows = platformBranch?.platformId ? await fetchJSON(`${SUPABASE_URL}/rest/v1/Platform?id=eq.${platformBranch.platformId}&select=id,name`) : [];
  const platform = pRows[0];

  const platformSlug = slugify(platform?.name);
  const gameSlug = slugify(game?.name);
  const regionSlug = slugify(region?.name);

  // Files: derive table with start/end hex and type; keep raw mapping
  let filesTable = [];
  let filesRaw = null;
  if (branch.files && typeof branch.files === 'object') {
    filesRaw = branch.files;
    for (const [key, value] of Object.entries(branch.files)) {
      const location = value && typeof value === 'object' ? Number(value.location ?? NaN) : NaN;
      const size = value && typeof value === 'object' ? Number(value.size ?? NaN) : NaN;
      const type = value && typeof value === 'object' ? (value.type ?? null) : null;
      const startNum = Number.isFinite(location) ? location : null;
      const endNum = Number.isFinite(location) && Number.isFinite(size) ? location + Math.max(0, size - 1) : null;
      filesTable.push({ key, startHex: toHex(startNum), endHex: toHex(endNum), type, _startNum: startNum ?? Number.POSITIVE_INFINITY });
    }
    filesTable.sort((a, b) => (a._startNum - b._startNum));
    filesTable = filesTable.map(({ _startNum, ...rest }) => rest);
  }

  // Blocks: derive list and keep raw mapping
  let blocksList = [];
  let blocksRaw = null;
  if (branch.blocks && typeof branch.blocks === 'object') {
    blocksRaw = branch.blocks;
    for (const [blockName, blockVal] of Object.entries(branch.blocks)) {
      const parts = (blockVal && typeof blockVal === 'object' && blockVal.parts && typeof blockVal.parts === 'object')
        ? Object.entries(blockVal.parts)
        : [];
      // compute min(start) and max(start+size-1)
      let minLoc = Number.POSITIVE_INFINITY;
      let maxEnd = Number.NEGATIVE_INFINITY;
      for (const [, part] of parts) {
        const loc = Number(part.location ?? NaN);
        const size = Number(part.size ?? NaN);
        if (Number.isFinite(loc)) {
          minLoc = Math.min(minLoc, loc);
          if (Number.isFinite(size)) {
            maxEnd = Math.max(maxEnd, loc + Math.max(0, size - 1));
          }
        }
      }
      const startHex = Number.isFinite(minLoc) ? toHex(minLoc) : null;
      const endHex = Number.isFinite(maxEnd) ? toHex(maxEnd) : null;
      blocksList.push({ key: blockName, startHex, endHex });
    }
  }

  return {
    platform: { id: platform?.id ?? null, name: platform?.name ?? null, slug: platformSlug },
    game: { id: game?.id ?? null, name: game?.name ?? null, slug: gameSlug },
    region: { id: region?.id ?? null, name: region?.name ?? null, slug: regionSlug },
    path: `games/${platformSlug}/${gameSlug}/${regionSlug}`,
    branch: {
      id: branch.id,
      name: branch.name ?? null,
      version: branch.version ?? null,
      coplib: branch.coplib ?? null,
      config: branch.config ?? null,
      blocks: blocksRaw,
      blocksList,
      fixups: branch.fixups ?? null,
      types: branch.types ?? null,
      files: filesTable,
      filesRaw,
    },
  };
}

async function main() {
  const branches = await listActiveGameRomBranches();
  const entries = [];
  for (const b of branches) {
    try {
      entries.push(await enrichBranch(b));
    } catch (e) {
      console.warn('[gameroms-gen] Failed to enrich branch', b.id, e.message || e);
    }
  }

  const payload = {
    source: { table: 'GameRomBranch', fetchedAt: new Date().toISOString() },
    entries,
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`[gameroms-gen] Wrote ${OUT_FILE} with ${entries.length} entries.`);
}

main().catch((e) => {
  console.error('[gameroms-gen] Failed:', e.message || e);
  process.exit(1);
});


