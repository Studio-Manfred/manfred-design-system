import * as React from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ChartTooltipPayloadEntry = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string | number;
  className?: string;
  /** Optional formatter for individual values. */
  valueFormatter?: (value: number | string | undefined, name: string | number | undefined) => React.ReactNode;
}

/**
 * Default tooltip body. Tokenised — uses popover/border/foreground utility classes
 * which are bound to the design-system semantic layer.
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

export type ChartTooltipProps = ComponentProps<typeof RechartsTooltip> & {
  valueFormatter?: ChartTooltipContentProps['valueFormatter'];
};

/**
 * Drop-in token-styled wrapper around Recharts' Tooltip.
 * Uses `content` to render `ChartTooltipContent` so the design-system look applies.
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
