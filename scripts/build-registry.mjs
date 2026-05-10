// Emit a shadcn-shape registry.json beside Storybook's auto-emitted index.json.
// Lets external AI tools (Claude, Cursor, etc.) discover components without
// running Storybook locally — the file ships at:
//   https://studio-manfred.github.io/manfred-design-system/registry.json
//
// Usage:
//   node scripts/build-registry.mjs            # writes storybook-static/registry.json
//
// Reads `src/index.ts` to find which components are publicly exported, then for
// each component dir under `src/components/<Name>/` parses the corresponding
// `Component.tsx` for external (npm-packaged) imports and `Component.stories.tsx`
// for the canonical primary story ID. Idempotent: same input -> same output.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');
const BARREL = path.join(ROOT, 'src', 'index.ts');
const OUT_DIR = path.join(ROOT, 'storybook-static');
const OUT_FILE = path.join(OUT_DIR, 'registry.json');

// Layout primitives — composition / spacing helpers rather than UI controls.
// Surfaced as type=layout so AI tools can treat them differently from inputs.
const LAYOUT_COMPONENTS = new Set([
  'Container',
  'Grid',
  'Stack',
  'PageBackground',
  'PageShell',
]);

// React + Storybook + relative imports are noise in a "what npm packages does
// this component need" answer. Anything starting with '.', '@/', or matching
// these names is dropped.
const SKIP_PACKAGES = new Set(['react', 'react-dom', 'react/jsx-runtime']);

// Extract every public-barrel component name. We grep for `from './components/<Name>'`
// so we naturally skip './tokens' and any non-component re-exports. Returns a
// Set of PascalCase directory names — duplicates collapse (e.g. Card + CardHeader
// both come from ./components/Card).
function readBarrelComponents() {
  const src = fs.readFileSync(BARREL, 'utf8');
  const re = /from\s+['"]\.\/components\/([A-Za-z0-9]+)['"]/g;
  const out = new Set();
  let m;
  while ((m = re.exec(src)) !== null) out.add(m[1]);
  return out;
}

// Pull every `from '<spec>'` import specifier out of a TS/TSX source string.
// We anchor on lines that begin with `import` or `export` (with optional
// leading whitespace) so jsdoc text like `derive from "Acme Co."` doesn't
// pollute the dep set. Multi-line imports still match because the `from` lands
// on its own line that starts with whitespace + `}` — handled by also matching
// `}\s*from`. Misses dynamic imports, but no component file uses those at the
// top level.
function extractImportSpecifiers(src) {
  const specs = new Set();
  const lineRe = /^(?:\s*)(?:import|export)\b[^;]*?from\s+['"]([^'"]+)['"]/gm;
  let m;
  while ((m = lineRe.exec(src)) !== null) specs.add(m[1]);
  // Bare `import 'foo';` (side-effect imports) — also legitimate npm refs.
  const sideEffectRe = /^(?:\s*)import\s+['"]([^'"]+)['"]/gm;
  while ((m = sideEffectRe.exec(src)) !== null) specs.add(m[1]);
  return specs;
}

// '@radix-ui/react-slot' -> '@radix-ui/react-slot' (scoped package, two segments).
// 'date-fns/locale' -> 'date-fns'. 'lucide-react' -> 'lucide-react'.
// Returns null for relative ('.' / '..' / '@/...') or skipped packages.
function packageNameFromSpec(spec) {
  if (spec.startsWith('.') || spec.startsWith('@/')) return null;
  const parts = spec.split('/');
  const pkg = spec.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
  if (SKIP_PACKAGES.has(pkg)) return null;
  return pkg;
}

// Walk the component dir, collect external deps from every .ts/.tsx that isn't
// a test or a story. We deliberately include sibling files (e.g. DatePicker's
// useDatePickerState.ts) because those are part of the published surface.
function collectDependencies(componentDir) {
  const deps = new Set();
  const entries = fs.readdirSync(componentDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    if (/\.test\.tsx?$/.test(e.name)) continue;
    if (/\.stories\.tsx?$/.test(e.name)) continue;
    const src = fs.readFileSync(path.join(componentDir, e.name), 'utf8');
    for (const spec of extractImportSpecifiers(src)) {
      const pkg = packageNameFromSpec(spec);
      if (pkg) deps.add(pkg);
    }
  }
  return [...deps].sort();
}

// Read the stories file and pull out (a) the meta `title` and (b) the first
// `export const <Name>: <SomeStoryType>`. Most files type-alias to `Story`, but
// Chart uses `AnyStory` — so we match anything ending in `Story`.
// Title can live under any of: `title: '...'`, `title: "..."` — we accept both.
// Returns { title, primaryExport } with either field nullable.
function readStoriesMeta(componentDir, componentName) {
  const storiesPath = path.join(componentDir, `${componentName}.stories.tsx`);
  if (!fs.existsSync(storiesPath)) return { title: null, primaryExport: null };
  const src = fs.readFileSync(storiesPath, 'utf8');
  const titleMatch = src.match(/title:\s*['"]([^'"]+)['"]/);
  const exportMatch = src.match(/export\s+const\s+([A-Za-z0-9_]+)\s*:\s*[A-Za-z0-9_]*Story\b/);
  return {
    title: titleMatch ? titleMatch[1] : null,
    primaryExport: exportMatch ? exportMatch[1] : null,
  };
}

// Storybook's `sanitize` from @storybook/csf — lowercase + replace runs of
// non-alnum with '-'. NO camelCase split. Used for the title portion.
// `Components/DatePicker` -> `components-datepicker`.
function sanitize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Storybook's `storyNameFromExport(key)` runs `toStartCaseStr` first, splitting
// on case/digit boundaries before sanitize collapses the spaces. So
// `WithValue` -> `With Value` -> `with-value`. We mirror the relevant parts
// of toStartCaseStr (case/digit boundaries; underscores/dashes/dots already
// land in sanitize cleanly).
function storyNameFromExport(key) {
  const startCase = key
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\./g, ' ')
    .replace(/([^\n])([A-Z])([a-z])/g, (_m, a, b, c) => `${a} ${b}${c}`)
    .replace(/([a-z])([A-Z])/g, (_m, a, b) => `${a} ${b}`)
    .replace(/([a-z])([0-9])/gi, (_m, a, b) => `${a} ${b}`)
    .replace(/([0-9])([a-z])/gi, (_m, a, b) => `${a} ${b}`)
    .replace(/ +/g, ' ')
    .trim();
  return sanitize(startCase);
}

