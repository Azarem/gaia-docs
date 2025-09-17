#!/usr/bin/env node
/*
  Generates a denormalized static JSON snapshot of published projects for SSG.
  - Lists projects from Supabase REST (Project table)
  - Optionally enriches with summaryFromSupabaseByProject from @gaialabs/shared (if present)
  - Emits src/generated/projects.json with [{ id, name, slug, meta, updatedAt, ... }]
*/

import fs from 'node:fs';
import path from 'node:path';

import { slugify } from './slugify.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://adwobxutnpmjbmhdxrzx.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV';

const OUTPUT_DIR = path.join(process.cwd(), 'src', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'projects.json');

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function listProjects() {
  const url = `${SUPABASE_URL}/rest/v1/Project?select=*&order=updatedAt.desc`;
  const rows = await fetchJSON(url);
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slugify(p.name),
    meta: p.meta ?? null,
    gameId: p.gameId,
    baseRomId: p.baseRomId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

async function fetchActiveProjectBranch(projectId) {
  // Step 1: find the active ProjectBranch (no deep embeds to avoid 400s)
  const pbUrl = `${SUPABASE_URL}/rest/v1/ProjectBranch?projectId=eq.${projectId}&isActive=eq.true&select=id,name,version,isActive,notes,projectId,baseRomBranchId,fileCrcs,modules,createdAt,updatedAt`;
  const pbRows = await fetchJSON(pbUrl);
  const branch = pbRows && pbRows[0];
  if (!branch) return null;

  // Step 2: load BaseRomBranch
  let baseRomBranch = null;
  if (branch.baseRomBranchId) {
    const brbUrl = `${SUPABASE_URL}/rest/v1/BaseRomBranch?id=eq.${branch.baseRomBranchId}&select=id,name,version,isActive,notes,baseRomId,gameRomBranchId,fileCrcs,createdAt,updatedAt`;
    const brbRows = await fetchJSON(brbUrl);
    baseRomBranch = brbRows && brbRows[0];
  }

  // Step 3: load GameRomBranch (from BaseRomBranch)
  let gameRomBranch = null;
  if (baseRomBranch?.gameRomBranchId) {
    const grbUrl = `${SUPABASE_URL}/rest/v1/GameRomBranch?id=eq.${baseRomBranch.gameRomBranchId}&select=id,name,version,isActive,notes,gameRomId,platformBranchId,createdAt,updatedAt`;
    const grbRows = await fetchJSON(grbUrl);
    gameRomBranch = grbRows && grbRows[0];
  }

  // Step 4: load GameRom + names
  let game = null;
  let region = null;
  if (gameRomBranch?.gameRomId) {
    const grUrl = `${SUPABASE_URL}/rest/v1/GameRom?id=eq.${gameRomBranch.gameRomId}&select=id,crc,gameId,regionId`;
    const grRows = await fetchJSON(grUrl);
    const gameRom = grRows && grRows[0];
    if (gameRom?.gameId) {
      const gUrl = `${SUPABASE_URL}/rest/v1/Game?id=eq.${gameRom.gameId}&select=id,name`;
      const gRows = await fetchJSON(gUrl);
      game = gRows && gRows[0];
    }
    if (gameRom?.regionId) {
      const rUrl = `${SUPABASE_URL}/rest/v1/Region?id=eq.${gameRom.regionId}&select=id,name`;
      const rRows = await fetchJSON(rUrl);
      region = rRows && rRows[0];
    }
  }

  // Step 5: load PlatformBranch + platform name
  let platformBranch = null;
  let platform = null;
  if (gameRomBranch?.platformBranchId) {
    const pb2Url = `${SUPABASE_URL}/rest/v1/PlatformBranch?id=eq.${gameRomBranch.platformBranchId}&select=id,name,version,isActive,notes,platformId,createdAt,updatedAt`;
    const pb2Rows = await fetchJSON(pb2Url);
    platformBranch = pb2Rows && pb2Rows[0];
    if (platformBranch?.platformId) {
      const pUrl = `${SUPABASE_URL}/rest/v1/Platform?id=eq.${platformBranch.platformId}&select=id,name,meta`;
      const pRows = await fetchJSON(pUrl);
      platform = pRows && pRows[0];
    }
  }

  // Step 6: load BaseRom entity details
  let baseRom = null;
  if (baseRomBranch?.baseRomId) {
    const brUrl = `${SUPABASE_URL}/rest/v1/BaseRom?id=eq.${baseRomBranch.baseRomId}&select=id,name,gameId`;
    const brRows = await fetchJSON(brUrl);
    baseRom = brRows && brRows[0];
  }

  return {
    id: branch.id,
    name: branch.name ?? null,
    version: branch.version ?? null,
    modules: Array.isArray(branch.modules) ? branch.modules.map(module => ({
      ...module,
      slug: slugify(module.name)
    })) : [],
    fileCount: Array.isArray(branch.fileCrcs) ? branch.fileCrcs.length : 0,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
    baseRomBranch: baseRomBranch
      ? {
          id: baseRomBranch.id,
          name: baseRomBranch.name ?? null,
          version: baseRomBranch.version ?? null,
          fileCount: Array.isArray(baseRomBranch.fileCrcs) ? baseRomBranch.fileCrcs.length : 0,
          createdAt: baseRomBranch.createdAt,
          updatedAt: baseRomBranch.updatedAt,
          baseRom: baseRom ? { 
            id: baseRom.id, 
            name: baseRom.name, 
            slug: slugify(baseRom.name), 
            gameId: baseRom.gameId 
          } : null,
        }
      : null,
    gameRomBranch: gameRomBranch
      ? {
          id: gameRomBranch.id,
          name: gameRomBranch.name ?? null,
          version: gameRomBranch.version ?? null,
          game: game ? { id: game.id, name: game.name, slug: slugify(game.name) } : null,
          region: region ? { id: region.id, name: region.name, slug: slugify(region.name) } : null,
        }
      : null,
    platformBranch: platformBranch
      ? {
          id: platformBranch.id,
          name: platformBranch.name ?? null,
          version: platformBranch.version ?? null,
          notes: platformBranch.notes ?? null,
          createdAt: platformBranch.createdAt,
          updatedAt: platformBranch.updatedAt,
          platform: platform ? { 
            id: platform.id, 
            name: platform.name, 
            slug: slugify(platform.name), 
            meta: platform.meta 
          } : null,
        }
      : null,
  };
}

async function main() {
  console.log('[projects-gen] Listing projects...');
  const projects = await listProjects();
  console.log(`[projects-gen] Enriching ${projects.length} projects with active branches...`);
  const enriched = [];
  for (const p of projects) {
    let activeBranch = null;
    try {
      activeBranch = await fetchActiveProjectBranch(p.id);
    } catch (e) {
      console.warn(`[projects-gen] Failed to fetch active branch for ${p.name}:`, e.message || e);
    }
    enriched.push({ ...p, activeBranch });
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    source: {
      url: `${SUPABASE_URL}/rest/v1/Project`,
      fetchedAt: new Date().toISOString(),
    },
    projects: enriched,
  }, null, 2), 'utf8');
  console.log(`[projects-gen] Wrote ${OUTPUT_FILE} with ${enriched.length} projects.`);
}

main().catch((err) => {
  console.error('[projects-gen] Failed:', err.message || err);
  process.exit(1);
});


