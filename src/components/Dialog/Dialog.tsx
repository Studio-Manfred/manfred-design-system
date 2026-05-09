import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

/**
 * Root of the dialog primitive. Owns open / close state — uncontrolled
 * by default, or wire `open` + `onOpenChange` for the controlled flavour.
 * Re-exported from `@radix-ui/react-dialog` so every dialog inherits the
 * focus-trap, scroll-lock, and `Escape` handling that Radix provides.
 *
 * @example Uncontrolled with a trigger
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *   <DialogContent>{...}</DialogContent>
 * </Dialog>
 * ```
 */
const Dialog = DialogPrimitive.Root;

/**
 * Element that opens the dialog. Use `asChild` to delegate the role
 * onto a `Button` (or any focusable element) and avoid a nested
 * `<button>` — Radix forwards the click + ARIA wiring through `Slot`.
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Portal target for {@link DialogContent}. Used internally by
 * `DialogContent`; only export-consumers reach for it directly when
 * they need to mount overlay siblings outside the default body root.
 */
const DialogPortal = DialogPrimitive.Portal;

/**
 * Element that closes the dialog when activated. Wrap a `Button`
 * with `asChild` to use it inside `DialogFooter`.
 */
const DialogClose = DialogPrimitive.Close;

/**
 * Backdrop scrim rendered behind {@link DialogContent}. Fades in /
 * out via the `data-[state]` selectors and uses the
 * `--color-bg-overlay` token. Rendered automatically by `DialogContent`
 * — exported for callers who need a custom content wrapper.
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[var(--color-bg-overlay)]',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const contentVariants = cva(
  [
    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
    'w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-auto',
    'bg-background rounded-[var(--radius-lg)] shadow-2xl',
    'flex flex-col gap-4 p-6',
    'focus:outline-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
    'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

/**
 * Props for the {@link DialogContent} component. Forwards every prop
 * from `@radix-ui/react-dialog` `Content` (e.g. `onOpenAutoFocus`,
 * `onCloseAutoFocus`, `onEscapeKeyDown`) plus the cva-derived `size`.
 */
export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof contentVariants> {
  /**
   * Render the built-in close button (top-right `X` icon). Set to
   * `false` for forced-choice dialogs where the user must pick one
   * of the footer actions. Defaults to `true`.
   */
  showCloseButton?: boolean;
}

/**
 * Modal dialog body. Centred, focus-trapped, scroll-locks the page
 * behind it, and dismisses on `Escape` — all via
 * `@radix-ui/react-dialog`. Renders the {@link DialogOverlay} and
 * an `X` close button automatically; opt out with `showCloseButton={false}`.
 *
 * Three sizes: `sm` (max-w-md), `md` (max-w-lg, default), `lg` (max-w-2xl).
 *
 * Accessibility:
 * - Pair with `DialogTitle` and `DialogDescription` so Radix can wire
 *   `aria-labelledby` / `aria-describedby` automatically.
 * - When `showCloseButton` is `false` make sure the footer offers a
 *   keyboard-reachable action — otherwise the dialog can only be
 *   dismissed via `Escape`.
 *
 * @example Basic confirmation dialog
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Are you sure?</DialogTitle>
 *     <DialogDescription>This cannot be undone.</DialogDescription>
 *   </DialogHeader>
 *   <DialogFooter>
 *     <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
 *     <DialogClose asChild><Button variant="brand">Confirm</Button></DialogClose>
 *   </DialogFooter>
 * </DialogContent>
 * ```
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, size, showCloseButton = true, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(contentVariants({ size }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          className="absolute top-4 right-4 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close dialog"
        >
          <Icon name="x" size="md" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Header slot for {@link DialogContent}. Vertical stack with a
 * border-bottom separator. Reserve right-side padding so the
 * built-in close button doesn't collide with the title.
 */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col gap-2 pb-4 border-b border-border pr-8',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * Footer slot for {@link DialogContent}. Stacks vertically on mobile
 * and switches to right-aligned row on `sm:` and up — so confirm
 * actions sit on the right and cancel actions on the left where
 * desktop conventions expect them.
 */
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * Dialog heading. Wraps `@radix-ui/react-dialog` `Title` so Radix can
 * wire `aria-labelledby` on the content automatically. Required for
 * the dialog to have an accessible name — omit it and Radix logs a
 * dev warning.
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-sans text-2xl font-extrabold leading-[1.3] text-foreground m-0', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Supporting copy for the dialog. Wraps `@radix-ui/react-dialog`
 * `Description` so Radix wires `aria-describedby` for screen readers.
 * Optional but strongly recommended whenever the dialog asks for
 * confirmation or describes a destructive action.
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('font-sans text-base text-muted-foreground leading-[1.7] m-0', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
