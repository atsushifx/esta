#!/usr/bin/env tsx
/*
 * Check all docs (excluding docs/_templates) have YAML front matter (--- ... ---)
 * Usage: pnpm lint:docs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === '_templates' || entry === '.cc-kiro') { continue; }
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) { yield* walk(p); }
    else if (p.endsWith('.md')) { yield p; }
  }
}

function hasFrontMatter(path: string): boolean {
  const text = readFileSync(path, 'utf8');
  if (!text.startsWith('---\n')) { return false; }
  // Closing delimiter within first ~80 lines
  const lines = text.split(/\r?\n/);
  for (let i = 1; i < Math.min(lines.length, 80); i++) {
    if (lines[i] === '---') { return true; }
  }
  return false;
}

const missing: string[] = [];
for (const file of walk('docs')) {
  if (!hasFrontMatter(file)) { missing.push(file); }
}

if (missing.length) {
  console.error('Docs missing YAML front matter (---):\n' + missing.map((s) => ` - ${s}`).join('\n'));
  process.exit(2);
}

console.log('All docs have YAML front matter.');
