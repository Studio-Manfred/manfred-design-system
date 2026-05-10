import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

/**
 * Compound tooltip built on `@radix-ui/react-tooltip`.
 *
 * Mount one {@link TooltipProvider} near the root of the app to share
 * a delay timer; then wrap each tooltip with `Tooltip`, point the
 * trigger element with `TooltipTrigger asChild`, and render the bubble
 * via `TooltipContent`. The bubble is portalled and animated; styling
 * uses the inverse surface tokens so it sits crisp on any background.
 *
 * Accessibility: hover, focus-visible, and keyboard-dismiss are wired
 * by Radix. The trigger receives the appropriate `aria-describedby`
 * link when open.
 *
 * @example Inline icon-button label
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild><IconButton icon="info" /></TooltipTrigger>
 *     <TooltipContent>Learn more</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */

/**
 * Shared delay-timer provider. Mount once near the root so multiple
 * tooltips share the open / close delays. Re-export of Radix
 * `Tooltip.Provider`.
 */
const TooltipProvider = TooltipPrimitive.Provider;
/** Root of a single tooltip. Re-export of Radix `Tooltip.Root`. */
const Tooltip = TooltipPrimitive.Root;
/** Element that opens the tooltip on hover / focus. Use `asChild` to point at any focusable element. */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Floating bubble portalled to `body`. Renders the tooltip text with
 * inverse surface tokens, slide-in animation, and 8px default offset.
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-sans',
        'bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)]',
        'shadow-md',
        'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
        'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
