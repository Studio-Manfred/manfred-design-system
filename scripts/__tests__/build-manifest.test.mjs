import { describe, expect, it } from 'vitest';
import { readFileSync, mkdtempSync, symlinkSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseTokens, barrelExports, storybookId, storyTitle, componentsFromDocs, missingComponents, zeroPropProblems, HTML_WRAPPER_COMPONENTS, PROP_OVERRIDES, runDocgen, buildManifest, validate, SETUP, checkMigrations, main } from '../build-manifest.mjs';

const CSS = `
@import "tailwindcss";
:root {
  /* LAYER 1: PRIMITIVE TOKENS */
  --blue-500: #2c28ec;  /* Business Blue */
  --neutral-900: #1e1e24;
  --space-4: 1rem;
  /* LAYER 2: SEMANTIC TOKENS */
  --color-text-primary: var(--neutral-900);
  --color-bg-brand: var(--blue-500);
  /* LAYER 3: SHADCN CONTRACT */
  --foreground: var(--color-text-primary);
  --primary: var(--color-bg-brand);
}
.dark { --color-text-primary: #ffffff; }
@theme inline {
  --color-foreground: var(--foreground);
  --color-card-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-family-base);
}`;

describe('parseTokens', () => {
  const tokens = parseTokens(CSS);
  const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));

  it('classifies layers by section headers', () => {
    expect(byName['--blue-500'].layer).toBe('primitive');
    expect(byName['--space-4'].layer).toBe('primitive');
    expect(byName['--color-text-primary'].layer).toBe('semantic');
    expect(byName['--foreground'].layer).toBe('contract');
  });

  it('strips comments and keeps the light (first) value over .dark', () => {
    expect(byName['--blue-500'].value).toBe('#2c28ec');
    expect(byName['--color-text-primary'].value).toBe('var(--neutral-900)');
  });

  it('collapses whitespace in values', () => {
    const multilineCSS = `:root {
      /* LAYER 1: PRIMITIVE TOKENS */
      --pattern: repeating-linear-gradient(
        -45deg,
        transparent,
        rgba(255, 255, 255, 0.2)
      );
      /* LAYER 2: SEMANTIC TOKENS */
      /* LAYER 3: SHADCN CONTRACT */
    } @theme inline {}`;
    const toks = parseTokens(multilineCSS);
    const pattern = toks.find((t) => t.name === '--pattern');
    expect(pattern.value).not.toContain('\n');
    expect(pattern.value).toContain(' ');
  });

  it('tags the whole var() chain with the first @theme colour name', () => {
    expect(byName['--foreground'].utility).toBe('foreground');
    expect(byName['--color-text-primary'].utility).toBe('foreground');
    expect(byName['--neutral-900'].utility).toBe('foreground');
    expect(byName['--blue-500'].utility).toBe('primary');
  });

  it('excludes @theme declarations themselves and non-colour theme keys', () => {
    expect(byName['--color-foreground']).toBeUndefined();
    expect(byName['--font-sans']).toBeUndefined();
  });

  it('survives a var() cycle', () => {
    const out = parseTokens(`
      :root {
        /* LAYER 1: PRIMITIVE TOKENS */
        --a: var(--b);
        --b: var(--a);
        /* LAYER 2: SEMANTIC TOKENS */
        /* LAYER 3: SHADCN CONTRACT */
      }
      @theme inline { --color-x: var(--a); }
    `);
    expect(out.find((t) => t.name === '--a').utility).toBe('x');
  });

  it('bounds theme parsing to @theme { } block', () => {
    const cssWithExternalColor = `
      :root {
        /* LAYER 1: PRIMITIVE TOKENS */
        --a: #aaa;
        /* LAYER 2: SEMANTIC TOKENS */
        /* LAYER 3: SHADCN CONTRACT */
      }
      @theme inline { --color-x: var(--a); }
      :root { --color-y: var(--a); }
    `;
    const toks = parseTokens(cssWithExternalColor);
    const aToken = toks.find((t) => t.name === '--a');
    expect(aToken.utility).toBe('x');
    const yToken = toks.find((t) => t.name === '--color-y');
    expect(yToken).toBeUndefined();
  });

  it('handles CSS with no @theme block', () => {
    const noThemeCSS = `
      :root {
        /* LAYER 1: PRIMITIVE TOKENS */
        --a: #aaa;
        /* LAYER 2: SEMANTIC TOKENS */
        --b: var(--a);
        /* LAYER 3: SHADCN CONTRACT */
      }
    `;
    const toks = parseTokens(noThemeCSS);
    const aToken = toks.find((t) => t.name === '--a');
    expect(aToken.layer).toBe('primitive');
    expect(aToken.utility).toBeUndefined();
  });

  it('throws if LAYER 2 header is missing', () => {
    const noLayer2 = `
      :root {
        /* LAYER 1: PRIMITIVE TOKENS */
        --a: #aaa;
        /* LAYER 3: SHADCN CONTRACT */
      }
      @theme inline { --color-x: var(--a); }
    `;
    expect(() => parseTokens(noLayer2)).toThrow(/LAYER 2/);
  });

  it('throws if LAYER 3 header is missing', () => {
    const noLayer3 = `
      :root {
        /* LAYER 1: PRIMITIVE TOKENS */
        --a: #aaa;
        /* LAYER 2: SEMANTIC TOKENS */
        --b: var(--a);
      }
      @theme inline { --color-x: var(--a); }
    `;
    expect(() => parseTokens(noLayer3)).toThrow(/LAYER 3/);
  });

  it('classifies real tokens.css correctly', () => {
    const realCSS = readFileSync('src/tokens/tokens.css', 'utf8');
    const toks = parseTokens(realCSS);
    const byName = Object.fromEntries(toks.map((t) => [t.name, t]));

    expect(byName['--blue-500'].layer).toBe('primitive');
    expect(byName['--radius-sm'].layer).toBe('primitive');
    expect(byName['--shadow-focus'].layer).toBe('semantic');
    expect(byName['--size-control-md'].layer).toBe('semantic');
    expect(byName['--size-icon-md'].layer).toBe('semantic');
    expect(byName['--radius'].layer).toBe('contract');
    expect(byName['--brand'].layer).toBe('contract');
    expect(byName['--foreground'].layer).toBe('contract');
    expect(byName['--chart-axis'].layer).toBe('contract');

    const allValuesOneLine = toks.every((t) => !t.value.includes('\n'));
    expect(allValuesOneLine).toBe(true);
  });
});

