#!/usr/bin/env tsx
/*
 * Simple doc generator that ensures YAML front matter from template
 * Usage:
 *   pnpm new:doc docs/<path>/<file>.md --title "..." --description "..." [--author "..."] [--tags tag1,tag2] [--overwrite]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

type Args = {
  outPath: string;
  title: string;
  description: string;
  author?: string;
  tags?: string[];
  overwrite?: boolean;
  date?: String;
};

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const opts: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--overwrite') {
      opts.overwrite = true;
    } else if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
      opts[key] = val;
    } else {
      positional.push(a);
    }
  }

  const outPath = positional[0];
  const title = String(opts.title || '').trim();
  const description = String(opts.description || '').trim();
  const author = String(opts.author || '').trim() || undefined;
  const tags = String(opts.tags || '').trim()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const overwrite = Boolean(opts.overwrite);

  if (!outPath) { throw new Error('Output path is required (e.g. docs/guide/new.md)'); }
  if (!title) { throw new Error('--title is required'); }
  if (!description) { throw new Error('--description is required'); }

  return { outPath, title, description, author, tags: tags.length ? tags : undefined, overwrite };
}

function formatDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateDoc(args: Args) {
  const templatePath = resolve('docs/_templates/template.md');
  const raw = readFileSync(templatePath, 'utf8');

  const outAbs = resolve(args.outPath);
  const relForHeader = args.outPath.replace(/\\/g, '/');

  let content = raw
    .replaceAll('${title}', args.title)
    .replaceAll('${description}', args.description)
    .replaceAll('${path}', relForHeader)
    .replaceAll('${date}', formatDate());

  // Update created date to today if a created field exists
  const today = formatDate();
  content = content.replace(/(^|\n)created:\s*\d{4}-\d{2}-\d{2}(?=\s|\n)/, `$1created: ${today}`);

  // If author is provided, replace authors block with a single entry of that author
  if (args.author) {
    const authorsStart = content.indexOf('\nauthors:');
    const changesStart = content.indexOf('\nchanges:');
    if (authorsStart !== -1 && changesStart !== -1 && changesStart > authorsStart) {
      const before = content.slice(0, authorsStart);
      const after = content.slice(changesStart);
      content = `${before}\nauthors:\n  - ${args.author}${after}`;
    }
  }

  // Insert tags line after description if provided and not present in template
  if (args.tags && args.tags.length) {
    const descLineRe = /(^|\n)description:\s*.*?(?=\n)/;
    if (descLineRe.test(content)) {
      content = content.replace(
        descLineRe,
        (m) => `${m}\n${Array.isArray(args.tags) ? `tags: ${args.tags.join(',')}` : ''}`,
      );
    }
  }

  const outDir = dirname(outAbs);
  if (!existsSync(outDir)) { mkdirSync(outDir, { recursive: true }); }
  if (existsSync(outAbs) && !args.overwrite) {
    throw new Error(`Output file already exists: ${args.outPath} (use --overwrite to replace)`);
  }
  writeFileSync(outAbs, content, 'utf8');
}

function main() {
  try {
    const args = parseArgs(process.argv);
    if (!args.outPath.startsWith('docs/')) {
      throw new Error('Output must be under docs/ (e.g. docs/guide/foo.md)');
    }
    generateDoc(args);
    console.log(`Created: ${args.outPath}`);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

main();
