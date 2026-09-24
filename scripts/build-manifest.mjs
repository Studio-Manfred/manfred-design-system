// Builds dist/manifest.json + dist/migrations.json for the Manfred DS CLI
// (Linear project "Manfred DS CLI"). Pure functions are exported for tests;
// main() does the I/O and runs as the last postbuild step.

import { createRequire } from 'node:module';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

const DECL = /(--[\w-]+)\s*:\s*([^;]+);/g;
const VAR_REF = /^var\((--[\w-]+)\)$/;
const TYPES_REACT = /node_modules[\\/]@types[\\/]react[\\/]/;
// TypeScript's own bundled lib declarations (Boolean/Number/Object/...
// prototypes). Never real component API from any library — see the
// ChartContainer note on `propFilter` below.
const TS_LIB = /node_modules[\\/]typescript[\\/]lib[\\/]/;

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
export const NON_COMPONENT_EXPORTS = new Set([
  // String constant ('page-body'), not a component — react-docgen-typescript only parses component files.
  'PAGE_SHELL_DEFAULT_MAIN_ID',
]);

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

function deepFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

const typeString = (t) => (t.name === 'enum' ? t.raw ?? t.value.map((v) => v.value).join(' | ') : t.raw ?? t.name);

export function componentsFromDocs(docs, { exported, storyTitles }) {
  const seen = new Set();
  const out = [];
  for (const d of docs) {
    if (!exported.has(d.displayName) || seen.has(d.displayName) || !/^[A-Z]/.test(d.displayName)) continue;
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
    // Exclude ONLY the generic DOM/HTML/SVG attribute surface, i.e. props
    // declared in @types/react — not library component API. Radix (e.g.
    // asChild from @radix-ui/react-primitive) and recharts config props
    // have their own node_modules parent/declarations and must be kept.
    //
    // Separately (not a DOM-vs-library judgment call): ChartContainer's
    // file also exports `usePrefersReducedMotion` (returns `boolean`),
    // which trips a react-docgen-typescript bug that misattributes
    // ChartContainer's props to a JS primitive wrapper's own prototype
    // (Boolean/Number, e.g. `valueOf`, `toFixed`) instead of
    // ChartContainerProps. Those "props" are declared inside TypeScript's
    // own bundled lib.*.d.ts and can never be real component API from any
    // library, so they're excluded unconditionally.
    propFilter: (prop) => {
      const excluded = (fileName) => TYPES_REACT.test(fileName) || TS_LIB.test(fileName);
      if (excluded(prop.parent?.fileName ?? '')) return false;
      // Props inherited via a mapped/utility type over React.DOMAttributes
      // (e.g. some Radix primitives) have no single `parent` interface, but
      // every declaration site still resolves into @types/react.
      if (prop.declarations?.length && prop.declarations.every((d) => excluded(d.fileName))) return false;
      return true;
    },
  });
  return parser.parse(files.map((f) => path.resolve(root, f)));
}

export const SETUP = deepFreeze({
  cssImports: ['@studio-manfred/manfred-design-system/tokens.css'],
  sourceGlob: 'node_modules/@studio-manfred/manfred-design-system/dist',
  registry: { scope: '@studio-manfred', url: 'https://npm.pkg.github.com' },
  mcp: { name: 'manfred-design-system', url: 'https://main--6a26cfd37771192ff26832bf.chromatic.com/mcp' },
  nextUseClientSince: '0.23.0',
});

export function buildManifest({ pkg, components, tokens }) {
  return {
    schemaVersion: 1,
    package: { name: pkg.name, version: pkg.version },
    components,
    tokens,
    peerDependencies: { ...(pkg.peerDependencies ?? {}) },
    setup: structuredClone(SETUP),
  };
}

const validators = {};
export function validate(kind, data) {
  if (!validators[kind]) {
    const Ajv = require('ajv/dist/2020').default;
    const schema = JSON.parse(readFileSync(path.join(HERE, `${kind}.schema.json`), 'utf8'));
    validators[kind] = new Ajv({ allErrors: true }).compile(schema);
  }
  return validators[kind](data) ? [] : validators[kind].errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

const semverTuple = (v) => v.split('.').map(Number);
const compareVersions = (a, b) => {
  const x = semverTuple(a), y = semverTuple(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

export function checkMigrations(list) {
  const errors = validate('migrations', list);
  if (errors.length) return errors;
  for (let i = 1; i < list.length; i++) {
    if (compareVersions(list[i].version, list[i - 1].version) <= 0) {
      errors.push(`order: ${list[i].version} comes after ${list[i - 1].version}`);
    }
  }
  return errors;
}

function componentFiles(root) {
  const dir = path.join(root, 'src/components');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync(path.join(dir, d.name))
      .filter((f) => /\.tsx$/.test(f) && !/\.(test|stories)\.tsx$/.test(f))
      .map((f) => path.join('src/components', d.name, f)));
}

function storyTitles(root) {
  const dir = path.join(root, 'src/components');
  const out = {};
  for (const d of readdirSync(dir, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    const file = path.join(dir, d.name, `${d.name}.stories.tsx`);
    if (existsSync(file)) {
      const title = storyTitle(readFileSync(file, 'utf8'));
      if (title) out[d.name] = title;
    }
  }
  return out;
}

export async function main({
  root = process.cwd(), log = console.log, error = console.error, exit = process.exit,
  write = (file, text) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, text); },
} = {}) {
  const read = (f) => readFileSync(path.join(root, f), 'utf8');
  const pkg = JSON.parse(read('package.json'));
  const exported = barrelExports(read('src/index.ts'));
  const components = componentsFromDocs(runDocgen(componentFiles(root), { root }), { exported, storyTitles: storyTitles(root) });
  const tokens = parseTokens(read('src/tokens/tokens.css'));
  const manifest = buildManifest({ pkg, components, tokens });
  const migrations = JSON.parse(read('migrations.json'));

  const problems = [
    ...missingComponents(exported, components, NON_COMPONENT_EXPORTS)
      .map((n) => `no docgen entry for exported component ${n} (add to NON_COMPONENT_EXPORTS with a reason if intended)`),
    ...validate('manifest', manifest).map((e) => `manifest ${e}`),
    ...checkMigrations(migrations).map((e) => `migrations ${e}`),
  ];
  if (problems.length) {
    for (const p of problems) error(`✗ ${p}`);
    exit(1);
    return;
  }
  write(path.join(root, 'dist/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  write(path.join(root, 'dist/migrations.json'), JSON.stringify(migrations, null, 2) + '\n');
  log(`✓ dist/manifest.json (${components.length} components, ${tokens.length} tokens), dist/migrations.json (${migrations.length} entries)`);
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (invokedDirectly) {
  main().catch((e) => { console.error(e); process.exit(2); });
}
