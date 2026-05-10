import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/Icon';

/**
 * Props for the {@link Accordion} root.
 *
 * Forwarded directly to `@radix-ui/react-accordion`'s `Root`. Radix's
 * discriminated `type` union is preserved — `collapsible` is only valid
 * when `type === 'single'`. Use `value` / `onValueChange` for controlled
 * mode, `defaultValue` for uncontrolled.
 */
export type AccordionProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
>;

/**
 * Vertically stacked, expand-and-collapse panel set built on
 * `@radix-ui/react-accordion`.
 *
 * Compose with `AccordionItem`, `AccordionTrigger`, and
 * `AccordionContent`. The root is a passthrough to Radix so you can use
 * the discriminated `type` prop directly:
 *
 *   <Accordion type="single" collapsible>…</Accordion>
 *   <Accordion type="multiple">…</Accordion>
 *
 * Accessibility:
 * - Radix handles roving tabindex, ARIA `aria-expanded` / `aria-controls`,
 *   and keyboard navigation (Arrow keys, Home / End, Space / Enter).
 * - Chevron rotation and content slide animations are gated behind
 *   `motion-safe:` — `prefers-reduced-motion` users still get full
 *   open / close behaviour, just without the transition.
 *
 * @example Single-open FAQ
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="q1">
 *     <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *     <AccordionContent>Yes — built on Radix Accordion.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * @example Multiple-open settings sections
 * ```tsx
 * <Accordion type="multiple" defaultValue={['account']}>
 *   <AccordionItem value="account">
 *     <AccordionTrigger>Account</AccordionTrigger>
 *     <AccordionContent>…</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export const Accordion = AccordionPrimitive.Root;

/**
 * Props for {@link AccordionItem}. Forwarded to Radix `Accordion.Item`.
 * The `value` prop is required and uniquely identifies the item within
 * the parent root.
 */
export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

/**
 * Single collapsible row inside an `Accordion`. Wraps Radix
 * `Accordion.Item` and adds the bottom border that visually separates
 * adjacent items (the last item's border is removed).
 *
 * Must contain exactly one `AccordionTrigger` and one `AccordionContent`.
 *
 * @example
 * ```tsx
 * <AccordionItem value="billing">
 *   <AccordionTrigger>Billing</AccordionTrigger>
 *   <AccordionContent>Update card or change plan.</AccordionContent>
 * </AccordionItem>
 * ```
 */
export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn('border-b border-border last:border-b-0', className)}
      {...props}
    />
  );
});
AccordionItem.displayName = 'AccordionItem';

/**
 * Props for {@link AccordionTrigger}. Forwarded to Radix
 * `Accordion.Trigger`, which renders a `<button>` and wires up
 * `aria-expanded` / `aria-controls` automatically.
 */
export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {}

/**
 * Clickable header that toggles its sibling `AccordionContent`. Renders
 * the trigger inside a Radix `Accordion.Header` and appends a chevron
 * that rotates 180° when the item is open.
 *
 * Accessibility:
 * - The chevron is purely decorative — `aria-expanded` on the underlying
 *   button is what assistive tech announces.
 * - Focus uses the design-system `--shadow-focus` ring (not the default
 *   browser outline).
 *
 * @example
 * ```tsx
 * <AccordionTrigger>How do I export my data?</AccordionTrigger>
 * ```
 */
export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground',
          'hover:underline',
          'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] rounded-sm',
          'motion-safe:transition-colors',
          '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          name="chevron-down"
          size="sm"
          className="shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

/**
 * Props for {@link AccordionContent}. Forwarded to Radix
 * `Accordion.Content`, which controls mount / unmount and the
 * `data-state` attribute used to drive the slide animation.
 */
export interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

/**
 * Collapsible body paired with an `AccordionTrigger`. Animates open /
 * close via the `accordion-up` / `accordion-down` keyframes, gated
 * behind `motion-safe:` for reduced-motion users.
 *
 * Accepts arbitrary children — paragraphs, lists, buttons — not just
 * a string.
 *
 * @example
 * ```tsx
 * <AccordionContent>
 *   <p>Plain text or rich content. Buttons, lists, links all work.</p>
 * </AccordionContent>
 * ```
 */
export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        'overflow-hidden text-sm text-foreground',
        'motion-safe:data-[state=closed]:animate-accordion-up',
        'motion-safe:data-[state=open]:animate-accordion-down',
      )}
      {...props}
    >
      <div className={cn('pb-4 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = 'AccordionContent';
