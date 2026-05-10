import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

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

/**
 * Props for the {@link Card} root surface.
 *
 * Inherits standard HTML attributes (e.g. `id`, `onClick`, `aria-*`,
 * `data-*`) via `React.HTMLAttributes`, except `children` which is
 * declared explicitly.
 */
export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof cardVariants> {
  /**
   * Element to render as. Defaults to `div`. Pick `article` /
   * `section` / `aside` when the card represents a landmark in the
   * page outline.
   */
  as?: CardElement;
  children?: React.ReactNode;
}

/**
 * Bordered surface for KPI cards, chart panels, filter sections — any
 * dashboard or page region that needs a contained, padded container.
 *
 * Composes with `CardHeader`, `CardTitle`, `CardDescription`,
 * `CardContent`, and `CardFooter` so consumers don't re-derive spacing
 * every time. Three padding scales (`sm` / `md` / `lg`) and an
 * `interactive` flag for clickable cards.
 *
 * Accessibility:
 * - Default element is `<div>` (no implicit landmark). Use `as="article"`,
 *   `"section"`, or `"aside"` when the card should appear in the page's
 *   landmark structure.
 * - For clickable cards, prefer wrapping the card in a `<button>` over
 *   adding `role="button"` to the card element. axe rejects `role="button"`
 *   on landmark elements like `<article>`.
 * - The `interactive` variant only adds the hover / focus ring — the
 *   caller is still responsible for `tabIndex`, key handling, and ARIA.
 *
 * @example KPI tile
 * ```tsx
 * <Card padding="md" className="w-56">
 *   <CardHeader>
 *     <CardDescription>Conversion rate</CardDescription>
 *     <CardTitle as="h2" className="text-3xl">12.4%</CardTitle>
 *   </CardHeader>
 * </Card>
 * ```
 *
 * @example Section with title and footer
 * ```tsx
 * <Card as="section" aria-labelledby="report-title">
 *   <CardHeader>
 *     <CardTitle id="report-title">Quarterly report</CardTitle>
 *     <CardDescription>Q1 2026</CardDescription>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 *   <CardFooter>
 *     <Button variant="brand">Open</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
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

/**
 * Top-of-card region that groups the title and (optional) description
 * with consistent vertical spacing.
 *
 * Renders a `<div>` with column flex and a small gap. Pair with
 * `CardTitle` and `CardDescription` for the standard header pattern.
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Lane breakdown</CardTitle>
 *   <CardDescription>Last 30 days</CardDescription>
 * </CardHeader>
 * ```
 */
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

/**
 * Heading element inside a `CardHeader`. Defaults to `<h3>` to fit the
 * typical page outline (page `<h1>`, section `<h2>`, card `<h3>`); pass
 * `as` to pick a different heading level when the page hierarchy
 * differs.
 *
 * Accessibility:
 * - Always renders a real heading element so screen readers can list it
 *   in the page outline. Don't use a non-heading wrapper for the card
 *   title.
 *
 * @example
 * ```tsx
 * <CardTitle as="h2" className="text-3xl">12.4%</CardTitle>
 * ```
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /**
     * Heading level. Defaults to `h3`. Pick the level that fits the
     * surrounding page outline so the card slots correctly into the
     * accessibility tree.
     */
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

/**
 * Subdued explanatory copy that sits beneath the `CardTitle`. Renders
 * as a `<p>` with the muted-foreground colour.
 *
 * @example
 * ```tsx
 * <CardDescription>Last 30 days</CardDescription>
 * ```
 */
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

/**
 * Main content region of the card. Adds top margin so it sits clear of
 * the header. Accepts arbitrary children — paragraphs, charts, lists.
 *
 * @example
 * ```tsx
 * <CardContent>
 *   <DonutChart data={data} />
 * </CardContent>
 * ```
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('mt-4', className)} {...props} />;
});
CardContent.displayName = 'CardContent';

/**
 * Bottom-of-card region. Lays children out as a horizontal flex row —
 * use for action buttons, metadata, or supporting badges.
 *
 * @example
 * ```tsx
 * <CardFooter className="gap-2">
 *   <Badge variant="success">+2.1pp</Badge>
 *   <span className="text-xs text-muted-foreground">vs last week</span>
 * </CardFooter>
 * ```
 */
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
