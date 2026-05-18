import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('font-sans m-0', {
  variants: {
    variant: {
      headline1: 'text-[3.5rem] font-extrabold leading-[1.1] tracking-[-0.02em]',
      headline2: 'text-[2.5rem] font-extrabold leading-[1.1] tracking-[-0.02em]',
      headline3: 'text-[2rem] font-extrabold leading-[1.3]',
      headline4: 'text-2xl font-extrabold leading-[1.3]',
      large: 'text-xl font-light leading-[1.5]',
      body: 'text-base font-normal leading-[1.7]',
      bodySmall: 'text-sm font-normal leading-[1.7]',
      label: 'text-sm font-semibold leading-[1.5]',
      caption: 'text-xs font-normal leading-[1.5]',
    },
    color: {
      default: 'text-foreground',
      inverse: 'text-[var(--color-text-inverse)]',
      brand: 'text-[var(--color-brand-primary)]',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
  },
});

export type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>['variant']>;
export type TypographyColor = NonNullable<VariantProps<typeof typographyVariants>['color']>;

type TypographyAs =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div' | 'label';

/**
 * Props for the {@link Typography} component.
 *
 * Inherits every native HTML attribute via `React.HTMLAttributes<HTMLElement>` —
 * pass `role`, `aria-live`, `id`, `data-*`, `onClick`, etc. directly. This is
 * the natural place for live-region attributes when the text *is* the alert
 * (e.g. inline form errors), so the message can carry `role="alert"` without
 * a wrapping `<div>`.
 */
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Required visual variant. Each variant pairs a size, weight, and
   * line-height from the type system; pick by role rather than by
   * appearance (e.g. use `label` for form labels, not `bodySmall`).
   */
  variant: TypographyVariant;
  /**
   * Override the rendered HTML element. By default each variant maps
   * to a sensible tag (`headline1` → `h1`, `body` → `p`, …). Use this
   * when the document outline disagrees with the visual hierarchy.
   */
  as?: TypographyAs;
  /** Colour role. Defaults to `default` (`--foreground`). */
  color?: TypographyColor;
  /** The text or inline content. Required. */
  children: React.ReactNode;
}

const defaultElement: Record<TypographyVariant, TypographyAs> = {
  headline1: 'h1',
  headline2: 'h2',
  headline3: 'h3',
  headline4: 'h4',
  large:     'p',
  body:      'p',
  bodySmall: 'p',
  label:     'span',
  caption:   'span',
};

/**
 * Type-system primitive — every block of text in the design system
 * flows through here.
 *
 * Nine variants (`headline1`–`headline4`, `large`, `body`, `bodySmall`,
 * `label`, `caption`) and four colour roles bound to design tokens.
 * The component picks the right HTML tag per variant; override with
 * `as` when the visual hierarchy and document outline diverge.
 *
 * Accessibility: choose `as` so the heading levels stay sequential
 * (no jumping from `h2` to `h4`). For purely decorative captions on
 * inline content, prefer `as="span"` to avoid creating extra paragraph
 * landmarks.
 *
 * @example Page title with the type system
 * ```tsx
 * <Typography variant="headline1">Studio Manfred</Typography>
 * <Typography variant="large" color="muted">Design + engineering studio.</Typography>
 * ```
 *
 * @example Form-field label rendered as a `<label>`
 * ```tsx
 * <Typography variant="label" as="label">Email address</Typography>
 * ```
 */
export function Typography({
  variant,
  as,
  color = 'default',
  children,
  className,
  ...rest
}: TypographyProps) {
  const Tag = as ?? defaultElement[variant];

  return (
    <Tag
      {...rest}
      className={cn(typographyVariants({ variant, color }), className)}
    >
      {children}
    </Tag>
  );
}