// Build the canonical Storybook story ID. Most components title themselves
// 'Components/<Name>', but layout primitives use 'Layout/<Name>', Logo and
// Typography use 'Foundation/<Name>', and Radio uses 'Components/RadioGroup'.
// We always read the actual title from the stories file rather than guessing.
// If a primary `: Story` export isn't found, fall back to '--docs' (autodocs).
function storyIdFor(componentName, title, primaryExport) {
  const titleSlug = sanitize(title || `Components/${componentName}`);
  const storySlug = primaryExport ? storyNameFromExport(primaryExport) : 'docs';
  return `${titleSlug}--${storySlug}`;
}

const components = [...readBarrelComponents()].sort();
const out = [];
for (const name of components) {
  const dir = path.join(COMPONENTS_DIR, name);
  if (!fs.existsSync(dir)) {
    console.warn(`skip: ${name} — no directory at src/components/${name}`);
    continue;
  }
  const { title, primaryExport } = readStoriesMeta(dir, name);
  out.push({
    name,
    type: LAYOUT_COMPONENTS.has(name) ? 'layout' : 'component',
    story: storyIdFor(name, title, primaryExport),
    dependencies: collectDependencies(dir),
  });
}

// Belt-and-braces: validate the JSON we are about to write by round-tripping
// through JSON.parse(JSON.stringify(...)). If the structure cannot survive a
// round trip the build fails here, before storybook-static/registry.json is
// written, which keeps a corrupt file off GH Pages.
const validated = JSON.parse(JSON.stringify(out));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(validated, null, 2) + '\n');

console.log(`wrote registry.json with ${validated.length} components`);
