#!/usr/bin/env node
/*
  Generates structured JSON documentation from a remote Prisma schema.
  - Downloads schema.prisma from the canonical repo URL
  - Parses models, fields, relations, indexes, and uniques
  - Writes JSON to src/generated/schema.json for use in Next.js pages
*/

import fs from 'node:fs';
import path from 'node:path';

const SCHEMA_URL = process.env.GAIA_PRISMA_SCHEMA_URL || 'https://raw.githubusercontent.com/Azarem/gaialabs-platform/refs/heads/main/apps/gaia-api/prisma/schema.prisma';
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'schema.json');

async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to download Prisma schema (${res.status} ${res.statusText})`);
  }
  return await res.text();
}

function parseModelBlocks(schemaText) {
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  const blocks = [];
  let match;
  while ((match = modelRegex.exec(schemaText)) !== null) {
    const name = match[1];
    const body = match[2];
    blocks.push({ name, body });
  }
  return blocks;
}

function parseAttributesList(attrs) {
  const attributes = {
    isId: false,
    isUnique: false,
    isUpdatedAt: false,
    defaultValue: null,
    relation: null,
  };

  if (!attrs) return attributes;

  if (/@id\b/.test(attrs)) attributes.isId = true;
  if (/@unique\b/.test(attrs)) attributes.isUnique = true;
  if (/@updatedAt\b/.test(attrs)) attributes.isUpdatedAt = true;

  // Extract balanced @default(...) content to avoid truncation when nested parentheses exist
  const defIdx = attrs.indexOf('@default(');
  if (defIdx !== -1) {
    const openIdx = attrs.indexOf('(', defIdx);
    if (openIdx !== -1) {
      const content = extractBalancedParenContent(attrs, openIdx);
      if (content != null) attributes.defaultValue = content.trim();
    }
  }

  // Extract balanced @relation(...) content
  const relIdx = attrs.indexOf('@relation(');
  if (relIdx !== -1) {
    const openIdx = attrs.indexOf('(', relIdx);
    if (openIdx !== -1) {
      const inner = extractBalancedParenContent(attrs, openIdx) ?? '';
    const nameMatch = inner.match(/name:\s*"([^"]+)"/);
    const fieldsMatch = inner.match(/fields:\s*\[([^\]]*)\]/);
    const referencesMatch = inner.match(/references:\s*\[([^\]]*)\]/);
    const relation = {
      name: nameMatch ? nameMatch[1] : null,
      fields: fieldsMatch ? fieldsMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [],
      references: referencesMatch ? referencesMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    attributes.relation = relation;
    }
  }

  return attributes;
}

function parseBlockLevelAttributes(lines) {
  const uniques = [];
  const indexes = [];
  for (const line of lines) {
    if (!line.startsWith('@@')) continue;
    const uniqueMatch = line.match(/@@unique\(([^)]*)\)/);
    const indexMatch = line.match(/@@index\(([^)]*)\)/);
    if (uniqueMatch) {
      // extract fields inside [ ... ] if present, else raw
      const fieldsBracket = uniqueMatch[1].match(/\[([^\]]+)\]/);
      const fields = fieldsBracket ? fieldsBracket[1].split(',').map(s => s.trim()) : [uniqueMatch[1].trim()];
      uniques.push({ fields });
    }
    if (indexMatch) {
      const fieldsBracket = indexMatch[1].match(/\[([^\]]+)\]/);
      const fields = fieldsBracket ? fieldsBracket[1].split(',').map(s => s.trim()) : [indexMatch[1].trim()];
      indexes.push({ fields });
    }
  }
  return { uniques, indexes };
}

function parseFieldLine(line) {
  // Ignore block-level attributes and comments
  if (line.startsWith('@@') || line.startsWith('//')) return null;
  if (!line || /^(id|@@)/.test(line)) {
    // allow any field name, but skip if empty
  }

  // Split name and type
  const trimmed = line.trim();
  // Capture: name, type token, rest (attributes)
  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([^\s]+)\s*(.*)$/);
  if (!match) return null;
  const name = match[1];
  const rawType = match[2];
  const attrs = (match[3] || '').trim();

  const isOptional = rawType.endsWith('?');
  const isList = rawType.endsWith('[]');
  const baseType = rawType.replace(/[?\[\]]/g, '');

  // Skip model-level decorators that might slip through
  if (name.startsWith('@')) return null;

  const attributes = parseAttributesList(attrs);

  return {
    name,
    type: baseType,
    isOptional,
    isList,
    attributes,
    rawAttributes: attrs.length > 0 ? attrs : null,
  };
}

function buildSchemaDoc(schemaText) {
  const blocks = parseModelBlocks(schemaText);
  const modelNames = blocks.map(b => b.name);
  const models = [];

  for (const block of blocks) {
    const rawLines = block.body.split('\n');
    const lines = rawLines.map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//'));
    const fields = [];
    for (const line of lines) {
      if (line.startsWith('@@')) continue; // handled later
      const field = parseFieldLine(line);
      if (field) {
        const isRelationType = modelNames.includes(field.type);
        // Annotate field with relation type info to aid downstream rendering
        field.isRelationType = isRelationType;
        fields.push(field);
      }
    }
    const { uniques, indexes } = parseBlockLevelAttributes(lines);

    models.push({
      name: block.name,
      fields,
      uniques,
      indexes,
    });
  }

  return {
    source: {
      url: SCHEMA_URL,
      fetchedAt: new Date().toISOString(),
    },
    models,
  };
}

// Utility: given a string and the index of an opening '(', return the balanced inner content
function extractBalancedParenContent(str, openIdx) {
  let depth = 0;
  let start = openIdx + 1;
  for (let i = openIdx; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') {
      depth++;
      if (depth === 1) start = i + 1;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) {
        return str.slice(start, i);
      }
    }
  }
  return null;
}

async function main() {
  console.log(`[schema-docs] Downloading Prisma schema from: ${SCHEMA_URL}`);
  const text = await fetchText(SCHEMA_URL);
  const doc = buildSchemaDoc(text);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(doc, null, 2), 'utf8');
  console.log(`[schema-docs] Wrote ${OUTPUT_FILE} with ${doc.models.length} models.`);
}

main().catch((err) => {
  console.error('[schema-docs] Failed to generate schema docs:', err.message || err);
  process.exit(1);
});


