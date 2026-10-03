import * as React from 'react';
import { cn } from '@/lib/utils';

/** One entry in a {@link TableOfContents}: a heading already in the DOM. */
export interface TableOfContentsItem {
  /** `id` of the heading element on the page. The link points at `#id`. */
  id: string;
  /** Visible link text, usually the heading text. */
  label: string;
  /**
   * Outline depth. Levels are relative: a higher level than the previous
   * item nests one step under it (h3 under h2), so map heading levels
   * straight through (`level: 2` for h2, `3` for h3) or start at 1. A jump
   * of two levels still nests only one step.
   */
  level: 1 | 2 | 3;
}

/**
 * Props for {@link TableOfContents}. Inherits the native `<nav>` attributes
 * (`className`, `data-*`, …).
 */
export interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  /** The headings to list, in page order. An empty list renders nothing. */
  items: TableOfContentsItem[];
  /**
   * Controlled active section: the `id` of the item to highlight, or `null`
   * for none. Leave `undefined` (the default) for built-in tracking, which
   * follows the scroll position with an `IntersectionObserver`. Without
   * `IntersectionObserver` (jsdom, SSR, very old browsers) there is no
   * tracking, only the highlight of the last clicked link.
   */
  activeId?: string | null;
  /**
   * Height in px of a sticky header above the content (default `0`). A
   * section becomes active when its heading scrolls up to this line. Give
   * the headings a matching `scroll-margin-top` so a click doesn't park the
   * heading under the header.
   */
  offsetTop?: number;
  /** Visible title, which also names the navigation landmark. Default "On this page". */
  label?: string;
  /**
   * Called with the item `id` after a link click has scrolled to and
   * focused its heading, e.g. to update the URL hash or log analytics.
   */
  onNavigate?: (id: string) => void;
}

interface TocNode {
  item: TableOfContentsItem;
  depth: number;
  children: TocNode[];
}

/** Flat, levelled items → nested tree. Levels are relative (see `level`). */
function buildTree(items: TableOfContentsItem[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const item of items) {
    while (stack.length && stack[stack.length - 1].item.level >= item.level) stack.pop();
    const parent = stack[stack.length - 1];
    const node: TocNode = { item, depth: parent ? parent.depth + 1 : 0, children: [] };
    (parent ? parent.children : roots).push(node);
    stack.push(node);
  }
  return roots;
}

/**
 * The last heading at or above the offset line is the section being read;
 * before any heading reaches the line, the first one is.
 */
function pickActiveId(headings: HTMLElement[], offsetTop: number): string | null {
  let active: string | null = headings[0]?.id ?? null;
  for (const el of headings) {
    if (el.getBoundingClientRect().top <= offsetTop + 1) active = el.id;
  }
  return active;
}

