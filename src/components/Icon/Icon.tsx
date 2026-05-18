import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { iconPaths } from './iconPaths';

/**
 * Names of icons available in the design-system icon set. The set is
 * intentionally small — adding a new name requires a corresponding
 * SVG path in `iconPaths.ts` so consumers can't render arbitrary
 * glyphs. Update both this union and `iconPaths` together.
 */
export type IconName =
  | 'check'
  | 'x'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'info'
  | 'warning'
  | 'alert-circle'
  | 'check-circle'
  | 'x-circle'
  | 'eye'
  | 'eye-off'
  | 'plus'
  | 'minus'
  | 'arrow-left'
  | 'arrow-right'
  | 'bell'
  | 'external-link'
  | 'loader'
  | 'calendar';

const iconVariants = cva('inline-block shrink-0', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type IconSize = NonNullable<VariantProps<typeof iconVariants>['size']>;

/**
 * Props for the {@link Icon} component.
 *
 * Inherits every native `<svg>` attribute except `role` / `aria-label` /
 * `aria-hidden` (which the component derives from the `label` prop —
 * pass `label` to flip from decorative to meaningful). Use `id`,
 * `data-*`, `focusable`, etc. as normal.
 */
export interface IconProps
  extends Omit<
    React.SVGAttributes<SVGSVGElement>,
    'role' | 'aria-label' | 'aria-hidden' | 'children'
  > {
  /**
   * Glyph to render. Restricted to the {@link IconName} union — not
   * an arbitrary string — so consumers can't drift from the curated
   * set. Add new names in `iconPaths.ts`.
   */
  name: IconName;
  /**
   * Visual size — `xs` (12px), `sm` (16px), `md` (20px, default),
   * `lg` (24px), `xl` (32px). Stroke width stays constant at 1.5px
   * across sizes to keep optical weight consistent.
   */
  size?: IconSize;
  /**
   * Accessible label. When provided the SVG renders with
   * `role="img"` and `aria-label` so screen readers announce it.
   * Omit (default) for purely decorative icons — the SVG is then
   * `aria-hidden="true"` and ignored by AT.
   */
  label?: string;
}

/**
 * Single-colour SVG icon from the Manfred curated set. Strokes via
 * `currentColor` so the icon inherits text colour from its parent —
 * place it inside a button or label and it picks up the surrounding
 * style automatically.
 *
 * Names are restricted to the {@link IconName} union; add new glyphs
 * in `iconPaths.ts` rather than hand-writing SVG inline.
 *
 * Accessibility:
 * - Default (no `label`) → decorative: `aria-hidden="true"`, no role.
 *   Use this when the icon sits next to its own label (e.g. a button
 *   that already has visible text).
 * - With `label` → meaningful: `role="img"` + `aria-label`. Reach for
 *   this when the icon is the only thing communicating the action,
 *   e.g. an icon-only button.
 *
 * @example Decorative icon next to text
 * ```tsx
 * <Button><Icon name="plus" /> New item</Button>
 * ```
 *
 * @example Standalone icon with accessible label
 * ```tsx
 * <Icon name="bell" label="Notifications" size="lg" />
 * ```
 */
export function Icon({
  name,
  size = 'md',
  label,
  className,
  ...rest
}: IconProps) {
  const path = iconPaths[name];

  return (
    <svg
      {...rest}
      className={cn(iconVariants({ size }), className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {path && <path d={path} />}
    </svg>
  );
}
