import * as React from 'react';
import { Legend as RechartsLegend, type LegendProps } from 'recharts';
import { cn } from '@/lib/utils';

/** A single legend entry. Subset of Recharts' legend payload. */
export type ChartLegendItem = {
  value?: string;
  color?: string;
  type?: string;
  id?: string;
};

/** Props for {@link ChartLegendContent}, the rendered legend body. */
export interface ChartLegendContentProps {
  /** Legend rows. Provided by Recharts when used as `content`. */
  payload?: ChartLegendItem[];
  /** Extra classes merged onto the wrapping `<ul>`. */
  className?: string;
}

/**
 * Default token-styled body for the chart legend. Renders a flexible,
 * wrapping list of swatch + label rows below the chart. Inherits
 * the foreground / muted text tokens so it flips with the theme.
 */
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

/** Props for {@link ChartLegend}. Re-export of Recharts' `LegendProps`. */
export type ChartLegendProps = LegendProps;

/**
 * Drop-in token-styled wrapper around Recharts' `Legend`. Mounts inside
 * a Recharts chart and defaults to bottom-centre alignment; renders
 * {@link ChartLegendContent} for the swatch + label rows so the legend
 * follows the design-system tokens.
 */
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
