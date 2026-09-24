// Builds dist/manifest.json + dist/migrations.json for the Manfred DS CLI
// (Linear project "Manfred DS CLI"). Pure functions are exported for tests;
// main() does the I/O and runs as the last postbuild step.

const DECL = /(--[\w-]+)\s*:\s*([^;]+);/g;
const VAR_REF = /^var\((--[\w-]+)\)$/;

export function parseTokens(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const themeAt = clean.indexOf('@theme');
  const body = themeAt === -1 ? clean : clean.slice(0, themeAt);
  const theme = themeAt === -1 ? '' : clean.slice(themeAt);

  const tokens = new Map();
  for (const [, name, raw] of body.matchAll(DECL)) {
    if (tokens.has(name)) continue; // first declaration = light value; .dark rebinds come later
    const value = raw.trim();
    const layer = name.startsWith('--color-') ? 'semantic' : value.includes('var(') ? 'contract' : 'primitive';
    tokens.set(name, { name, value, layer });
  }

  // @theme --color-X: var(--Y): walk Y's var() chain and tag each token with utility X.
  for (const [, name, raw] of theme.matchAll(DECL)) {
    const colour = name.match(/^--color-(.+)$/)?.[1];
    if (!colour) continue;
    let ref = raw.trim().match(VAR_REF)?.[1];
    const seen = new Set();
    while (ref && tokens.has(ref) && !seen.has(ref)) {
      seen.add(ref);
      const token = tokens.get(ref);
      token.utility ??= colour;
      ref = token.value.match(VAR_REF)?.[1];
    }
  }
  return [...tokens.values()];
}
