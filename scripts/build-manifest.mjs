// Builds dist/manifest.json + dist/migrations.json for the Manfred DS CLI
// (Linear project "Manfred DS CLI"). Pure functions are exported for tests;
// main() does the I/O and runs as the last postbuild step.

import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const DECL = /(--[\w-]+)\s*:\s*([^;]+);/g;
const VAR_REF = /^var\((--[\w-]+)\)$/;

function findLayerBoundaries(css) {
  const layer2Match = css.match(/LAYER\s+2\b/);
  const layer3Match = css.match(/LAYER\s+3\b/);

  if (!layer2Match) throw new Error('tokens.css: missing "LAYER 2" section header');
  if (!layer3Match) throw new Error('tokens.css: missing "LAYER 3" section header');

  return {
    layer2Pos: layer2Match.index,
    layer3Pos: layer3Match.index,
  };
}

function normalizeComments(css) {
  // Replace comments with same-length whitespace to preserve offsets
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
}

function findThemeBlock(css) {
  const themeStart = css.indexOf('@theme');
  if (themeStart === -1) return { start: -1, end: -1, content: '' };

  const openBrace = css.indexOf('{', themeStart);
  if (openBrace === -1) return { start: -1, end: -1, content: '' };

  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }

  if (closeBrace === -1) return { start: -1, end: -1, content: '' };
  return { start: themeStart, end: closeBrace, content: css.slice(openBrace + 1, closeBrace) };
}

export function parseTokens(css) {
  // Find layer boundaries in ORIGINAL css (before comment normalization)
  const { layer2Pos, layer3Pos } = findLayerBoundaries(css);
  const normalized = normalizeComments(css);
  const themeBlock = findThemeBlock(normalized);

  // Extract the body before @theme (or the entire file if no @theme)
  const bodyEnd = themeBlock.start === -1 ? normalized.length : themeBlock.start;
  const body = normalized.slice(0, bodyEnd);

  const tokens = new Map();
  // Use matchAll with a regex that tracks position via lastIndex
  const declRegex = new RegExp(DECL.source, DECL.flags);
  let match;
  while ((match = declRegex.exec(body))) {
    const name = match[1];
    const raw = match[2];
    const declPos = match.index;

    if (tokens.has(name)) continue; // first declaration = light value; .dark rebinds come later
    const value = raw.trim().replace(/\s+/g, ' ');
    // Determine layer based on position of first declaration
    let layer;
    if (declPos < layer2Pos) {
      layer = 'primitive';
    } else if (declPos < layer3Pos) {
      layer = 'semantic';
    } else {
      layer = 'contract';
    }
    tokens.set(name, { name, value, layer });
  }

  // @theme --color-X: var(--Y): walk Y's var() chain and tag each token with utility X.
  if (themeBlock.start !== -1) {
    for (const [, name, raw] of themeBlock.content.matchAll(DECL)) {
      const colour = name.match(/^--color-(.+)$/)?.[1];
      if (!colour) continue;
      let ref = raw.trim().replace(/\s+/g, ' ').match(VAR_REF)?.[1];
      const seen = new Set();
      while (ref && tokens.has(ref) && !seen.has(ref)) {
        seen.add(ref);
        const token = tokens.get(ref);
        token.utility ??= colour;
        ref = token.value.match(VAR_REF)?.[1];
      }
    }
  }
  return [...tokens.values()];
}

// Value exports that are intentionally not React components, or that docgen cannot see.
// Filled from the first real run (Task 5 step 3); every entry needs a one-line reason.
export const NON_COMPONENT_EXPORTS = new Set([]);

export function barrelExports(indexSource) {
  const names = new Set();
  for (const [, typeKw, list] of indexSource.matchAll(/export\s+(type\s+)?\{([^}]*)\}\s*from/g)) {
    if (typeKw) continue;
    for (const part of list.split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) names.add(name);
    }
  }
  return names;
}

export function storybookId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function storyTitle(storiesSource) {
  return storiesSource.match(/\btitle:\s*['"]([^'"]+)['"]/)?.[1] ?? null;
}

const typeString = (t) => (t.name === 'enum' ? t.raw ?? t.value.map((v) => v.value).join(' | ') : t.raw ?? t.name);

export function componentsFromDocs(docs, { exported, storyTitles }) {
  const seen = new Set();
  const out = [];
  for (const d of docs) {
    if (!exported.has(d.displayName) || seen.has(d.displayName)) continue;
    seen.add(d.displayName);
    const group = d.filePath.split(/[\\/]components[\\/]/)[1]?.split(/[\\/]/)[0] ?? d.displayName;
    const title = storyTitles[group];
    out.push({
      name: d.displayName,
      group,
      description: (d.description ?? '').trim(),
      storybook: title ? storybookId(title) : null,
      props: Object.values(d.props ?? {})
        .map((p) => ({
          name: p.name,
          type: typeString(p.type),
          required: Boolean(p.required),
          default: p.defaultValue?.value ?? null,
          description: (p.description ?? '').trim(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function missingComponents(exported, components, allow) {
  const have = new Set(components.map((c) => c.name));
  return [...exported].filter((n) => /^[A-Z]/.test(n) && !have.has(n) && !allow.has(n)).sort();
}

export function runDocgen(files, { root = process.cwd() } = {}) {
  const docgen = require('react-docgen-typescript');
  const parser = docgen.withCustomConfig(path.join(root, 'tsconfig.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes('node_modules'),
  });
  return parser.parse(files.map((f) => path.resolve(root, f)));
}
