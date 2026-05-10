import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

/**
 * Side-anchored sheet built on `@radix-ui/react-dialog`.
 *
 * `Sheet` is the controlled root; pair `SheetTrigger` with
 * `SheetContent` to render a panel that slides in from `top` /
 * `right` / `bottom` / `left`. Compose with `SheetHeader`,
 * `SheetTitle`, `SheetDescription`, and `SheetFooter` for layout,
 * and use `SheetClose` for any custom dismiss control inside.
 *
 * Accessibility: focus is trapped inside the open sheet, return-focus
 * is restored on close, and the overlay click-through closes by
 * default — all inherited from the Radix Dialog primitive. Slide
 * animations are wrapped in `motion-safe` so users with
 * `prefers-reduced-motion` get instant transitions.
 *
 * @example Side panel with header + footer
 * ```tsx
 * <Sheet>
 *   <SheetTrigger asChild><Button>Edit profile</Button></SheetTrigger>
 *   <SheetContent side="right">
 *     <SheetHeader>
 *       <SheetTitle>Edit profile</SheetTitle>
 *       <SheetDescription>Update your details below.</SheetDescription>
 *     </SheetHeader>
 *     <form>…</form>
 *     <SheetFooter><SheetClose asChild><Button>Save</Button></SheetClose></SheetFooter>
 *   </SheetContent>
 * </Sheet>
 * ```
 */

/** Root of the sheet. Re-export of Radix `Dialog.Root`. Wire `open`/`onOpenChange` here. */
const Sheet = DialogPrimitive.Root;
/** Element that opens the sheet — usually a `Button` with `asChild`. */
const SheetTrigger = DialogPrimitive.Trigger;
/** Imperative close button. Use inside `SheetContent` (e.g. for "Cancel"). */
const SheetClose = DialogPrimitive.Close;
/** Portal target for the overlay + content. Re-export of Radix `Dialog.Portal`. */
const SheetPortal = DialogPrimitive.Portal;

/**
 * Dimmed backdrop rendered behind the sheet. Closes on click via the
 * Radix Dialog default. Animations are gated on `motion-safe`.
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[var(--color-bg-overlay)]',
      // Animation only when reduced-motion is NOT preferred.
      'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out',
      'motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetContentVariants = cva(
  [
    'fixed z-50 gap-4 bg-background p-6 shadow-lg',
    'flex flex-col',
    'focus:outline-none',
    // Animation classes wrapped in motion-safe: so prefers-reduced-motion users
    // get an instant open/close with no slide.
    'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out',
    'motion-safe:duration-300',
  ].join(' '),
  {
    variants: {
      side: {
        top: [
          'inset-x-0 top-0 h-auto border-b border-border',
          'motion-safe:data-[state=open]:slide-in-from-top',
          'motion-safe:data-[state=closed]:slide-out-to-top',
        ].join(' '),
        right: [
          'inset-y-0 right-0 h-full w-3/4 sm:w-96 border-l border-border',
          'motion-safe:data-[state=open]:slide-in-from-right',
          'motion-safe:data-[state=closed]:slide-out-to-right',
        ].join(' '),
        bottom: [
          'inset-x-0 bottom-0 h-auto border-t border-border',
          'motion-safe:data-[state=open]:slide-in-from-bottom',
          'motion-safe:data-[state=closed]:slide-out-to-bottom',
        ].join(' '),
        left: [
          'inset-y-0 left-0 h-full w-3/4 sm:w-96 border-r border-border',
          'motion-safe:data-[state=open]:slide-in-from-left',
          'motion-safe:data-[state=closed]:slide-out-to-left',
        ].join(' '),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

export type SheetSide = NonNullable<VariantProps<typeof sheetContentVariants>['side']>;

/**
 * Props for {@link SheetContent}. Extends Radix `Dialog.Content` with
 * the `side` variant and a switch for the built-in close button.
 */
export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  /** Whether to render the close (X) button in the corner. Defaults to true. */
  showCloseButton?: boolean;
}

/**
 * Sliding panel that holds the sheet's body. Picks the slide direction
 * from `side` (top / right / bottom / left), portals to `body`, and
 * traps focus while open.
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, side = 'right', showCloseButton = true, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetContentVariants({ side }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          className="absolute top-4 right-4 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close sheet"
        >
          <Icon name="x" size="md" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Layout wrapper for the sheet's header area — typically holds
 * {@link SheetTitle} and {@link SheetDescription}. Reserves space on
 * the right for the built-in close button.
 */
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col gap-2 pb-4 border-b border-border pr-8', className)}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

/**
 * Layout wrapper for the sheet's footer — usually holds primary +
 * secondary action buttons. Stacks on small screens and right-aligns
 * inline on `sm` and up.
 */
const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mt-auto flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border',
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

/**
 * Required accessible title for the sheet. Maps to Radix `Dialog.Title`
 * so screen readers announce the panel on open.
 */
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'font-sans text-xl font-extrabold leading-[1.3] text-foreground m-0',
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Supporting copy for the sheet, usually rendered below the title.
 * Maps to Radix `Dialog.Description` so it links via
 * `aria-describedby` automatically.
 */
const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('font-sans text-sm text-muted-foreground leading-[1.7] m-0', className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