describe('barrelExports', () => {
  it('keeps value exports, drops type exports, resolves aliases', () => {
    const src = `
export { Button, buttonVariants } from './components/Button';
export type { ButtonProps } from './components/Button';
export {
  RadioGroup,
  RadioGroupItem as RadioItem,
} from './components/Radio';
export * from './tokens';`;
    expect([...barrelExports(src)].sort()).toEqual(['Button', 'RadioGroup', 'RadioItem', 'buttonVariants']);
  });
});

describe('storybook ids', () => {
  it('derives ids and titles like Storybook does', () => {
    expect(storybookId('Components/RadioGroup')).toBe('components-radiogroup');
    expect(storybookId('Layout/PageShell')).toBe('layout-pageshell');
    expect(storyTitle("const meta = {\n  title: 'Components/Button',\n  component: Button,")).toBe('Components/Button');
    expect(storyTitle('export default {}')).toBeNull();
  });
});

const doc = (displayName, filePath, props = {}) => ({ displayName, filePath, description: `${displayName} docs`, props });

describe('componentsFromDocs', () => {
  const docs = [
    doc('Button', '/r/src/components/Button/Button.tsx', {
      variant: { name: 'variant', required: false, description: 'Look', defaultValue: { value: 'primary' },
        type: { name: 'enum', raw: '"primary" | "secondary"', value: [{ value: '"primary"' }, { value: '"secondary"' }] } },
      asChild: { name: 'asChild', required: false, description: '', defaultValue: null, type: { name: 'boolean' } },
    }),
    doc('RadioGroupItem', '/r/src/components/Radio/Radio.tsx'),
    doc('Internal', '/r/src/components/Radio/Radio.tsx'),
  ];
  const out = componentsFromDocs(docs, {
    exported: new Set(['Button', 'RadioGroupItem']),
    storyTitles: { Button: 'Components/Button' },
  });

  it('keeps only exported components, grouped by folder, sorted', () => {
    expect(out.map((c) => [c.name, c.group])).toEqual([['Button', 'Button'], ['RadioGroupItem', 'Radio']]);
  });

  it('maps props with enum raw types and defaults, sorted by name', () => {
    expect(out[0].props).toEqual([
      { name: 'asChild', type: 'boolean', required: false, default: null, description: '' },
      { name: 'variant', type: '"primary" | "secondary"', required: false, default: 'primary', description: 'Look' },
    ]);
    expect(out[0].storybook).toBe('components-button');
    expect(out[1].storybook).toBeNull();
  });

  it('reports PascalCase exports with no docgen entry unless allowlisted', () => {
    expect(missingComponents(new Set(['Button', 'Tabs', 'toast', 'buttonVariants', 'Ghost']), out, new Set(['Ghost'])))
      .toEqual(['Tabs']);
  });

  it('sets extendsDom from the per-component dropped-prop counts', () => {
    const withDropped = componentsFromDocs(docs, {
      exported: new Set(['Button', 'RadioGroupItem']),
      storyTitles: {},
      dropped: { Button: 3 },
    });
    expect(withDropped.find((c) => c.name === 'Button').extendsDom).toBe(true);
    expect(withDropped.find((c) => c.name === 'RadioGroupItem').extendsDom).toBe(false);
    expect(out.every((c) => c.extendsDom === false)).toBe(true); // no counts given → false
  });

  it('merges PROP_OVERRIDES-style hand-written props over docgen props, sorted', () => {
    const merged = componentsFromDocs(docs, {
      exported: new Set(['Button']),
      storyTitles: {},
      overrides: {
        Button: { props: [
          { name: 'zeta', type: 'string', required: false, default: null, description: 'z' },
          { name: 'asChild', type: 'boolean', required: false, default: 'false', description: 'overridden' },
        ] },
      },
    });
    expect(merged[0].props.map((p) => p.name)).toEqual(['asChild', 'variant', 'zeta']);
    expect(merged[0].props[0]).toEqual({ name: 'asChild', type: 'boolean', required: false, default: 'false', description: 'overridden' });
  });
});

