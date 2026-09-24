import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseTokens, barrelExports, storybookId, storyTitle, componentsFromDocs, missingComponents, runDocgen } from '../build-manifest.mjs';

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
});

describe('componentsFromDocs on real sources (contract with react-docgen-typescript)', () => {
  it('reads Button and RadioGroup from the repo', () => {
    const docs = runDocgen(['src/components/Button/Button.tsx', 'src/components/Radio/Radio.tsx']);
    const out = componentsFromDocs(docs, { exported: new Set(['Button', 'RadioGroup']), storyTitles: {} });
    const button = out.find((c) => c.name === 'Button');
    expect(button.props.map((p) => p.name)).toContain('variant');
    expect(button.props.some((p) => p.name === 'onClick')).toBe(false); // inherited HTML props filtered
    expect(out.find((c) => c.name === 'RadioGroup').props.map((p) => p.name)).toContain('error');
  }, 30_000);
});
