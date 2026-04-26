import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Stack — sibling-spacing primitive. DS components intentionally carry no
 * external margin (keeps them composable); Stack owns the gap. Vertical by
 * default. `VStack` / `HStack` are pre-bound aliases for clearer call sites.
 */

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
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
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    wrap: {
      true: 'flex-wrap',
      false: '',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    gap: 4,
    align: 'stretch',
    justify: 'start',
    wrap: false,
    fullWidth: false,
  },
});

export type StackDirection = NonNullable<
  VariantProps<typeof stackVariants>['direction']
>;
export type StackGap = NonNullable<VariantProps<typeof stackVariants>['gap']>;
export type StackAlign = NonNullable<
  VariantProps<typeof stackVariants>['align']
>;
export type StackJustify = NonNullable<
  VariantProps<typeof stackVariants>['justify']
>;

export type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol' | 'li';

export interface StackProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof stackVariants> {
  /** Element to render as. Defaults to `div`. Use `ul`/`ol`/`li` for lists, `nav`/`section` for landmarks. */
  as?: StackElement;
  children?: React.ReactNode;
}

export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  {
    as = 'div',
    direction = 'vertical',
    gap = 4,
    align = 'stretch',
    justify = 'start',
    wrap = false,
    fullWidth = false,
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
      className: cn(
        stackVariants({ direction, gap, align, justify, wrap, fullWidth }),
        className,
      ),
      ...rest,
    },
    children,
  );
});
Stack.displayName = 'Stack';

export type VStackProps = Omit<StackProps, 'direction'>;
export type HStackProps = Omit<StackProps, 'direction'>;

export const VStack = React.forwardRef<HTMLElement, VStackProps>(function VStack(
  props,
  ref,
) {
  return <Stack ref={ref} direction="vertical" {...props} />;
});
VStack.displayName = 'VStack';

export const HStack = React.forwardRef<HTMLElement, HStackProps>(function HStack(
  props,
  ref,
) {
  return <Stack ref={ref} direction="horizontal" {...props} />;
});
HStack.displayName = 'HStack';
