import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Card surface for KPI cards, chart panels, filter sections — anywhere a
 * dashboard needs a bordered container. Composes with CardHeader / CardTitle
 * / CardDescription / CardContent / CardFooter so consumers don't re-derive
 * spacing every time.
 */

const cardVariants = cva(
  [
    'bg-card text-card-foreground',
    'border border-border rounded-[var(--radius-lg)]',
  ].join(' '),
  {
    variants: {
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: [
          'cursor-pointer transition-colors',
          'hover:bg-secondary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        ].join(' '),
        false: '',
      },
    },
    defaultVariants: {
      padding: 'md',
      interactive: false,
    },
  },
);

export type CardPadding = NonNullable<VariantProps<typeof cardVariants>['padding']>;
export type CardElement = 'div' | 'article' | 'section' | 'aside';

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof cardVariants> {
  /** Element to render as. Defaults to `div` — pick `article`/`section`/`aside` for landmarks. */
  as?: CardElement;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { as = 'div', padding = 'md', interactive = false, className, children, ...rest },
  ref,
) {
  return React.createElement(
    as,
    {
      ref,
      className: cn(cardVariants({ padding, interactive }), className),
      ...rest,
    },
    children,
  );
});
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /** Heading level (default `h3`). Pick the level that fits the page outline. */
    as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(function CardTitle({ as = 'h3', className, ...props }, ref) {
  return React.createElement(as, {
    ref,
    className: cn('text-lg font-semibold leading-tight', className),
    ...props,
  });
});
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('mt-4', className)} {...props} />;
});
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('mt-4 flex items-center', className)}
      {...props}
    />
  );
});
CardFooter.displayName = 'CardFooter';
