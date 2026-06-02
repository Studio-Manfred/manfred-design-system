import * as React from 'react';
import { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from '@/components/Button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/Popover';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/utils';

/**
 * A split button: a primary action joined to a dropdown toggle —
 * `[ Play │ ▾ ]`. The left segment runs the main action; the right segment
 * (a chevron) opens a popover of secondary controls or actions.
 *
 * Built on {@link Button} (so it inherits every variant / size and the brand
 * theming) and the DS {@link Popover} (focus, outside-click / Escape dismissal,
 * `aria-expanded` wiring). Compose four parts:
 *
 *   <SplitButton variant="brand">
 *     <SplitButtonAction onClick={play}>Play</SplitButtonAction>
 *     <SplitButtonTrigger aria-label="More play options" />
 *     <SplitButtonContent>…menu or controls…</SplitButtonContent>
 *   </SplitButton>
 *
 * `variant` / `size` are set once on `SplitButton` and flow to both segments
 * via context, so they always match. The chevron rotates when open.
 *
 * Accessibility: the two segments are wrapped in a `role="group"`; the trigger
 * requires an `aria-label` (it has no text). The action and the dropdown are
 * independently focusable buttons.
 */

interface SplitButtonContextValue {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
const SplitButtonContext = React.createContext<SplitButtonContextValue>({});

/** Props for {@link SplitButton}. Extends the DS {@link Popover} root (open / onOpenChange / defaultOpen / modal). */
export interface SplitButtonProps extends React.ComponentProps<typeof Popover> {
  /** Visual variant, applied to both segments. Mirrors `Button`. Default `primary`. */
  variant?: ButtonVariant;
  /** Size, applied to both segments. Mirrors `Button`. Default `md`. */
  size?: ButtonSize;
}

function SplitButton({ variant = 'primary', size = 'md', children, ...rootProps }: SplitButtonProps) {
  return (
    <Popover {...rootProps}>
      <SplitButtonContext.Provider value={{ variant, size }}>
        <div role="group" className="inline-flex items-stretch">
          {children}
        </div>
      </SplitButtonContext.Provider>
    </Popover>
  );
}
SplitButton.displayName = 'SplitButton';

/** Props for {@link SplitButtonAction}. Every `Button` prop except `variant` / `size` (inherited from `SplitButton`). */
export interface SplitButtonActionProps extends Omit<ButtonProps, 'variant' | 'size'> {}

/** The primary-action (left) segment. Runs the main action on click; square inner corner. */
const SplitButtonAction = React.forwardRef<HTMLButtonElement, SplitButtonActionProps>(
  function SplitButtonAction({ className, ...props }, ref) {
    const { variant, size } = React.useContext(SplitButtonContext);
    return <Button ref={ref} variant={variant} size={size} className={cn('rounded-r-none', className)} {...props} />;
  },
);

/** Props for {@link SplitButtonTrigger}. `aria-label` is required (the chevron has no text). */
export interface SplitButtonTriggerProps extends Omit<ButtonProps, 'variant' | 'size' | 'children'> {
  /** Accessible name for the dropdown toggle, e.g. "More options". */
  'aria-label': string;
  /** Override the default chevron glyph if needed. */
  children?: React.ReactNode;
}

/** The dropdown-toggle (right) segment — a chevron that opens the popover. Square inner corner; chevron rotates when open. */
const SplitButtonTrigger = React.forwardRef<HTMLButtonElement, SplitButtonTriggerProps>(
  function SplitButtonTrigger({ className, children, ...props }, ref) {
    const { variant, size } = React.useContext(SplitButtonContext);
    return (
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn(
            'rounded-l-none -ml-0.5 px-3',
            'motion-safe:[&>svg]:transition-transform motion-safe:[&>svg]:duration-200 [&[data-state=open]>svg]:rotate-180',
            className,
          )}
          {...props}
        >
          {children ?? <Icon name="chevron-down" size="sm" />}
        </Button>
      </PopoverTrigger>
    );
  },
);

/** Props for {@link SplitButtonContent}. Forwarded to the DS `PopoverContent`. */
export interface SplitButtonContentProps extends React.ComponentProps<typeof PopoverContent> {}

/** The dropdown panel. Defaults to `align="end"` so it lines up under the chevron. */
const SplitButtonContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  SplitButtonContentProps
>(function SplitButtonContent({ align = 'end', ...props }, ref) {
  return <PopoverContent ref={ref} align={align} {...props} />;
});
SplitButtonContent.displayName = 'SplitButtonContent';

export { SplitButton, SplitButtonAction, SplitButtonTrigger, SplitButtonContent };
