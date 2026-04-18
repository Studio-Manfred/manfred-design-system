import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap',
    'rounded-full border-2 border-transparent cursor-pointer',
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

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