function isPlainLeftClick(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** How long after a click scroll ends before scroll tracking resumes. */
const SETTLE_MS = 100;
/** Fallback when no `scrollend` arrives (nothing to scroll, older browsers). */
const LOCK_FALLBACK_MS = 1000;

const DEPTH_PADDING = ['pl-3', 'pl-6', 'pl-9'];

/**
 * "On this page" navigation for a long page: a small uppercase title, then
 * one link per heading, with subsections nested under their section. The
 * section being read is marked with a brand-colour bar, bolder text and
 * `aria-current="location"`, so it never relies on colour alone.
 *
 * Clicking a link scrolls to the heading (smoothly unless the user prefers
 * reduced motion) and moves focus to it. **Give each heading
 * `tabIndex={-1}`** so it can take focus; headings aren't focusable by
 * default. Modified clicks (Cmd / Ctrl / Shift / middle) behave like normal
 * links. The URL hash is not changed; use `onNavigate` if you want that.
 * A final section too short to scroll up to the `offsetTop` line only
 * becomes active when its link is clicked.
 *
 * Accessibility: a `<nav>` labelled by its visible title, a list of links
 * to `#id` (nested lists for subsections), and the active link carries
 * `aria-current="location"`.
 *
 * @example
 * ```tsx
 * <TableOfContents
 *   offsetTop={64}
 *   items={[
 *     { id: 'vision', label: 'Vision', level: 2 },
 *     { id: 'vision-why', label: 'Why it matters', level: 3 },
 *     { id: 'mission', label: 'Mission', level: 2 },
 *   ]}
 * />
 * // …with headings like <h2 id="vision" tabIndex={-1} className="scroll-mt-16">
 * ```
 */
export const TableOfContents = React.forwardRef<HTMLElement, TableOfContentsProps>(
  function TableOfContents(
    {
      items,
      activeId,
      offsetTop = 0,
      label = 'On this page',
      onNavigate,
      className,
      ...rest
    },
    ref,
  ) {
    const titleId = React.useId();
    const isControlled = activeId !== undefined;
    const [trackedId, setTrackedId] = React.useState<string | null>(null);
    const currentId = isControlled ? activeId : trackedId;

    // While a click scroll runs, observer updates would flicker through the
    // sections in between (and a short last section might never "reach the
    // line"), so tracking pauses until the scroll settles.
    const lockedRef = React.useRef(false);
    const releaseLockRef = React.useRef<(() => void) | null>(null);

    const lockTracking = React.useCallback(() => {
      releaseLockRef.current?.();
      lockedRef.current = true;
      let settleTimer: ReturnType<typeof setTimeout> | undefined;
      const release = () => {
        clearTimeout(settleTimer);
        clearTimeout(fallbackTimer);
        window.removeEventListener('scrollend', onScrollEnd, true);
        lockedRef.current = false;
        releaseLockRef.current = null;
      };
      const onScrollEnd = () => {
        clearTimeout(fallbackTimer);
        settleTimer = setTimeout(release, SETTLE_MS);
      };
      const fallbackTimer = setTimeout(release, LOCK_FALLBACK_MS);
      window.addEventListener('scrollend', onScrollEnd, { capture: true, once: true });
      releaseLockRef.current = release;
    }, []);

    React.useEffect(() => () => releaseLockRef.current?.(), []);

    const idsKey = items.map((item) => item.id).join('\u0000');

    React.useEffect(() => {
      if (isControlled || typeof IntersectionObserver === 'undefined') return;
      const headings = idsKey
        .split('\u0000')
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      const update = () => {
        if (!lockedRef.current) setTrackedId(pickActiveId(headings, offsetTop));
      };
      update();
      const observer = new IntersectionObserver(update, {
        rootMargin: `${-offsetTop}px 0px 0px 0px`,
        threshold: [0, 1],
      });
      headings.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, [isControlled, idsKey, offsetTop]);

    const handleClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(event)) return;
      const heading = document.getElementById(id);
      if (heading) {
        event.preventDefault();
        lockTracking();
        heading.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
        heading.focus({ preventScroll: true });
      }
      if (!isControlled) setTrackedId(id);
      onNavigate?.(id);
    };

    if (items.length === 0) return null;

    const renderNodes = (nodes: TocNode[]) => (
      <ul className="flex flex-col">
        {nodes.map(({ item, depth, children }) => {
          const isActive = item.id === currentId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={handleClick(item.id)}
                className={cn(
                  '-ml-px block border-l-2 py-1 pr-2 leading-snug transition-colors',
                  'rounded-r-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  DEPTH_PADDING[depth],
                  isActive
                    ? 'border-[var(--color-border-brand)] font-semibold text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
              >
                {item.label}
              </a>
              {children.length > 0 && renderNodes(children)}
            </li>
          );
        })}
      </ul>
    );

    return (
      <nav {...rest} ref={ref} aria-labelledby={titleId} className={cn('text-sm', className)}>
        <p
          id={titleId}
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </p>
        <div className="border-l border-border">{renderNodes(buildTree(items))}</div>
      </nav>
    );
  },
);
