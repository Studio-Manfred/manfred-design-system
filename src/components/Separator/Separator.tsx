import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

type RadixSeparatorProps = React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
>;

export interface SeparatorProps
  extends Omit<RadixSeparatorProps, 'orientation'> {
  /** Visual + semantic axis. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * When `true`, the separator is purely decorative and is removed from the
   * accessibility tree. Defaults to `false` so the `role="separator"` is
   * exposed to assistive tech (matches Radix' default).
   */
  decorative?: boolean;
}

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(function Separator(
  { orientation = 'horizontal', decorative = false, className, ...rest },
  ref,
) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className,
      )}
      {...rest}
    />
  );
});

Separator.displayName = 'Separator';
