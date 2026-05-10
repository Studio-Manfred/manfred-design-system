import * as React from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Single row inside the chart tooltip payload. Mirrors the subset of
 * Recharts' tooltip payload that {@link ChartTooltipContent} reads.
 *
 * Note: this is the *chart* tooltip — the floating bubble that appears
 * over a hovered data point. It is distinct from the standalone
 * {@link Tooltip} component (Radix-based) used to label icon buttons.
 */
export type ChartTooltipPayloadEntry = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

/** Props for {@link ChartTooltipContent}, the rendered tooltip body. */
export interface ChartTooltipContentProps {
  /** Whether the tooltip is currently active (hovered). Provided by Recharts. */
  active?: boolean;
  /** Series payload at the hovered point. Provided by Recharts. */
  payload?: ChartTooltipPayloadEntry[];
  /** Category label (X-axis tick). Provided by Recharts. */
  label?: string | number;
  /** Extra classes merged onto the tooltip container. */
  className?: string;
  /** Optional formatter for individual values. */
  valueFormatter?: (value: number | string | undefined, name: string | number | undefined) => React.ReactNode;
}

/**
 * Default tooltip body for chart hovers. Tokenised — uses popover /
 * border / foreground utilities bound to the semantic layer so it
 * sits on dark and light surfaces correctly.
 *
 * Distinct from the {@link Tooltip} component used to label icon
 * buttons; this body only exists to render hovered data points.
 *
 * @example Custom value formatter
 * ```tsx
 * <ChartTooltip valueFormatter={(v) => `${v}%`} />
 * ```
 */
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, className, valueFormatter }, ref) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md',
          'text-popover-foreground',
          className,
        )}
      >
        {label !== undefined && label !== null ? (
          <div className="mb-1 font-medium">{String(label)}</div>
        ) : null}
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {payload.map((entry, i) => {
            const name = entry.name ?? entry.dataKey ?? '';
            const formatted = valueFormatter
              ? valueFormatter(entry.value, name)
              : entry.value;
            return (
              <li key={i} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{String(name)}</span>
                <span className="ml-auto font-medium tabular-nums">
                  {formatted as React.ReactNode}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

/**
 * Props for {@link ChartTooltip}. Inherits Recharts' `Tooltip` props
 * and adds an optional `valueFormatter` forwarded to the default
 * tokenised content.
 */
export type ChartTooltipProps = ComponentProps<typeof RechartsTooltip> & {
  valueFormatter?: ChartTooltipContentProps['valueFormatter'];
};

/**
 * Drop-in token-styled wrapper around Recharts' `Tooltip`. Mounts
 * inside a Recharts chart (e.g. `BarChart`, `LineChart`) and renders
 * {@link ChartTooltipContent} on hover so the popover surface follows
 * the design-system tokens.
 *
 * **Disambiguation:** this is the chart hover tooltip (Recharts) — not
 * the same as the Radix-based {@link Tooltip} used to label buttons.
 * They share the word "tooltip" but solve different problems.
 */
export const ChartTooltip = (props: ChartTooltipProps): React.ReactElement => {
  const { valueFormatter, content, ...rest } = props;
  return (
    <RechartsTooltip
      cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }}
      {...rest}
      content={
        content ??
        ((p: { active?: boolean; payload?: readonly unknown[]; label?: unknown }) => (
          <ChartTooltipContent
            active={p.active}
            payload={p.payload as ChartTooltipPayloadEntry[] | undefined}
            label={p.label as string | number | undefined}
            valueFormatter={valueFormatter}
          />
        ))
      }
    />
  );
};
ChartTooltip.displayName = 'ChartTooltip';