describe('zeroPropProblems', () => {
  const c = (name, props = []) => ({ name, props });
  it('flags a zero-prop component that is not allowlisted', () => {
    expect(zeroPropProblems([c('Ghost'), c('Wrapper'), c('Button', [{ name: 'x' }])], new Set(['Wrapper']))).toEqual(['Ghost']);
  });
  it('passes when every zero-prop component is allowlisted', () => {
    expect(zeroPropProblems([c('Wrapper')], new Set(['Wrapper']))).toEqual([]);
  });
  it('allowlists only pure HTML wrappers, never NavItem', () => {
    expect(HTML_WRAPPER_COMPONENTS.has('NavItem')).toBe(false);
    expect(HTML_WRAPPER_COMPONENTS.has('CardHeader')).toBe(true);
  });
});

describe('PROP_OVERRIDES', () => {
  it('every override prop name is declared in the component source, so a rename breaks this test', () => {
    for (const [name, { file, props }] of Object.entries(PROP_OVERRIDES)) {
      const src = readFileSync(file, 'utf8');
      for (const p of props) {
        expect(src, `${name}.${p.name} in ${file}`).toMatch(new RegExp(`\\b${p.name}\\??:`));
      }
    }
  });
  it('gives NavItem its documented as and active props', () => {
    const byName = Object.fromEntries(PROP_OVERRIDES.NavItem.props.map((p) => [p.name, p]));
    expect(byName.as.default).toBe('a');
    expect(byName.active).toMatchObject({ type: 'boolean', required: false, default: 'false' });
  });
});

