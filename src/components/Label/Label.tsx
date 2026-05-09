import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /**
   * When true, renders a red asterisk after the label text.
   * The asterisk is `aria-hidden`; pair this with `required` /
   * `aria-required` on the associated input for screen-reader semantics.
   */
  required?: boolean;
}

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
