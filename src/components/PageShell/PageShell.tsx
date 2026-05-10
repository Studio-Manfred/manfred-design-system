import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * PageShell — full-viewport application shell with one main landmark.
 *
 * Composition follows the shadcn pattern (Card / CardHeader / etc.):
 *
 * ```tsx
 * <PageShell>
 *   <PageHeader>...</PageHeader>
 *   <PageBody>...</PageBody>
 *   <PageFooter>...</PageFooter>
 * </PageShell>
 * ```
 *
 * Behaviour contract:
 * - PageShell is a flex column at min-h-screen.
 * - A skip-link is auto-rendered as the first focusable element, jumping to
 *   PageBody (which is locked to <main>) for keyboard users.
 * - PageHeader is sticky-top by default.
 * - PageBody is the only <main> on the page (the rule whose existence is the
 *   whole point — see the Storybook stories which re-enable
 *   `landmark-one-main` for this component).
 * - PageFooter sits below the body. Because PageBody owns `flex-1`, the
 *   footer naturally pins to the viewport bottom when content is short.
 */

/**
 * Default id used by the skip-link target. Stable so consumers can link to
 * the main content from elsewhere if needed.
 */
const DEFAULT_MAIN_ID = 'page-body';

// --------------------------------------------------------------------------
// PageShell (root)
// --------------------------------------------------------------------------

/**
 * Props for the {@link PageShell} root. Inherits standard `<div>`
 * attributes; the page-level a11y wiring is handled by the dedicated
 * skip-link props below.
 */
export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Id used for the skip-link target. Must match the id passed to PageBody
   * (PageBody defaults to the same value, so leaving both unset is fine).
   */
  mainId?: string;
  /** Label on the skip-link. Defaults to "Skip to main content". */
  skipLinkLabel?: string;
  /** Set false to omit the skip-link entirely. Defaults to true. */
  includeSkipLink?: boolean;
}

/**
 * Full-viewport application shell with one main landmark.
 *
 * Wraps the page in a `min-h-screen` flex column, auto-renders a
 * keyboard-only skip-link as the first focusable element, and locks
 * the inner {@link PageBody} to `<main>`. Compose with
 * {@link PageHeader}, {@link PageBody}, and {@link PageFooter} —
 * Card-style composition.
 *
 * @example Standard app shell
 * ```tsx
 * <PageShell>
 *   <PageHeader><NavBar /></PageHeader>
 *   <PageBody><Container>…</Container></PageBody>
 *   <PageFooter>© Studio Manfred</PageFooter>
 * </PageShell>
 * ```
 */
export const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  function PageShell(
    {
      className,
      children,
      mainId = DEFAULT_MAIN_ID,
      skipLinkLabel = 'Skip to main content',
      includeSkipLink = true,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn('min-h-screen flex flex-col', className)}
        {...rest}
      >
        {includeSkipLink ? (
          <a
            href={`#${mainId}`}
            className={cn(
              'sr-only focus:not-sr-only',
              'focus:absolute focus:top-2 focus:left-2 focus:z-[100]',
              'focus:px-3 focus:py-2 focus:rounded-[var(--radius-sm)]',
              'focus:bg-background focus:text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
            )}
          >
            {skipLinkLabel}
          </a>
        ) : null}
        {children}
      </div>
    );
  },
);
PageShell.displayName = 'PageShell';

// --------------------------------------------------------------------------
// PageHeader
// --------------------------------------------------------------------------

const pageHeaderVariants = cva(
  ['w-full', 'bg-background border-b border-border'].join(' '),
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-50',
        false: '',
      },
    },
    defaultVariants: {
      sticky: true,
    },
  },
);

/**
 * Props for {@link PageHeader}. Adds the `sticky` toggle on top of
 * standard `<header>` attributes.
 */
export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof pageHeaderVariants> {}

/**
 * Top chrome rendered as a `<header>` landmark. Sticky to the top of
 * the viewport by default; pass `sticky={false}` for an inline header.
 */
export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader({ className, sticky = true, children, ...rest }, ref) {
    return (
      <header
        ref={ref}
        className={cn(pageHeaderVariants({ sticky }), className)}
        {...rest}
      >
        {children}
      </header>
    );
  },
);
PageHeader.displayName = 'PageHeader';

// --------------------------------------------------------------------------
// PageBody — locked to <main>
// --------------------------------------------------------------------------

const pageBodyVariants = cva(['flex-1 overflow-y-auto'].join(' '), {
  variants: {
    padded: {
      true: 'px-4 sm:px-6 lg:px-8 py-6',
      false: '',
    },
  },
  defaultVariants: {
    padded: true,
  },
});

/**
 * Props for {@link PageBody}. Adds a `padded` toggle for the responsive
 * inner padding.
 */
export interface PageBodyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof pageBodyVariants> {}

/**
 * The page's `<main>` landmark. Owns `flex-1` so the surrounding header
 * + footer pin correctly when content is short, and is the target of
 * the auto-rendered skip-link via its `id`.
 */
export const PageBody = React.forwardRef<HTMLElement, PageBodyProps>(
  function PageBody(
    { className, padded = true, id = DEFAULT_MAIN_ID, children, ...rest },
    ref,
  ) {
    return (
      <main
        ref={ref}
        id={id}
        className={cn(pageBodyVariants({ padded }), className)}
        {...rest}
      >
        {children}
      </main>
    );
  },
);
PageBody.displayName = 'PageBody';

// --------------------------------------------------------------------------
// PageFooter
// --------------------------------------------------------------------------

/** Props for {@link PageFooter}. Standard `<footer>` attributes. */
export interface PageFooterProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Bottom chrome rendered as a `<footer>` landmark. Sits below the body;
 * because PageBody owns `flex-1`, the footer naturally hugs the
 * viewport bottom on short pages.
 */
export const PageFooter = React.forwardRef<HTMLElement, PageFooterProps>(
  function PageFooter({ className, children, ...rest }, ref) {
    return (
      <footer
        ref={ref}
        className={cn(
          'w-full border-t border-border bg-background',
          'px-4 sm:px-6 lg:px-8 py-4',
          'text-sm text-muted-foreground',
          className,
        )}
        {...rest}
      >
        {children}
      </footer>
    );
  },
);
PageFooter.displayName = 'PageFooter';

// Re-export the constant for consumers who want to align their own anchors.
export { DEFAULT_MAIN_ID as PAGE_SHELL_DEFAULT_MAIN_ID };
