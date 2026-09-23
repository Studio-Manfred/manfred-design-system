import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  stripImports,
  buildTokensExport,
  banner,
  STRIP_IMPORTS,
  main,
} from '../build-tokens-export.mjs';

const TOKENS = `@import "tailwindcss";
@import 'tw-animate-css';
@import "./fonts.css";

:root {
  --blue-500: #0000ff;
}

@theme inline {
  --color-primary: var(--blue-500);
}
`;

describe('STRIP_IMPORTS', () => {
  it('strips exactly the DS-internal Tailwind dependencies', () => {
    expect(STRIP_IMPORTS).toEqual(['tailwindcss', 'tw-animate-css']);
  });
});

describe('stripImports', () => {
  it('removes the tailwindcss and tw-animate-css imports in either quote style', () => {
    const out = stripImports(TOKENS);
    expect(out).not.toMatch(/@import\s+["']tailwindcss["']/);
    expect(out).not.toMatch(/@import\s+["']tw-animate-css["']/);
  });

  it('keeps other @import lines', () => {
    expect(stripImports(TOKENS)).toContain('@import "./fonts.css";');
  });

  it('keeps the :root and @theme blocks byte-for-byte', () => {
    const out = stripImports(TOKENS);
    expect(out).toContain(':root {\n  --blue-500: #0000ff;\n}');
    expect(out).toContain('@theme inline {\n  --color-primary: var(--blue-500);\n}');
    expect(out.endsWith(TOKENS.slice(TOKENS.indexOf(':root')))).toBe(true);
  });

  it('does not strip sub-path or prefixed imports of the same packages', () => {
    const src = '@import "tailwindcss/theme";\n@import "my-tailwindcss";\n';
    expect(stripImports(src)).toBe(src);
  });

  // STU-879: every syntactic form of an import of a stripped package goes.
  it.each([
    ['double quotes', '@import "tailwindcss";\n:root {}\n'],
    ['single quotes', "@import 'tailwindcss';\n:root {}\n"],
    ['layer() modifier', '@import "tailwindcss" layer(base);\n:root {}\n'],
    ['source() modifier', '@import "tailwindcss" source(none);\n:root {}\n'],
    ['stacked modifiers', '@import "tailwindcss" layer(base) supports(display: grid) screen;\n:root {}\n'],
    ['url() with double quotes', '@import url("tailwindcss");\n:root {}\n'],
    ["url() with single quotes", "@import url('tw-animate-css');\n:root {}\n"],
    ['unquoted url()', '@import url(tailwindcss);\n:root {}\n'],
    ['url() with modifier', '@import url("tailwindcss") layer(base);\n:root {}\n'],
    ['trailing spaces before newline', '@import "tailwindcss";   \n:root {}\n'],
    ['following blank lines (as today)', '@import "tailwindcss";\n\n:root {}\n'],
  ])('strips an import with %s', (_label, src) => {
    expect(stripImports(src)).toBe(':root {}\n');
  });

  it.each([
    ['no trailing newline', ':root {}\n@import "tailwindcss";', ':root {}\n'],
    ['no trailing newline, modifier', ':root {}\n@import "tailwindcss" layer(base);', ':root {}\n'],
    ['only an import', "@import 'tw-animate-css';", ''],
    ['trailing whitespace, no newline', ':root {}\n@import url(tailwindcss);  ', ':root {}\n'],
  ])('strips an import on the last line with %s', (_label, src, expected) => {
    expect(stripImports(src)).toBe(expected);
  });

  it.each([
    ['prefixed package', '@import "tailwindcss-foo";\n'],
    ['prefixed package with modifier', '@import "tailwindcss-foo" layer(base);\n'],
    ['relative path', '@import "./other.css";\n'],
    ['url() of another package', '@import url("tailwindcss-foo");\n'],
    ['unquoted url() of a sub-path', '@import url(tailwindcss/theme);\n'],
    ['sub-path in single quotes', "@import 'tw-animate-css/utilities';\n"],
    ['prefixed package, no trailing newline', '@import "tailwindcss-foo";'],
  ])('keeps a non-stripped import: %s', (_label, src) => {
    expect(stripImports(src)).toBe(src);
  });

  it('treats strip-list names literally, not as regex', () => {
    const src = '@import "aXb";\n';
    expect(stripImports(src, ['a.b'])).toBe(src);
    expect(stripImports('@import "a.b";\n', ['a.b'])).toBe('');
  });

  it('does not strip an import that is not at the start of a line', () => {
    const src = '/* @import "tailwindcss"; */\n  @import "tailwindcss";\n';
    expect(stripImports(src)).toBe(src);
  });

  it('handles CRLF line endings', () => {
    expect(stripImports('@import "tailwindcss";\r\n:root {}\r\n')).toBe(':root {}\r\n');
  });

  it('is a no-op on input with nothing to strip', () => {
    const src = ':root { --x: 1px; }\n';
    expect(stripImports(src)).toBe(src);
  });

  it('honours a custom strip list', () => {
    const out = stripImports('@import "a";\n@import "b";\n', ['a']);
    expect(out).toBe('@import "b";\n');
  });
});

describe('buildTokensExport', () => {
  it('prepends the DO-NOT-EDIT banner to the stripped source', () => {
    const out = buildTokensExport(TOKENS);
    expect(out.startsWith(banner)).toBe(true);
    expect(out.slice(banner.length)).toBe(stripImports(TOKENS));
  });

  it('banner is a preserved (/*!) comment that tells consumers how to import', () => {
    expect(banner.startsWith('/*!')).toBe(true);
    expect(banner).toContain('@import "@studio-manfred/manfred-design-system/tokens.css";');
    expect(banner).toContain('DO NOT EDIT');
  });
});

describe('main', () => {
  let dir;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tokens-export-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('writes the export to outPath, creating missing directories', () => {
    const srcPath = join(dir, 'tokens.css');
    const outPath = join(dir, 'nested', 'dist', 'tokens.css');
    writeFileSync(srcPath, TOKENS);
    const logs = [];
    const written = main({ srcPath, outPath, log: (m) => logs.push(m) });
    expect(readFileSync(outPath, 'utf8')).toBe(buildTokensExport(TOKENS));
    expect(written).toBe(buildTokensExport(TOKENS));
    expect(logs).toEqual([`wrote ${outPath} (${Buffer.byteLength(written)} bytes)`]);
  });

  it('logs the UTF-8 byte size, not the string length (banner has multi-byte chars)', () => {
    const srcPath = join(dir, 'tokens.css');
    const outPath = join(dir, 'tokens-out.css');
    writeFileSync(srcPath, TOKENS);
    const logs = [];
    const written = main({ srcPath, outPath, log: (m) => logs.push(m) });
    const bytes = readFileSync(outPath).length;
    expect(bytes).toBeGreaterThan(written.length);
    expect(logs).toEqual([`wrote ${outPath} (${bytes} bytes)`]);
  });

  it('throws when the source file is missing', () => {
    expect(() =>
      main({ srcPath: join(dir, 'nope.css'), outPath: join(dir, 'out.css'), log: () => {} }),
    ).toThrow(/ENOENT/);
  });
});

describe('real src/tokens/tokens.css', () => {
  it('exports without any DS-internal import and keeps the @theme block', () => {
    const src = readFileSync(join(process.cwd(), 'src/tokens/tokens.css'), 'utf8');
    const out = buildTokensExport(src);
    expect(out).not.toMatch(/^@import\s+["'](tailwindcss|tw-animate-css)["']/m);
    expect(out).toMatch(/@theme inline\s*\{/);
  });
});
