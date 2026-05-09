import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * Props for the {@link Label} component.
 *
 * Inherits every prop accepted by the underlying
 * `@radix-ui/react-label` `Root` (e.g. `htmlFor`, `id`, `className`,
 * standard label HTML attributes). Add `required` to render the visual
 * asterisk affordance.
 */
export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /**
   * Render a red asterisk after the label text. The asterisk is
   * `aria-hidden`; pair this with `required` / `aria-required` on the
   * associated input so assistive tech announces the requirement.
   */
  required?: boolean;
}

/**
 * Form label. Token-styled wrapper around `@radix-ui/react-label`.
 *
 * Click-and-focus semantics flow through Radix: clicking the label
 * focuses the matching control via `htmlFor`, and Radix forwards
 * pointer/keyboard events safely. Typography is fixed at the small
 * weight-600 scale used across forms; pass `className` to extend.
 *
 * Accessibility:
 * - Always set `htmlFor` to the input's `id` so AT can pair them.
 * - The `required` asterisk is decorative — set `required` /
 *   `aria-required` on the input to announce the requirement.
 *
 * @example Standalone label paired with TextInput
 * ```tsx
 * <Label htmlFor="email">Email address</Label>
 * <TextInput id="email" type="email" />
 * ```
 *
 * @example Required field
 * ```tsx
 * <Label htmlFor="email" required>Email address</Label>
 * <TextInput id="email" type="email" required />
 * ```
 */
export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, children, ...rest }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'font-sans text-sm font-semibold text-foreground leading-[1.5] select-none cursor-pointer',
      className,
    )}
    {...rest}
  >
    {children}
    {required && (
      <span
        aria-hidden="true"
        className="text-[var(--color-feedback-error-fg)] ml-1"
      >
        *
      </span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = 'Label';
