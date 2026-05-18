import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

/**
 * One breadcrumb entry — usually a page or section in the hierarchy.
 * The last item in the list is rendered as the current page (no link)
 * and the rest as anchors when `href` is provided.
 */
export interface BreadcrumbItem {
  /** Visible text. Required. */
  label: string;
  /**
   * Link target for non-current items. Omit on the last item; for
   * intermediate items without a destination, omit and the entry will
   * render as plain muted text.
   */
  href?: string;
}

/**
 * Props for the {@link Breadcrumb} component.
 *
 * Inherits every native `<nav>` attribute via
 * `React.HTMLAttributes<HTMLElement>`. The component defaults
 * `aria-label="Breadcrumb"`; pass `aria-label` explicitly when more
 * than one breadcrumb exists on a page to give each a distinct name.
 */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Ordered list of breadcrumb entries from root to current page. The
   * last item is treated as the current page and gets `aria-current`.
   */
  items: BreadcrumbItem[];
  /**
   * Visual divider between items. `chevron` (default) for typical app
   * shells; `slash` for a denser, text-only treatment.
   */
  separator?: 'chevron' | 'slash';
}

/**
 * Hierarchical wayfinding trail — shows where the user is in a nested
 * page structure and provides links back to ancestors.
 *
 * Renders a `<nav aria-label="Breadcrumb">` containing an ordered list.
 * The current page (last item) is rendered with `aria-current="page"`,
 * not a link; intermediate items become `<a>` tags when `href` is set.
 *
 * Accessibility:
 * - Wrapped in a navigation landmark with an explicit label so screen
 *   readers can jump to it.
 * - Separators are `aria-hidden` — assistive tech follows the list
 *   structure, not the visual divider.
 * - The current page is identified via `aria-current="page"`.
 *
 * @example Standard trail
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Shoes' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  separator = 'chevron',
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...rest
}: BreadcrumbProps) {
  return (
    <nav {...rest} aria-label={ariaLabel} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="text-muted-foreground flex items-center" aria-hidden="true">
                  {separator === 'chevron' ? (
                    <Icon name="chevron-right" size="xs" />
                  ) : (
                    <span className="text-muted-foreground">/</span>
                  )}
                </li>
              )}
              <li className="flex items-center">
                {isLast ? (
                  <span className="font-semibold text-foreground" aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
