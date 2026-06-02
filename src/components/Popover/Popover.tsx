import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

/**
 * Compound popover built on `@radix-ui/react-popover`.
 *
 * A floating panel anchored to a trigger — use it for secondary controls,
 * settings, filters, or rich hover-cards that need real interactive content
 * (unlike {@link Tooltip}, which is for short, non-interactive labels).
 *
 * Compose `Popover` (root) with `PopoverTrigger` and `PopoverContent`. The
 * trigger is `asChild`, so **any** element opens the panel — a `Button`, a
 * link, an icon button, a `Badge`, plain text. The content is portalled to
 * `body`, animated, and styled with the popover surface tokens; Radix handles
 * focus management, outside-click / Escape dismissal, and `aria-expanded` /
 * `aria-controls` on the trigger.
 *
 * @example Icon button trigger
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="ghost" aria-label="Settings"><Icon name="settings" /></Button>
 *   </PopoverTrigger>
 *   <PopoverContent align="end">
 *     …settings controls…
 *   </PopoverContent>
 * </Popover>
 * ```
 *
 * @example Link trigger with a close button
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild><a href="#">What's this?</a></PopoverTrigger>
 *   <PopoverContent>
 *     <p>Some explanation.</p>
 *     <PopoverClose asChild><Button size="sm">Got it</Button></PopoverClose>
 *   </PopoverContent>
 * </Popover>
 * ```
 */

/** Root of a single popover. Re-export of Radix `Popover.Root`. Use `open` / `onOpenChange` for controlled mode. */
const Popover = PopoverPrimitive.Root;

/** Element that opens the popover. Use `asChild` to point at any element (button, link, icon, …). Re-export of Radix `Popover.Trigger`. */
const PopoverTrigger = PopoverPrimitive.Trigger;

/** Optional anchor to position the panel against an element other than the trigger. Re-export of Radix `Popover.Anchor`. */
const PopoverAnchor = PopoverPrimitive.Anchor;

/** Closes the popover from inside the content. Use `asChild` to wrap your own button. Re-export of Radix `Popover.Close`. */
const PopoverClose = PopoverPrimitive.Close;

/** Props for {@link PopoverContent}. Forwarded to Radix `Popover.Content`. */
export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {}

/**
 * Floating panel portalled to `body`. Renders on the popover surface tokens
 * with a default 288px (`w-72`) width, an 8px offset, and a `data-state`
 * open / close animation gated so reduced-motion users still get the panel.
 * `align` / `side` / `sideOffset` are forwarded to Radix for placement.
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(function PopoverContent({ className, align = 'center', sideOffset = 8, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-[var(--radius-md)] border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose };
