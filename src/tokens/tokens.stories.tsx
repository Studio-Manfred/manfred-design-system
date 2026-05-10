import type { Meta, StoryObj } from '@storybook/react-vite';
import { blue, neutral, warm } from './primitives';
import { size, controlSize, iconSize, containerSize } from './sizing';
import { spacing } from './spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from './typography';

const meta: Meta = {
  title: 'Foundation/Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Visual reference for the Manfred design tokens. Tokens flow through three ' +
          'layers — primitives (raw scales), semantic aliases (intent), and the shadcn ' +
          'contract (`--background`, `--primary`, `--ring`, …). For the narrative model ' +
          'and dark-mode rebinding rules, see the **Tokens** docs page; for the source of ' +
          'truth, see `src/tokens/tokens.css`. Story-level `color-contrast` is disabled ' +
          'globally on this page because the swatches are the subject, not production text.',
      },
    },
    a11y: {
      config: {
        rules: [
          // These stories display color swatches as content — the swatch itself
          // is the subject, not production text. Contrast rules don't apply.
          { id: 'color-contrast', enabled: false },
        ],
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ---- Shared swatch primitives ---- */

const label: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  lineHeight: 1.4,
};

function SwatchRow({
  name,
  value,
  size = 48,
  border = false,
}: {
  name: string;
  value: string;
  size?: number;
  border?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          backgroundColor: value,
          flexShrink: 0,
          border: border ? '1px solid var(--color-border-default)' : 'none',
        }}
      />
      <div>
        <div style={{ ...label, fontWeight: 600 }}>{name}</div>
        <div style={{ ...label, color: 'var(--color-text-muted)' }}>{value}</div>
      </div>
    </div>
  );
}

function ScaleRow({
  name,
  scale,
}: {
  name: string;
  scale: Record<number, string>;
}) {
  const steps = Object.keys(scale) as unknown as number[];
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ ...label, fontWeight: 700, marginBottom: 8, fontSize: 12 }}>{name}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {steps.map((step) => (
          <div key={step} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 6,
                backgroundColor: scale[step],
                border: Number(step) < 100 ? '1px solid var(--color-border-default)' : 'none',
              }}
            />
            <div style={{ ...label, marginTop: 4, color: 'var(--color-text-muted)' }}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          borderBottom: '1px solid var(--color-border-default)',
          paddingBottom: 8,
          marginBottom: 20,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function SemanticSwatch({
  cssVar,
  label: swatchLabel,
  light = false,
}: {
  cssVar: string;
  label: string;
  light?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 4,
          backgroundColor: cssVar,
          flexShrink: 0,
          border: light ? '1px solid var(--color-border-default)' : 'none',
        }}
      />
      <div>
        <div style={{ ...label, fontWeight: 600, fontSize: 12 }}>{swatchLabel}</div>
        <div style={{ ...label, color: 'var(--color-text-muted)', fontSize: 11 }}>{cssVar}</div>
      </div>
    </div>
  );
}

/* ======================================================
   STORY 1: Brand Palette
   ====================================================== */