describe('componentsFromDocs on real sources (contract with react-docgen-typescript)', () => {
  it('reads Button and RadioGroup from the repo', () => {
    const { docs } = runDocgen(['src/components/Button/Button.tsx', 'src/components/Radio/Radio.tsx']);
    const out = componentsFromDocs(docs, { exported: new Set(['Button', 'RadioGroup']), storyTitles: {} });
    const button = out.find((c) => c.name === 'Button');
    expect(button.props.map((p) => p.name)).toContain('variant');
    expect(button.props.some((p) => p.name === 'onClick')).toBe(false); // inherited HTML props filtered
    expect(out.find((c) => c.name === 'RadioGroup').props.map((p) => p.name)).toContain('error');
  }, 30_000);

  it('excludes only the @types/react DOM surface, keeping library component API', () => {
    // propFilter drops a prop only when its `parent` (or every one of its
    // `declarations`) resolves into node_modules/@types/react/. Radix's own
    // props (asChild from @radix-ui/react-primitive; Select's
    // value/onValueChange from @radix-ui/react-select) and recharts' own
    // config props are real component API and must survive.
    const { docs: [buttonDoc], dropped } = runDocgen(['src/components/Button/Button.tsx']);
    expect(dropped.Button).toBeGreaterThan(0);
    expect(buttonDoc.props.variant).toBeDefined();
    expect(buttonDoc.props.asChild).toBeDefined();
    expect(buttonDoc.props.onClick).toBeUndefined();
    expect(buttonDoc.props.className).toBeUndefined();

    const { docs: selectDocs } = runDocgen(['src/components/Select/Select.tsx']);
    const select = selectDocs.find((d) => d.displayName === 'Select');
    expect(select.props.onValueChange).toBeDefined();
    expect(select.props.value).toBeDefined();

    const { docs: tabsDocs } = runDocgen(['src/components/Tabs/Tabs.tsx']);
    const tabsTrigger = tabsDocs.find((d) => d.displayName === 'TabsTrigger');
    expect(tabsTrigger.props.asChild).toBeDefined();

    const { docs: tooltipDocs } = runDocgen(['src/components/Chart/ChartTooltip.tsx']);
    const chartTooltip = tooltipDocs.find((d) => d.displayName === 'ChartTooltip');
    expect(chartTooltip.props.valueFormatter).toBeDefined();
    expect(chartTooltip.props.cursor).toBeDefined();
  }, 30_000);

  it("ChartLegend drops recharts' DOM/SVG adapter props but keeps its own Legend config", () => {
    // recharts re-declares the DOM/SVG event-handler surface (onAbort,
    // onPointerDown, ...) in an anonymous TypeLiteral inside
    // DOMAttributesAdaptChildEvent, in node_modules/recharts/types/util/types.d.ts.
    // Props declared ONLY there are dropped; layout/align/verticalAlign are
    // real Legend config declared elsewhere and must survive.
    const { docs } = runDocgen(['src/components/Chart/ChartLegend.tsx']);
    const chartLegend = docs.find((d) => d.displayName === 'ChartLegend');
    const chartLegendContent = docs.find((d) => d.displayName === 'ChartLegendContent');
    expect(chartLegend.props.onAbort).toBeUndefined();
    expect(chartLegend.props.onPointerDown).toBeUndefined();
    expect(chartLegend.props.dangerouslySetInnerHTML).toBeUndefined();
    expect(chartLegend.props.layout).toBeDefined();
    expect(chartLegend.props.align).toBeDefined();
    expect(chartLegend.props.verticalAlign).toBeDefined();
    expect(chartLegendContent.props.payload).toBeDefined();
    expect(chartLegendContent.props.className).toBeDefined();
  }, 30_000);

  it('ChartContainer now extracts its own real props (usePrefersReducedMotion + chartSeriesColor moved out)', () => {
    const { docs } = runDocgen(['src/components/Chart/ChartContainer.tsx']);
    const chartContainer = docs.find((d) => d.displayName === 'ChartContainer');
    expect(chartContainer.props.height).toBeDefined();
    expect(chartContainer.props.data).toBeDefined();
    expect(chartContainer.props.ariaLabel).toBeDefined();
    // The @types/react DOM surface (extends React.HTMLAttributes<HTMLDivElement>) is still excluded.
    expect(chartContainer.props.onClick).toBeUndefined();
  }, 30_000);
});

describe('buildManifest + validate', () => {
  const pkg = { name: '@studio-manfred/manfred-design-system', version: '0.35.0', peerDependencies: { react: '>=18.0.0' } };
  const components = [{ name: 'Button', group: 'Button', description: 'x', storybook: 'components-button', extendsDom: true, props: [] }];
  const tokens = [{ name: '--blue-500', value: '#2c28ec', layer: 'primitive' }];

  it('assembles a valid manifest', () => {
    const m = buildManifest({ pkg, components, tokens });
    expect(m.schemaVersion).toBe(1);
    expect(m.package).toEqual({ name: pkg.name, version: '0.35.0' });
    expect(m.peerDependencies).toEqual({ react: '>=18.0.0' });
    expect(m.setup).toEqual(SETUP);
    expect(validate('manifest', m)).toEqual([]);
  });

  it('pins the setup contract the CLI relies on', () => {
    expect(SETUP.mcp.url).toBe('https://main--6a26cfd37771192ff26832bf.chromatic.com/mcp');
    expect(SETUP.nextUseClientSince).toBe('0.23.0');
    expect(SETUP.cssImports).toEqual(['@studio-manfred/manfred-design-system/tokens.css']);
    expect(SETUP.sourceGlob).toBe('node_modules/@studio-manfred/manfred-design-system/dist');
  });

  it('requires a boolean extendsDom on every component', () => {
    const { extendsDom, ...noFlag } = components[0];
    expect(validate('manifest', { ...buildManifest({ pkg, components, tokens }), components: [noFlag] }).join('\n')).toMatch(/extendsDom/);
    expect(validate('manifest', { ...buildManifest({ pkg, components, tokens }), components: [{ ...noFlag, extendsDom: 'yes' }] }).join('\n')).toMatch(/extendsDom/);
  });

  it('reports schema errors with a path', () => {
    const bad = { ...buildManifest({ pkg, components, tokens }), components: [] };
    expect(validate('manifest', bad).join('\n')).toMatch(/components/);
  });

  it('deep-freezes SETUP and all nested objects', () => {
    expect(Object.isFrozen(SETUP)).toBe(true);
    expect(Object.isFrozen(SETUP.registry)).toBe(true);
    expect(Object.isFrozen(SETUP.mcp)).toBe(true);
    expect(Object.isFrozen(SETUP.cssImports)).toBe(true);
  });

  it('makes setup a mutable independent copy', () => {
    const m = buildManifest({ pkg, components, tokens });
    expect(Object.isFrozen(m.setup)).toBe(false);
    m.setup.mcp.url = 'mutated';
    expect(SETUP.mcp.url).toBe('https://main--6a26cfd37771192ff26832bf.chromatic.com/mcp');
  });
});

