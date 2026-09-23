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
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const DEFAULT_SRC_PATH = resolve(repoRoot, 'src/tokens/tokens.css');
const DEFAULT_OUT_PATH = resolve(repoRoot, 'dist/tokens.css');

export const STRIP_IMPORTS = ['tailwindcss', 'tw-animate-css'];

export const banner = `/*!
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

/**
 * Remove whole-line `@import "<name>";` statements for each name in
 * `stripImports`. Other @imports and all rules are left untouched.
 * @param {string} source
 * @param {string[]} [stripImports]
 * @returns {string}
 */
export function stripImports(source, stripImports = STRIP_IMPORTS) {
  return source.replace(
    new RegExp(`^@import\\s+["'](${stripImports.join('|')})["'];\\s*\\n`, 'gm'),
    '',
  );
}

/**
 * The full dist/tokens.css contents for a given tokens.css source.
 * @param {string} source
 * @returns {string}
 */
export function buildTokensExport(source) {
  return banner + stripImports(source);
}

/**
 * Read `srcPath`, write the consumer export to `outPath`.
 * @param {{srcPath?: string, outPath?: string, log?: (msg: string) => void}} [options]
 * @returns {string} the written contents
 */
export function main({
  srcPath = DEFAULT_SRC_PATH,
  outPath = DEFAULT_OUT_PATH,
  log = console.log,
} = {}) {
  const source = readFileSync(srcPath, 'utf8');
  const output = buildTokensExport(source);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, output);

  log(`wrote ${outPath} (${output.length} bytes)`);
  return output;
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (invokedDirectly) {
  main();
}