export const BrandPalette: Story = {
  name: 'Brand Palette',
  parameters: {
    docs: {
      description: {
        story:
          'The six brand-defining colours: Business Blue, Almost Black, Human Pink, ' +
          'Beige, Light Beige, and White. These are primitives — the raw values that ' +
          'every semantic token eventually resolves to.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480 }}>
      <Section title="Brand Colors">
        <div style={{ display: 'grid', gap: 12 }}>
          <SwatchRow name="Business Blue" value={blue[500]} />
          <SwatchRow name="Almost Black"  value={neutral[800]} />
          <SwatchRow name="Human Pink"    value={warm.pink}       border />
          <SwatchRow name="Beige"         value={warm.beige}      border />
          <SwatchRow name="Light Beige"   value={warm.beigeLight} border />
          <SwatchRow name="White"         value={warm.white}      border />
        </div>
      </Section>
    </div>
  ),
};

/* ======================================================
   STORY 2: Color Scales
   ====================================================== */

// Feedback colours — defined only in tokens.css at the semantic layer.
// Kept in sync with src/tokens/tokens.css.
const feedback = {
  'success-bg': '#d1fae5',
  'success-fg': '#065f46',
  'warning-bg': '#fef3c7',
  'warning-fg': '#92400e',
  'error-bg':   '#fee2e2',
  'error-fg':   '#991b1b',
} as const;

export const ColorScales: Story = {
  name: 'Color Scales',
  parameters: {
    docs: {
      description: {
        story:
          'Primitive colour scales: blue and neutral run 50→900; warm is a flat ' +
          'four-colour palette without a ramp. Feedback colours live at the semantic ' +
          'layer (`--color-feedback-*`) — they have no primitive scale because their ' +
          'roles (success / warning / error / info) imply meaning, not raw chroma.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <Section title="Blue Scale">
        <ScaleRow name="Blue" scale={blue} />
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(blue) as unknown as (keyof typeof blue)[]).map((step) => (
            <SwatchRow
              key={step}
              name={`--blue-${step}`}
              value={blue[step]}
              border={Number(step) < 100}
            />
          ))}
        </div>
      </Section>

      <Section title="Neutral Scale">
        <ScaleRow name="Neutral" scale={neutral} />
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(neutral) as unknown as (keyof typeof neutral)[]).map((step) => (
            <SwatchRow
              key={step}
              name={`--neutral-${step}`}
              value={neutral[step]}
              border={Number(step) < 100}
            />
          ))}
        </div>
      </Section>

      <Section title="Warm Palette — flat (no scale)">
        <div style={{ display: 'grid', gap: 8 }}>
          <SwatchRow name="--pink"        value={warm.pink}       border />
          <SwatchRow name="--beige"       value={warm.beige}      border />
          <SwatchRow name="--beige-light" value={warm.beigeLight} border />
          <SwatchRow name="--white"       value={warm.white}      border />
        </div>
      </Section>

      <Section title="Feedback">
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(feedback) as (keyof typeof feedback)[]).map((key) => (
            <SwatchRow
              key={key}
              name={`--color-feedback-${key}`}
              value={feedback[key]}
              border={key.endsWith('-bg')}
            />
          ))}
        </div>
      </Section>
    </div>
  ),
};

/* ======================================================
   STORY 3: Semantic Tokens
   ====================================================== */

