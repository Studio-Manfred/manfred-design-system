#!/usr/bin/env node
/**
 * Copy src/tokens/tokens.css → dist/tokens.css, stripping DS-internal
 * Tailwind directives so the file is consumable as a Tailwind v4 input
 * (`@import "@studio-manfred/manfred-design-system/tokens.css"`) without
 * requiring `tailwindcss` or `tw-animate-css` to resolve from the
 * consumer's node_modules.
 *
 * What ships in dist/tokens.css: primitives, semantic aliases, the shadcn
 * shape `:root`, dark-mode rebinds, and the `@theme inline` block — i.e.
 * everything a downstream Tailwind v4 build needs to emit `bg-muted`,
 * `text-muted-foreground`, `border-border`, `ring-ring`, etc.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const srcPath = resolve(repoRoot, 'src/tokens/tokens.css');
const outPath = resolve(repoRoot, 'dist/tokens.css');

const STRIP_IMPORTS = ['tailwindcss', 'tw-animate-css'];

const banner = `/*!
 * @studio-manfred/manfred-design-system — design tokens
 *
 * Import from your Tailwind v4 input CSS:
 *   @import "@studio-manfred/manfred-design-system/tokens.css";
 *
 * This exposes the shadcn-shape contract (--color-muted, --color-accent,
 * --color-card, …) to your Tailwind utility generator. Without this,
 * classes like bg-muted / text-muted-foreground / border-border / ring-ring
 * are dead in consumers. See STU-266.
 *
 * DO NOT EDIT — generated from src/tokens/tokens.css at build time.
 */
`;

const source = readFileSync(srcPath, 'utf8');

const stripped = source.replace(
  new RegExp(`^@import\\s+["'](${STRIP_IMPORTS.join('|')})["'];\\s*\\n`, 'gm'),
  '',
);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, banner + stripped);

console.log(`wrote ${outPath} (${stripped.length + banner.length} bytes)`);
