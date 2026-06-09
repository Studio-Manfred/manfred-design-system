import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap',
    'rounded-none border-2 border-transparent cursor-pointer',
    'transition-[background-color,color,border-color,opacity] duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'aria-busy:opacity-70 aria-busy:cursor-wait',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-interactive-primary-bg)] text-[var(--color-interactive-primary-fg)] border-[var(--color-interactive-primary-bg)]',
          '[&:hover:not(:disabled)]:bg-[var(--color-interactive-primary-bg-hover)] [&:hover:not(:disabled)]:border-[var(--color-interactive-primary-bg-hover)]',
          '[&:active:not(:disabled)]:bg-[var(--color-interactive-primary-bg-active)] [&:active:not(:disabled)]:border-[var(--color-interactive-primary-bg-active)]',
        ].join(' '),
        brand: [
          'bg-[var(--color-interactive-brand-bg)] text-[var(--color-interactive-brand-fg)] border-[var(--color-interactive-brand-bg)]',
          '[&:hover:not(:disabled)]:bg-[var(--color-interactive-brand-bg-hover)] [&:hover:not(:disabled)]:border-[var(--color-interactive-brand-bg-hover)]',
          '[&:active:not(:disabled)]:bg-[var(--color-interactive-brand-bg-active)] [&:active:not(:disabled)]:border-[var(--color-interactive-brand-bg-active)]',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground border-destructive',
          '[&:hover:not(:disabled)]:bg-destructive/90 [&:hover:not(:disabled)]:border-destructive/90',
          '[&:active:not(:disabled)]:bg-destructive/80 [&:active:not(:disabled)]:border-destructive/80',
        ].join(' '),
        outline: [
          'bg-transparent text-foreground border-[var(--color-interactive-outline-border)]',
          '[&:hover:not(:disabled)]:bg-[var(--color-interactive-outline-bg-hover)] [&:hover:not(:disabled)]:border-[var(--color-interactive-outline-border-hover)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-foreground border-transparent',
          '[&:hover:not(:disabled)]:bg-[var(--color-interactive-ghost-bg-hover)]',
        ].join(' '),
        inverse: [
          'bg-[var(--color-interactive-inverse-bg)] text-[var(--color-interactive-inverse-fg)] border-transparent',
          '[&:hover:not(:disabled)]:bg-[var(--color-interactive-inverse-bg-hover)]',
          '[&:active:not(:disabled)]:bg-[var(--color-interactive-inverse-bg-active)]',
        ].join(' '),
      },
      size: {
        sm: 'h-8 text-sm px-4 py-2',
        md: 'h-10 text-base px-6 py-3',
        lg: 'h-12 text-lg px-8 py-4',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

/**
 * Props for the {@link Button} component.
 *
 * Inherits every native `<button>` attribute (e.g. `onClick`, `type`,
 * `name`, `form`, `disabled`) via `React.ButtonHTMLAttributes`. The
 * cva-derived `variant`, `size`, and `fullWidth` props are documented
 * in the Storybook controls panel — see Components/Button.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render the button as the immediate child element using Radix
   * `Slot` instead of a native `<button>`. Useful when an `<a>` (or
   * any other element) needs the button's visual treatment, focus
   * ring, and ARIA. The child must accept `className` and `ref`.
   */
  asChild?: boolean;
  /**
   * Show a loading state. Disables interaction (`disabled` is forced
   * true) and announces busy to assistive tech via `aria-busy="true"`.
   * The caller renders any spinner / label change inside `children`.
   */
  isLoading?: boolean;
  /**
   * Button label or content. Required. Pass plain text, an icon + text
   * combo, or a single element wrapped in an icon-only container.
   */
  children: React.ReactNode;
}

/**
 * Brand button. Primary call-to-action component.
 *
 * Six visual variants (`primary` / `brand` / `destructive` / `outline` /
 * `ghost` / `inverse`), three sizes (`sm` / `md` / `lg`), optional
 * loading state, and an `asChild` escape hatch for rendering as a
 * link or other element while keeping the visual treatment.
 *
 * Use `destructive` for delete / remove / cancel-with-consequence
 * actions — it routes through the shadcn-contract `--destructive`
 * tokens, so the dark-mode rebind is automatic.
 *
 * Accessibility:
 * - Loading state announces via `aria-busy="true"` and disables interaction.
 * - Focus ring uses the `--ring` token; reduced-motion users skip the
 *   colour transitions automatically.
 * - When `asChild` is true the button delegates to its child element —
 *   ensure the child is keyboard-reachable (an `<a>` with `href`,
 *   a `<button>`, etc.) and carries any required ARIA.
 *
 * @example Default brand call-to-action
 * ```tsx
 * <Button variant="brand" onClick={onSave}>Save changes</Button>
 * ```
 *
 * @example Link styled as a button
 * ```tsx
 * <Button asChild variant="outline">
 *   <a href="/docs">Read the docs</a>
 * </Button>
 * ```
 *
 * @example Loading state during submission
 * ```tsx
 * <Button isLoading={isSubmitting} type="submit">
 *   {isSubmitting ? 'Saving…' : 'Save'}
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...rest
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