export const SemanticTokens: Story = {
  name: 'Semantic Tokens',
  parameters: {
    docs: {
      description: {
        story:
          'Layer 2 — semantic aliases that name intent (`--color-text-primary`, ' +
          '`--color-interactive-brand-bg`) rather than raw value. These are the only ' +
          'tokens that rebind under dark mode; primitives never change, and the shadcn ' +
          'contract flips automatically via `var()` indirection. Components reference ' +
          'these — never hex literals or primitives directly.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480 }}>

      <Section title="Text">
        <SemanticSwatch cssVar="var(--color-text-primary)"   label="text-primary" />
        <SemanticSwatch cssVar="var(--color-text-secondary)" label="text-secondary" />
        <SemanticSwatch cssVar="var(--color-text-muted)"     label="text-muted" />
        <SemanticSwatch cssVar="var(--color-text-disabled)"  label="text-disabled" />
        <SemanticSwatch cssVar="var(--color-text-inverse)"   label="text-inverse" light />
        <SemanticSwatch cssVar="var(--color-text-brand)"     label="text-brand" />
        <SemanticSwatch cssVar="var(--color-text-on-brand)"  label="text-on-brand" light />
      </Section>

      <Section title="Background">
        <SemanticSwatch cssVar="var(--color-bg-default)"    label="bg-default"    light />
        <SemanticSwatch cssVar="var(--color-bg-subtle)"     label="bg-subtle"     light />
        <SemanticSwatch cssVar="var(--color-bg-muted)"      label="bg-muted"      light />
        <SemanticSwatch cssVar="var(--color-bg-inverse)"    label="bg-inverse" />
        <SemanticSwatch cssVar="var(--color-bg-brand)"      label="bg-brand" />
        <SemanticSwatch cssVar="var(--color-bg-warm)"       label="bg-warm"       light />
        <SemanticSwatch cssVar="var(--color-bg-warm-muted)" label="bg-warm-muted" light />
        <SemanticSwatch cssVar="var(--color-bg-accent)"     label="bg-accent"     light />
      </Section>

      <Section title="Border">
        <SemanticSwatch cssVar="var(--color-border-default)" label="border-default" light />
        <SemanticSwatch cssVar="var(--color-border-strong)"  label="border-strong" />
        <SemanticSwatch cssVar="var(--color-border-brand)"   label="border-brand" />
        <SemanticSwatch cssVar="var(--color-border-focus)"   label="border-focus" />
      </Section>

      <Section title="Interactive — Primary variant">
        <SemanticSwatch cssVar="var(--color-interactive-primary-bg)"        label="primary-bg" />
        <SemanticSwatch cssVar="var(--color-interactive-primary-bg-hover)"  label="primary-bg-hover" />
        <SemanticSwatch cssVar="var(--color-interactive-primary-bg-active)" label="primary-bg-active" />
        <SemanticSwatch cssVar="var(--color-interactive-primary-fg)"        label="primary-fg" light />
      </Section>

      <Section title="Interactive — Brand variant">
        <SemanticSwatch cssVar="var(--color-interactive-brand-bg)"        label="brand-bg" />
        <SemanticSwatch cssVar="var(--color-interactive-brand-bg-hover)"  label="brand-bg-hover" />
        <SemanticSwatch cssVar="var(--color-interactive-brand-bg-active)" label="brand-bg-active" />
        <SemanticSwatch cssVar="var(--color-interactive-brand-fg)"        label="brand-fg" light />
      </Section>

      <Section title="Interactive — Outline variant">
        <SemanticSwatch cssVar="var(--color-interactive-outline-border)"       label="outline-border" />
        <SemanticSwatch cssVar="var(--color-interactive-outline-border-hover)" label="outline-border-hover" />
        <SemanticSwatch cssVar="var(--color-interactive-outline-bg-hover)"     label="outline-bg-hover" light />
      </Section>

      <Section title="Interactive — Ghost variant">
        <SemanticSwatch cssVar="var(--color-interactive-ghost-bg-hover)" label="ghost-bg-hover" light />
      </Section>

    </div>
  ),
};

/* ======================================================
   STORY 4: Sizing Tokens
   ====================================================== */

function SizeBar({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: value,
          maxWidth: '100%',
          height: 24,
          borderRadius: 4,
          backgroundColor: '#2c28ec',
          flexShrink: 0,
          minWidth: 4,
        }}
      />
      <div style={{ ...label, whiteSpace: 'nowrap' }}>
        <span style={{ fontWeight: 600 }}>{name}</span>
        <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>{value}</span>
      </div>
    </div>
  );
}

function ContainerBar({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ ...label, fontWeight: 600, marginBottom: 4 }}>
        {name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>{value}</span>
      </div>
      <div
        style={{
          width: value,
          maxWidth: '100%',
          height: 20,
          borderRadius: 4,
          backgroundColor: '#eaeafd',
          border: '1.5px solid #2c28ec',
        }}
      />
    </div>
  );
}

