import * as React from 'react';
import { Legend as RechartsLegend, type LegendProps } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartLegendItem = {
  value?: string;
  color?: string;
  type?: string;
  id?: string;
};

export interface ChartLegendContentProps {
  payload?: ChartLegendItem[];
  className?: string;
}

export const ChartLegendContent = React.forwardRef<HTMLUListElement, ChartLegendContentProps>(
  ({ payload, className }, ref) => {
    if (!payload || payload.length === 0) return null;
    return (
      <ul
        ref={ref}
        className={cn(
          'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 p-0 text-sm text-muted-foreground',
          className,
        )}
      >
        {payload.map((entry, i) => (
          <li key={entry.id ?? i} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  },
);
ChartLegendContent.displayName = 'ChartLegendContent';

export type ChartLegendProps = LegendProps;

/** Token-styled wrapper around Recharts' Legend. */
export const ChartLegend = (props: ChartLegendProps): React.ReactElement => {
  const { content, ...rest } = props;
  return (
    <RechartsLegend
      verticalAlign="bottom"
      align="center"
      {...rest}
      content={
        content ??
        ((p) => <ChartLegendContent payload={p.payload as ChartLegendItem[] | undefined} />)
      }
    />
  );
};
ChartLegend.displayName = 'ChartLegend';