describe('checkMigrations', () => {
  const ok = [
    { version: '0.9.0', breaking: false, summary: 'a', steps: [{ kind: 'peer', package: 'recharts', range: '^3.0.0' }] },
    { version: '0.32.0', breaking: true, summary: 'b', steps: [{ kind: 'code', note: 'n', findImports: ['react-day-picker'] }] },
  ];
  it('accepts a valid ascending list', () => expect(checkMigrations(ok)).toEqual([]));
  it('rejects out-of-order versions and names the entry', () => {
    expect(checkMigrations([ok[1], ok[0]]).join('\n')).toMatch(/0\.9\.0 comes after 0\.32\.0/);
  });
  it('rejects an unknown step kind', () => {
    expect(checkMigrations([{ ...ok[0], steps: [{ kind: 'magic' }] }]).length).toBeGreaterThan(0);
  });
  it('the committed migrations.json is valid', () => {
    expect(checkMigrations(JSON.parse(readFileSync('migrations.json', 'utf8')))).toEqual([]);
  });
});

describe('componentsFromDocs filters PascalCase names', () => {
  it('keeps only PascalCase components and excludes lowercase helpers', () => {
    const docs = [
      { displayName: 'Button', filePath: '/r/src/components/Button/Button.tsx', description: 'Button docs', props: {} },
      { displayName: 'navigationMenuTriggerStyle', filePath: '/r/src/components/NavigationMenu/NavigationMenu.tsx', description: 'Helper', props: {} },
    ];
    const out = componentsFromDocs(docs, {
      exported: new Set(['Button', 'navigationMenuTriggerStyle']),
      storyTitles: {},
    });
    expect(out.map((c) => c.name)).toEqual(['Button']);
  });
});

describe('main', () => {
  it('writes a valid manifest and migrations for the real repo', async () => {
    const written = {};
    let code = 0;
    await main({ root: process.cwd(), log: () => {}, error: () => {}, exit: (c) => { code = c; },
                 write: (file, text) => { written[file] = JSON.parse(text); } });
    expect(code).toBe(0);
    const manifest = written[path.join(process.cwd(), 'dist/manifest.json')];
    expect(validate('manifest', manifest)).toEqual([]);
    expect(manifest.components.find((c) => c.name === 'RadioGroup').props.map((p) => p.name)).toContain('error');
    expect(manifest.tokens.find((t) => t.name === '--blue-500').value).toBe('#2c28ec');
    const comp = (n) => manifest.components.find((c) => c.name === n);
    expect(comp('NavItem').props.map((p) => p.name)).toEqual(expect.arrayContaining(['as', 'active']));
    expect(comp('NavItem').extendsDom).toBe(true);
    expect(comp('Button').extendsDom).toBe(true);
    expect(comp('CardHeader').extendsDom).toBe(true);
    expect(comp('CardHeader').props).toEqual([]);
    expect(manifest.components.every((c) => typeof c.extendsDom === 'boolean')).toBe(true);
    expect(written[path.join(process.cwd(), 'dist/migrations.json')].length).toBeGreaterThan(0);
  }, 60_000);

  it('fails closed and never writes when migrations.json is schema-invalid', async () => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'ds-manifest-test-'));
    try {
      symlinkSync(path.join(process.cwd(), 'src'), path.join(tmp, 'src'), 'dir');
      copyFileSync(path.join(process.cwd(), 'package.json'), path.join(tmp, 'package.json'));
      copyFileSync(path.join(process.cwd(), 'tsconfig.json'), path.join(tmp, 'tsconfig.json'));
      writeFileSync(
        path.join(tmp, 'migrations.json'),
        JSON.stringify([
          { version: 'not-a-version', breaking: false, summary: 'bad', steps: [{ kind: 'peer', package: 'recharts', range: '^3.0.0' }] },
        ]),
      );

      const errors = [];
      let code = 0;
      let wrote = false;
      await main({
        root: tmp,
        log: () => {},
        error: (msg) => errors.push(msg),
        exit: (c) => { code = c; },
        write: () => { wrote = true; },
      });

      expect(code).toBe(1);
      expect(errors.some((e) => e.startsWith('✗'))).toBe(true);
      expect(wrote).toBe(false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, 60_000);
});
