import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseBarrelComponents,
  extractImportSpecifiers,
  packageNameFromSpec,
  collectDependencies,
  parseStoriesMeta,
  sanitize,
  storyNameFromExport,
  storyIdFor,
  buildRegistryEntry,
  buildRegistry,
  main,
} from '../build-registry.mjs';

describe('parseBarrelComponents', () => {
  it('collects component dir names from ./components/<Name> re-exports, deduped', () => {
    const barrel = `
export { Button } from './components/Button';
export type { ButtonProps } from "./components/Button";
export { Card, CardHeader } from './components/Card';
export * from './tokens';
export { cn } from './lib/utils';
`;
    expect([...parseBarrelComponents(barrel)]).toEqual(['Button', 'Card']);
  });

  it('ignores nested paths beyond the component dir name', () => {
    // `[A-Za-z0-9]+` stops at '/', so the closing quote must follow directly.
    expect([...parseBarrelComponents(`export { X } from './components/Foo/sub';`)]).toEqual([]);
  });
});

describe('extractImportSpecifiers', () => {
  it('finds named, default, type, re-export, multi-line and side-effect imports', () => {
    const src = `import * as React from 'react';
import type { VariantProps } from "class-variance-authority";
import {
  a,
  b,
} from '@radix-ui/react-dialog';
export { thing } from './thing';
import 'tw-animate-css';
`;
    expect([...extractImportSpecifiers(src)].sort()).toEqual(
      ['./thing', '@radix-ui/react-dialog', 'class-variance-authority', 'react', 'tw-animate-css'].sort(),
    );
  });

  it('ignores "from" inside JSDoc prose', () => {
    const src = `/**\n * Derives the label from "Acme Co." data.\n */\nexport const x = 1;\n`;
    expect([...extractImportSpecifiers(src)]).toEqual([]);
  });
});

describe('packageNameFromSpec', () => {
  it.each([
    ['lucide-react', 'lucide-react'],
    ['date-fns/locale', 'date-fns'],
    ['@radix-ui/react-slot', '@radix-ui/react-slot'],
    ['@radix-ui/react-slot/dist/x', '@radix-ui/react-slot'],
  ])('%s -> %s', (spec, pkg) => {
    expect(packageNameFromSpec(spec)).toBe(pkg);
  });

  it.each(['./Button', '../lib', '@/lib/utils', 'react', 'react-dom', 'react/jsx-runtime'])(
    'drops %s (relative, alias, or React)',
    (spec) => {
      expect(packageNameFromSpec(spec)).toBeNull();
    },
  );
});

describe('parseStoriesMeta', () => {
  it('reads the meta title and the first `: <X>Story` export', () => {
    const src = `
const meta = { title: 'Components/DatePicker' } satisfies Meta;
export const WithValue: Story = {};
export const Other: Story = {};
`;
    expect(parseStoriesMeta(src)).toEqual({ title: 'Components/DatePicker', primaryExport: 'WithValue' });
  });

  it('accepts double-quoted titles and non-`Story` aliases ending in Story', () => {
    const src = `const meta = { title: "Foundation/Chart" };\nexport const Bars: AnyStory = {};`;
    expect(parseStoriesMeta(src)).toEqual({ title: 'Foundation/Chart', primaryExport: 'Bars' });
  });

  it('skips untyped exports when looking for the primary story', () => {
    const src = `const meta = { title: 'Components/X' };\nexport const helper = 1;\nexport const Default: Story = {};`;
    expect(parseStoriesMeta(src).primaryExport).toBe('Default');
  });

  it('returns nulls when there is no stories file (null source)', () => {
    expect(parseStoriesMeta(null)).toEqual({ title: null, primaryExport: null });
  });

  it('returns null fields when title / typed export are absent', () => {
    expect(parseStoriesMeta('export default {};')).toEqual({ title: null, primaryExport: null });
  });
});

describe('Storybook id helpers', () => {
  it('sanitize lowercases and collapses non-alphanumerics without camelCase split', () => {
    expect(sanitize('Components/DatePicker')).toBe('components-datepicker');
    expect(sanitize('--Layout / Page Shell--')).toBe('layout-page-shell');
  });

  it.each([
    ['Default', 'default'],
    ['WithValue', 'with-value'],
    ['Size2XL', 'size-2-xl'],
    ['with_underscore', 'with-underscore'],
    ['HTMLContent', 'html-content'],
  ])('storyNameFromExport(%s) -> %s', (key, slug) => {
    expect(storyNameFromExport(key)).toBe(slug);
  });

  it('storyIdFor joins title slug and story slug with --', () => {
    expect(storyIdFor('Radio', 'Components/RadioGroup', 'Default')).toBe('components-radiogroup--default');
  });

  it('storyIdFor falls back to Components/<Name> and --docs', () => {
    expect(storyIdFor('Button', null, null)).toBe('components-button--docs');
  });
});

