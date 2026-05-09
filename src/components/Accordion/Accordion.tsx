import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/Icon';

/**
 * Accordion — token-styled wrapper around `@radix-ui/react-accordion`.
 *
 * Sub-parts: `Accordion` (Root), `AccordionItem`, `AccordionTrigger`,
 * `AccordionContent`. The root is a passthrough so callers can use
 * Radix's discriminated `type` prop directly:
 *
 *   <Accordion type="single" collapsible>…</Accordion>
 *   <Accordion type="multiple">…</Accordion>
 *
 * Animations (chevron rotation + content slide) are gated behind the
 * `motion-safe:` Tailwind variant so users with `prefers-reduced-motion`
 * still get full open/close behaviour, just without the transitions.
 */

// Root: passthrough to Radix. Discriminated `type` union flows through
// untouched so `collapsible` is only allowed when type === 'single'.
export const Accordion = AccordionPrimitive.Root;
export type AccordionProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
>;

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

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

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {}

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

export interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

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
