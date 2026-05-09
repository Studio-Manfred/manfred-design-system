import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

type RadixSeparatorProps = React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
>;

/**
 * Props for the {@link Separator} component.
 *
 * Inherits every native attribute supported by `@radix-ui/react-separator`'s
 * Root element via `React.ComponentPropsWithoutRef`. The custom
 * `orientation` and `decorative` props mirror the Radix API.
 */
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

/**
 * Hairline divider built on `@radix-ui/react-separator`.
 *
 * Renders a 1px line in the `--border` token along the chosen axis,
 * stretching to fill the parent on the cross axis. Use semantically to
 * separate content groups, or set `decorative` for a purely visual rule.
 *
 * Accessibility:
 * - Defaults to `role="separator"` with `aria-orientation` set, so
 *   assistive tech can announce the structural break.
 * - `decorative` removes the role from the a11y tree — appropriate
 *   when the separator only adds visual rhythm and the surrounding
 *   markup already conveys the grouping.
 *
 * @example Horizontal section break
 * ```tsx
 * <Stack gap="md">
 *   <h2>Profile</h2>
 *   <Separator />
 *   <p>Account details…</p>
 * </Stack>
 * ```
 *
 * @example Vertical divider in a toolbar
 * ```tsx
 * <HStack gap="sm">
 *   <Button>Save</Button>
 *   <Separator orientation="vertical" decorative />
 *   <Button variant="ghost">Cancel</Button>
 * </HStack>
 * ```
 */
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
