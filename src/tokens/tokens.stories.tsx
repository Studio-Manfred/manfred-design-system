import type { Meta, StoryObj } from '@storybook/react-vite';
import { blue, neutral, warm } from './primitives';
import { size, controlSize, iconSize, containerSize } from './sizing';

const meta: Meta = {
  title: 'Foundation/Tokens',
  parameters: {
    layout: 'padded',
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
          border: border ? '1px solid rgba(0,0,0,0.12)' : 'none',
        }}
      />
      <div>
        <div style={{ ...label, fontWeight: 600 }}>{name}</div>
        <div style={{ ...label, color: '#666' }}>{value}</div>
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
                border: Number(step) < 100 ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }}
            />
            <div style={{ ...label, marginTop: 4, color: '#888' }}>{step}</div>
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
          color: '#888',
          borderBottom: '1px solid #e8e8ea',
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
          border: light ? '1px solid rgba(0,0,0,0.1)' : 'none',
        }}
      />
      <div>
        <div style={{ ...label, fontWeight: 600, fontSize: 12 }}>{swatchLabel}</div>
        <div style={{ ...label, color: '#999', fontSize: 11 }}>{cssVar}</div>
      </div>
    </div>
  );
}

/* ======================================================
   STORY 1: Brand Palette
   ====================================================== */

export const BrandPalette: Story = {
  name: 'Brand Palette',
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

export const ColorScales: Story = {
  name: 'Color Scales',
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
    </div>
  ),
};

/* ======================================================
   STORY 3: Semantic Tokens
   ====================================================== */

export const SemanticTokens: Story = {
  name: 'Semantic Tokens',
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
        <span style={{ color: '#888', marginLeft: 8 }}>{value}</span>
      </div>
    </div>
  );
}

function ContainerBar({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ ...label, fontWeight: 600, marginBottom: 4 }}>
        {name} <span style={{ color: '#888', fontWeight: 400 }}>{value}</span>
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
              <span style={{ color: '#888', marginLeft: 8 }}>{controlSize[key]}</span>
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
              <div style={{ ...label, marginTop: 6, color: '#888' }}>{key}</div>
              <div style={{ ...label, color: '#bbb' }}>{iconSize[key]}</div>
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