describe('buildRegistryEntry', () => {
  it('builds a component row from its stories source', () => {
    expect(
      buildRegistryEntry({
        name: 'DatePicker',
        storiesSource: `const meta = { title: 'Components/DatePicker' };\nexport const WithValue: Story = {};`,
        dependencies: ['date-fns', 'react-day-picker'],
      }),
    ).toEqual({
      name: 'DatePicker',
      type: 'component',
      story: 'components-datepicker--with-value',
      dependencies: ['date-fns', 'react-day-picker'],
    });
  });

  it('marks layout primitives as type=layout', () => {
    const entry = buildRegistryEntry({
      name: 'Stack',
      storiesSource: `const meta = { title: 'Layout/Stack' };\nexport const Vertical: Story = {};`,
      dependencies: [],
    });
    expect(entry.type).toBe('layout');
    expect(entry.story).toBe('layout-stack--vertical');
  });

  it('falls back to the docs story when the component has no stories file', () => {
    const entry = buildRegistryEntry({ name: 'Widget', storiesSource: null, dependencies: [] });
    expect(entry).toEqual({ name: 'Widget', type: 'component', story: 'components-widget--docs', dependencies: [] });
  });

  it('keys are in the published order: name, type, story, dependencies', () => {
    const entry = buildRegistryEntry({ name: 'A', storiesSource: null, dependencies: [] });
    expect(Object.keys(entry)).toEqual(['name', 'type', 'story', 'dependencies']);
  });
});

describe('filesystem: collectDependencies, buildRegistry, main', () => {
  let root;
  const write = (rel, content) => {
    const p = join(root, rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, content);
  };

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'registry-'));
    write(
      'src/index.ts',
      `export { Button } from './components/Button';\nexport { Stack } from './components/Stack';\nexport { Ghost } from './components/Ghost';\n`,
    );
    write(
      'src/components/Button/Button.tsx',
      `import * as React from 'react';\nimport { Slot } from '@radix-ui/react-slot';\nimport { cva } from 'class-variance-authority';\nimport { cn } from '@/lib/utils';\n`,
    );
    write('src/components/Button/useButton.ts', `import { format } from 'date-fns/format';\n`);
    write('src/components/Button/Button.test.tsx', `import { render } from '@testing-library/react';\n`);
    write(
      'src/components/Button/Button.stories.tsx',
      `import { expect } from 'storybook/test';\nconst meta = { title: 'Components/Button' };\nexport const Primary: Story = {};\n`,
    );
    write('src/components/Button/README.md', `import x from 'should-not-count';\n`);
    write('src/components/Stack/Stack.tsx', `import { cn } from '@/lib/utils';\n`);
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('collectDependencies: sorted external deps from source files, excluding tests, stories and non-TS', () => {
    expect(collectDependencies(join(root, 'src/components/Button'))).toEqual([
      '@radix-ui/react-slot',
      'class-variance-authority',
      'date-fns',
    ]);
  });

  it('buildRegistry: one sorted row per barrel component, skipping (with a warning) missing dirs', () => {
    const warnings = [];
    const rows = buildRegistry({ root, warn: (m) => warnings.push(m) });
    expect(rows.map((r) => r.name)).toEqual(['Button', 'Stack']);
    expect(rows[0]).toEqual({
      name: 'Button',
      type: 'component',
      story: 'components-button--primary',
      dependencies: ['@radix-ui/react-slot', 'class-variance-authority', 'date-fns'],
    });
    expect(rows[1]).toEqual({ name: 'Stack', type: 'layout', story: 'components-stack--docs', dependencies: [] });
    expect(warnings).toEqual(['skip: Ghost — no directory at src/components/Ghost']);
  });

  it('main: writes pretty-printed registry.json with a trailing newline and logs the count', () => {
    const logs = [];
    const outDir = join(root, 'out', 'static');
    const written = main({ root, outDir, log: (m) => logs.push(m), warn: () => {} });
    const file = readFileSync(join(outDir, 'registry.json'), 'utf8');
    expect(file).toBe(JSON.stringify(written, null, 2) + '\n');
    expect(JSON.parse(file)).toHaveLength(2);
    expect(logs).toEqual(['wrote registry.json with 2 components']);
  });

  it('main: output is idempotent across runs', () => {
    const outDir = join(root, 'out');
    main({ root, outDir, log: () => {}, warn: () => {} });
    const first = readFileSync(join(outDir, 'registry.json'), 'utf8');
    main({ root, outDir, log: () => {}, warn: () => {} });
    expect(readFileSync(join(outDir, 'registry.json'), 'utf8')).toBe(first);
  });
});