export const SizingTokens: Story = {
  name: 'Sizing',
  parameters: {
    docs: {
      description: {
        story:
          'Sizing tokens on a 4px grid. Primitive `--size-*` is the underlying scale; ' +
          'semantic aliases (`--size-control-*`, `--size-icon-*`, `--size-container-*`) ' +
          'are what components and layouts reference so the meaning travels with the value.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>

      <Section title="Primitive Size Scale">
        {(Object.keys(size) as unknown as (keyof typeof size)[]).map((step) => (
          <SizeBar key={step} name={`--size-${step}`} value={size[step]} />
        ))}
      </Section>

      <Section title="Component Heights">
        {(Object.keys(controlSize) as (keyof typeof controlSize)[]).map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 120,
                height: controlSize[key],
                borderRadius: 4,
                backgroundColor: '#2c28ec',
                flexShrink: 0,
              }}
            />
            <div style={label}>
              <span style={{ fontWeight: 600 }}>{`--size-control-${key}`}</span>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>{controlSize[key]}</span>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Icon Sizes">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {(Object.keys(iconSize) as (keyof typeof iconSize)[]).map((key) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: iconSize[key],
                  height: iconSize[key],
                  borderRadius: 4,
                  backgroundColor: '#2c28ec',
                  margin: '0 auto',
                }}
              />
              <div style={{ ...label, marginTop: 6, color: 'var(--color-text-muted)' }}>{key}</div>
              <div style={{ ...label, color: 'var(--color-text-disabled)' }}>{iconSize[key]}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Container Max-widths">
        {(Object.keys(containerSize) as (keyof typeof containerSize)[]).map((key) => (
          <ContainerBar
            key={key}
            name={`--size-container-${key}`}
            value={containerSize[key]}
          />
        ))}
      </Section>

    </div>
  ),
};

/* ======================================================
   STORY 5: Typography Tokens
   ====================================================== */

