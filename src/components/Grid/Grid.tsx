import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * CSS-grid wrapper with token-driven gaps and responsive column counts.
 *
 * `cols` accepts either a fixed number (1–12) or a responsive object such as
 * `{ base: 1, md: 3 }`. Tailwind v4 statically extracts class names — string
 * concatenation does NOT work — so the breakpoint variants are pre-listed
 * below as static lookup maps.
 *
 * `gap` mirrors the spacing scale exposed via `--space-*` tokens.
 */

const COL_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type GridColCount = (typeof COL_COUNTS)[number];

// Static lookup maps so Tailwind's JIT picks the classes up at build time.
const BASE_COLS: Record<GridColCount, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const SM_COLS: Record<GridColCount, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  7: 'sm:grid-cols-7',
  8: 'sm:grid-cols-8',
  9: 'sm:grid-cols-9',
  10: 'sm:grid-cols-10',
  11: 'sm:grid-cols-11',
  12: 'sm:grid-cols-12',
};

const MD_COLS: Record<GridColCount, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};

const LG_COLS: Record<GridColCount, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
};

const XL_COLS: Record<GridColCount, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  7: 'xl:grid-cols-7',
  8: 'xl:grid-cols-8',
  9: 'xl:grid-cols-9',
  10: 'xl:grid-cols-10',
  11: 'xl:grid-cols-11',
  12: 'xl:grid-cols-12',
};

export interface GridResponsiveCols {
  base?: GridColCount;
  sm?: GridColCount;
  md?: GridColCount;
  lg?: GridColCount;
  xl?: GridColCount;
}

export type GridCols = GridColCount | GridResponsiveCols;

function colsToClassName(cols: GridCols): string {
  if (typeof cols === 'number') {
    return BASE_COLS[cols];
  }
  const parts: string[] = [];
  if (cols.base) parts.push(BASE_COLS[cols.base]);
  if (cols.sm) parts.push(SM_COLS[cols.sm]);
  if (cols.md) parts.push(MD_COLS[cols.md]);
  if (cols.lg) parts.push(LG_COLS[cols.lg]);
  if (cols.xl) parts.push(XL_COLS[cols.xl]);
  return parts.join(' ');
}

const gridVariants = cva('grid', {
  variants: {
    gap: {
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    },
  },
  defaultVariants: {
    gap: 4,
    align: 'stretch',
    justify: 'stretch',
  },
});

export type GridGap = NonNullable<VariantProps<typeof gridVariants>['gap']>;
export type GridAlign = NonNullable<VariantProps<typeof gridVariants>['align']>;
export type GridJustify = NonNullable<VariantProps<typeof gridVariants>['justify']>;
export type GridElement = 'div' | 'ul' | 'section';

export interface GridProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    Omit<VariantProps<typeof gridVariants>, 'gap' | 'align' | 'justify'> {
  /** Column count: a number (1–12) or a responsive object. Defaults to 1. */
  cols?: GridCols;
  /** Token-driven gap matching the `--space-*` scale. Defaults to 4. */
  gap?: GridGap;
  /** `align-items` passthrough. Defaults to `stretch`. */
  align?: GridAlign;
  /** `justify-items` passthrough. Defaults to `stretch`. */
  justify?: GridJustify;
  /** Element to render as. Defaults to `div`. */
  as?: GridElement;
  children?: React.ReactNode;
}

export const Grid = React.forwardRef<HTMLElement, GridProps>(function Grid(
  {
    as = 'div',
    cols = 1,
    gap = 4,
    align = 'stretch',
    justify = 'stretch',
    className,
    children,
    ...rest
  },
  ref,
) {
  return React.createElement(
    as,
    {
      ref,
      className: cn(gridVariants({ gap, align, justify }), colsToClassName(cols), className),
      ...rest,
    },
    children,
  );
});
Grid.displayName = 'Grid';
