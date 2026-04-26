import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Centred max-width wrapper for page-level layout. Pairs with `Grid` and the
 * existing layout primitives to compose dashboards and content pages.
 *
 * - `mx-auto` is always applied — centring is the point.
 * - `size="full"` removes the max-width cap entirely (edge-to-edge).
 * - `padded={false}` drops the responsive horizontal padding for hero blocks
 *   or tools that need to bleed to the edge.
 *
 * Token mapping (see `src/tokens/tokens.css`):
 *   sm  → --size-container-sm  (40rem)
 *   md  → --size-container-md  (48rem)
 *   lg  → --size-container-lg  (64rem, default)
 *   xl  → --size-container-xl  (80rem)
 *   full → no max-width
 */

const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-[var(--size-container-sm)]',
      md: 'max-w-[var(--size-container-md)]',
      lg: 'max-w-[var(--size-container-lg)]',
      xl: 'max-w-[var(--size-container-xl)]',
      full: '',
    },
    padded: {
      true: 'px-4 sm:px-6 lg:px-8',
      false: '',
    },
  },
  defaultVariants: {
    size: 'lg',
    padded: true,
  },
});

export type ContainerSize = NonNullable<VariantProps<typeof containerVariants>['size']>;
export type ContainerElement = 'div' | 'main' | 'section' | 'article';

export interface ContainerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof containerVariants> {
  /** Element to render as. Defaults to `div`. Use `main` / `section` / `article` for landmarks. */
  as?: ContainerElement;
  children?: React.ReactNode;
}

export const Container = React.forwardRef<HTMLElement, ContainerProps>(function Container(
  { as = 'div', size = 'lg', padded = true, className, children, ...rest },
  ref,
) {
  return React.createElement(
    as,
    {
      ref,
      className: cn(containerVariants({ size, padded }), className),
      ...rest,
    },
    children,
  );
});
Container.displayName = 'Container';
