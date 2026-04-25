import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface ChartSeriesDef {
  key: string;
  name: string;
}

export interface ChartContainerContextValue {
  reducedMotion: boolean;
}

const ChartContainerContext = React.createContext<ChartContainerContextValue>({
  reducedMotion: false,
});

export function useChartContainer(): ChartContainerContextValue {
  return React.useContext(ChartContainerContext);
}

/**
 * Detect prefers-reduced-motion in a way that is safe for SSR / jsdom
 * and respects updates to the media query at runtime.
 */
export function usePrefersReducedMotion(forceReducedMotion?: boolean): boolean {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
    // Older Safari fallback
    mq.addListener(listener);
    return () => mq.removeListener(listener);
  }, []);

  return forceReducedMotion ?? reduced;
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed pixel height for the chart canvas. Width is always 100%. */
  height?: number;
  /** Accessible name for the chart. If omitted, one is auto-generated from data + series. */
  ariaLabel?: string;
  /** Longer description rendered as the table caption / aria-describedby content. */
  ariaDescription?: string;
  /** Underlying tabular data — used to generate the sr-only fallback table. */
  data?: Record<string, unknown>[];
  /** Series definitions — used both for plotting and for the sr-only table headings. */
  series?: ChartSeriesDef[];
  /** Field on each datum that names the row (X-axis / category label / pie segment label). */
  categoryKey?: string;
  /** Force reduced motion on for the story / test layer. */
  forceReducedMotion?: boolean;
  /**
   * If true, the screen-reader fallback table is rendered visibly (for documentation /
   * accessibility-demonstration stories). Defaults to false (sr-only).
   */
  showFallbackTable?: boolean;
  children: React.ReactNode;
}

function autoAriaLabel(
  series: ChartSeriesDef[] | undefined,
  data: Record<string, unknown>[] | undefined,
): string {
  const seriesCount = series?.length ?? 0;
  const dataCount = data?.length ?? 0;
  if (seriesCount === 0 && dataCount === 0) return 'Chart';
  if (seriesCount <= 1) {
    return `Chart with ${dataCount} ${dataCount === 1 ? 'category' : 'categories'}`;
  }
  return `Chart with ${seriesCount} series across ${dataCount} ${
    dataCount === 1 ? 'category' : 'categories'
  }`;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  (
    {
      height = 240,
      ariaLabel,
      ariaDescription,
      data,
      series,
      categoryKey,
      forceReducedMotion,
      showFallbackTable = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const reducedMotion = usePrefersReducedMotion(forceReducedMotion);
    const resolvedLabel = ariaLabel ?? autoAriaLabel(series, data);
    const tableId = React.useId();
    const descId = React.useId();

    const showTable = data && categoryKey && series && series.length > 0;

    const ctx = React.useMemo<ChartContainerContextValue>(
      () => ({ reducedMotion }),
      [reducedMotion],
    );

    return (
      <ChartContainerContext.Provider value={ctx}>
        <div
          ref={ref}
          role="img"
          aria-label={resolvedLabel}
          aria-describedby={ariaDescription ? descId : undefined}
          className={cn('relative w-full', className)}
          {...rest}
        >
          {ariaDescription ? (
            <span id={descId} className="sr-only">
              {ariaDescription}
            </span>
          ) : null}

          <ResponsiveContainer width="100%" height={height}>
            {children as React.ReactElement}
          </ResponsiveContainer>

          {showTable ? (
            <table
              id={tableId}
              className={cn(
                showFallbackTable
                  ? 'mt-4 w-full border-collapse text-sm'
                  : 'sr-only',
              )}
            >
              <caption className={showFallbackTable ? 'text-left text-muted-foreground' : ''}>
                {resolvedLabel}
                {ariaDescription ? `. ${ariaDescription}` : ''}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={showFallbackTable ? 'border-b border-border p-2 text-left' : ''}>
                    {categoryKey}
                  </th>
                  {series!.map((s) => (
                    <th
                      key={s.key}
                      scope="col"
                      className={showFallbackTable ? 'border-b border-border p-2 text-left' : ''}
                    >
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.map((row, i) => (
                  <tr key={i}>
                    <th
                      scope="row"
                      className={showFallbackTable ? 'border-b border-border p-2 text-left font-normal' : ''}
                    >
                      {formatCell(row[categoryKey!])}
                    </th>
                    {series!.map((s) => (
                      <td
                        key={s.key}
                        className={showFallbackTable ? 'border-b border-border p-2' : ''}
                      >
                        {formatCell(row[s.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </ChartContainerContext.Provider>
    );
  },
);
ChartContainer.displayName = 'ChartContainer';

/** Cycle through chart-1..5 by index. */
export function chartSeriesColor(index: number): string {
  const slot = (index % 5) + 1;
  return `var(--chart-${slot})`;
}