export const TypographyTokens: Story = {
  name: 'Typography',
  parameters: {
    docs: {
      description: {
        story:
          'Primitive typography scales: font family, weight, size, and line-height. ' +
          'These power the `Typography` component and any direct `var(--font-size-*)` use. ' +
          'Letter-spacing tokens (`--letter-spacing-tight | normal | wide`) are exposed in ' +
          '`tokens.css` but are not enumerated visually here — they\'re subtle modifiers, ' +
          'not a scale users browse.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 720 }}>

      <Section title="Font Family">
        <div
          style={{
            fontFamily: fontFamily.base,
            fontSize: '1.25rem',
            color: 'var(--color-text-primary)',
            marginBottom: 6,
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
        <div style={{ ...label, color: 'var(--color-text-muted)' }}>
          --font-family-base &nbsp;·&nbsp; {fontFamily.base}
        </div>
      </Section>

      <Section title="Font Size Scale">
        <div style={{ display: 'grid', gap: 12 }}>
          {(Object.keys(fontSize) as (keyof typeof fontSize)[]).map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <div style={{ ...label, width: 140, flexShrink: 0 }}>
                <span style={{ fontWeight: 600 }}>{`--font-size-${key}`}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  {fontSize[key]}
                </span>
              </div>
              <div
                style={{
                  fontFamily: fontFamily.base,
                  fontSize: fontSize[key],
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                }}
              >
                Aa Bb Cc
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Font Weight">
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(fontWeight) as (keyof typeof fontWeight)[]).map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <div style={{ ...label, width: 200, flexShrink: 0 }}>
                <span style={{ fontWeight: 600 }}>{`--font-weight-${key}`}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  {fontWeight[key]}
                </span>
              </div>
              <div
                style={{
                  fontFamily: fontFamily.base,
                  fontSize: '1.125rem',
                  fontWeight: fontWeight[key],
                  color: 'var(--color-text-primary)',
                }}
              >
                The quick brown fox
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Line Height">
        <div style={{ display: 'grid', gap: 16 }}>
          {(Object.keys(lineHeight) as (keyof typeof lineHeight)[]).map((key) => (
            <div key={key}>
              <div style={{ ...label, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{`--line-height-${key}`}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  {lineHeight[key]}
                </span>
              </div>
              <div
                style={{
                  fontFamily: fontFamily.base,
                  fontSize: '0.95rem',
                  lineHeight: lineHeight[key],
                  color: 'var(--color-text-primary)',
                  borderLeft: '2px solid var(--color-border-default)',
                  paddingLeft: 12,
                  maxWidth: 520,
                }}
              >
                Design tokens carry intent across the system — primitives describe what
                things are, semantic tokens describe what they do, and the shadcn
                contract bridges shadcn primitives onto Manfred semantics.
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  ),
};

/* ======================================================
   STORY 6: Spacing
   ====================================================== */

export const SpacingTokens: Story = {
  name: 'Spacing',
  parameters: {
    docs: {
      description: {
        story:
          'Primitive `--space-*` scale on a 4px grid. Use these for margin, padding, and ' +
          'gap. Sizing (`--size-*`) and spacing (`--space-*`) intentionally share numeric ' +
          'values — the names indicate role: spacing is *between* things, sizing is *of* a ' +
          'thing.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <Section title="Spacing Scale">
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(spacing) as unknown as (keyof typeof spacing)[]).map((step) => (
            <div
              key={step}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div
                style={{
                  width: spacing[step],
                  maxWidth: '100%',
                  height: 24,
                  borderRadius: 4,
                  backgroundColor: '#2c28ec',
                  flexShrink: 0,
                  minWidth: 4,
                }}
              />
              <div style={{ ...label, whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 600 }}>{`--space-${step}`}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  {spacing[step]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

/* ======================================================
   STORY 7: Radius
   ====================================================== */

const radiusTokens = {
  sm:   '4px',
  md:   '8px',
  lg:   '16px',
  full: '9999px',
} as const;

export const RadiusTokens: Story = {
  name: 'Radius',
  parameters: {
    docs: {
      description: {
        story:
          'Border-radius scale. `--radius` itself is the shadcn-contract default ' +
          '(currently `--radius-md`); Tailwind utilities `rounded-sm | -md | -lg | -xl | -full` ' +
          'are derived from it via `@theme` arithmetic.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <Section title="Border Radius">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {(Object.keys(radiusTokens) as (keyof typeof radiusTokens)[]).map((key) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: radiusTokens[key],
                  backgroundColor: 'var(--color-bg-brand)',
                }}
              />
              <div style={{ ...label, marginTop: 8, fontWeight: 600 }}>
                {`--radius-${key}`}
              </div>
              <div style={{ ...label, color: 'var(--color-text-muted)' }}>
                {radiusTokens[key]}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

/* ======================================================
   STORY 8: Motion
   ====================================================== */

const motionTokens = {
  '--transition-fast': { value: '150ms ease', durationMs: 150 },
  '--transition-base': { value: '250ms ease', durationMs: 250 },
} as const;

function MotionRow({
  name,
  value,
  durationMs,
}: {
  name: string;
  value: string;
  durationMs: number;
}) {
  // Animate a small bar by toggling a CSS class on hover so designers can
  // feel the duration. Using a key tied to the name keeps each row independent.
  const animationName = `motion-${name.replace(/[^a-z0-9]/gi, '-')}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
      <style>{`
        @keyframes ${animationName} {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(160px); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          width: 240,
          height: 32,
          borderRadius: 4,
          backgroundColor: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 32,
            height: 24,
            margin: 4,
            borderRadius: 4,
            backgroundColor: 'var(--color-bg-brand)',
            animation: `${animationName} ${durationMs * 6}ms linear infinite`,
          }}
        />
      </div>
      <div style={label}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ color: 'var(--color-text-muted)' }}>{value}</div>
      </div>
    </div>
  );
}

export const MotionTokens: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      description: {
        story:
          'Transition timing primitives. `--transition-fast` (150ms) for tight ' +
          'micro-interactions like hover and focus; `--transition-base` (250ms) for ' +
          'state changes and disclosures. Both ship the same `ease` curve — keep motion ' +
          'consistent unless a component has a documented reason to deviate. The animated ' +
          'preview loops at 6× duration so the curve is visible without being distracting.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <Section title="Transition Durations">
        {(Object.keys(motionTokens) as (keyof typeof motionTokens)[]).map((key) => (
          <MotionRow
            key={key}
            name={key}
            value={motionTokens[key].value}
            durationMs={motionTokens[key].durationMs}
          />
        ))}
      </Section>
    </div>
  ),
};

/* ======================================================
   STORY 9: Effects (focus shadow, overlays)
   ====================================================== */

export const EffectTokens: Story = {
  name: 'Effects',
  parameters: {
    docs: {
      description: {
        story:
          'Non-colour, non-spatial design tokens — focus ring, overlay, and the ' +
          'progress-stripe pattern. `--shadow-focus` is the canonical 3px ring used by ' +
          'every interactive component; `--color-bg-overlay` is the modal backdrop; ' +
          '`--pattern-stripes-overlay` is the 45° striped overlay used by indeterminate ' +
          'progress fills.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>

      <Section title="Focus Ring">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'var(--color-interactive-brand-bg)',
              color: 'var(--color-interactive-brand-fg)',
              fontFamily: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-focus)',
            }}
          >
            Focused button
          </button>
          <div style={label}>
            <div style={{ fontWeight: 600 }}>--shadow-focus</div>
            <div style={{ color: 'var(--color-text-muted)' }}>
              0 0 0 3px var(--color-focus-ring)
            </div>
          </div>
        </div>
      </Section>

      <Section title="Overlay">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              position: 'relative',
              width: 200,
              height: 100,
              borderRadius: 6,
              backgroundColor: 'var(--color-bg-warm)',
              overflow: 'hidden',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--color-bg-overlay)',
              }}
            />
          </div>
          <div style={label}>
            <div style={{ fontWeight: 600 }}>--color-bg-overlay</div>
            <div style={{ color: 'var(--color-text-muted)' }}>
              modal / dialog backdrop
            </div>
          </div>
        </div>
      </Section>

      <Section title="Progress Stripes Pattern">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 240,
              height: 16,
              borderRadius: 9999,
              backgroundColor: 'var(--color-bg-brand)',
              backgroundImage: 'var(--pattern-stripes-overlay)',
              backgroundSize: '200% 100%',
            }}
          />
          <div style={label}>
            <div style={{ fontWeight: 600 }}>--pattern-stripes-overlay</div>
            <div style={{ color: 'var(--color-text-muted)' }}>
              indeterminate / loading fills
            </div>
          </div>
        </div>
      </Section>

    </div>
  ),
};

/* ======================================================
   STORY 10: Chart Palette
   ====================================================== */

const chartTokens = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
] as const;

export const ChartPalette: Story = {
  name: 'Chart Palette',
  parameters: {
    docs: {
      description: {
        story:
          'Categorical chart colours. Tuned for ≥3:1 contrast against the surface ' +
          '(WCAG 1.4.11) and avoid red/green pairings for CVD safety. `chart-2` and ' +
          '`chart-3` alias the feedback success/warning foregrounds so they flip under ' +
          'dark mode automatically; `chart-1`, `-4`, and `-5` rebind explicitly. ' +
          '`--color-chart-axis` and `--color-chart-grid` alias the standard text-muted / ' +
          'bg-muted tokens for axis labels and gridlines.',
      },
    },
  },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640 }}>
      <Section title="Categorical Series">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
          {chartTokens.map((token, i) => (
            <div key={token} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 32 + i * 18,
                  borderRadius: 4,
                  backgroundColor: `var(${token})`,
                }}
              />
              <div style={{ ...label, marginTop: 6, fontWeight: 600 }}>{token}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {chartTokens.map((token) => (
            <SemanticSwatch key={token} cssVar={`var(${token})`} label={token.replace('--color-', '')} />
          ))}
        </div>
      </Section>

      <Section title="Axis & Grid">
        <SemanticSwatch
          cssVar="var(--color-chart-axis)"
          label="chart-axis"
        />
        <SemanticSwatch
          cssVar="var(--color-chart-grid)"
          label="chart-grid"
          light
        />
      </Section>
    </div>
  ),
};
