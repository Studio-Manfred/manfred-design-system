import * as React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  chartSeriesColor,
  usePrefersReducedMotion,
  type ChartSeriesDef,
} from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';

/** Props for the {@link BarChart} component. */
export interface BarChartProps {
  /** Row data — each row is one category, with one numeric field per series. */
  data: Record<string, unknown>[];
  /** Series definitions; `key` matches a field on each row, `name` is the legend label. */
  series: ChartSeriesDef[];
  /** Field on each row used as the X-axis category label. */
  categoryKey: string;
  /** Fixed canvas height in px. Width fills the parent. Defaults to 240. */
  height?: number;
  /** Accessible name for the chart. Auto-generated from data + series when omitted. */
  ariaLabel?: string;
  /** Long description linked via `aria-describedby`. */
  ariaDescription?: string;
  /** Show the legend. Defaults to true when more than one series. */
  showLegend?: boolean;
  /** Show the tooltip. Defaults to true. */
  showTooltip?: boolean;
  /** Force-render the sr-only fallback table visibly (a11y demo only). */
  showFallbackTable?: boolean;
  /** Force reduced motion (test/story override). */
  forceReducedMotion?: boolean;
  /** Extra classes merged onto the wrapping `ChartContainer`. */
  className?: string;
}

/**
 * Vertical bar chart wrapping Recharts' `BarChart`.
 *
 * Renders one bar series per `series[]` entry, with colours cycling
 * through the `--chart-1` … `--chart-6` token slots via
 * {@link chartSeriesColor}. Wraps everything in {@link ChartContainer}
 * so the chart inherits the standard a11y contract (role, aria-label,
 * sr-only data table) and reduced-motion handling.
 *
 * @example Single-series traffic chart
 * ```tsx
 * <BarChart
 *   data={rows}
 *   series={[{ key: 'visits', name: 'Visits' }]}
 *   categoryKey="month"
 * />
 * ```
 */
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>((props, ref) => {
  const {
    data,
    series,
    categoryKey,
    height = 240,
    ariaLabel,
    ariaDescription,
    showLegend,
    showTooltip = true,
    showFallbackTable,
    forceReducedMotion,
    className,
  } = props;

  const reduced = usePrefersReducedMotion(forceReducedMotion);
  const legendEnabled = showLegend ?? series.length > 1;

  return (
    <ChartContainer
      ref={ref}
      height={height}
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      data={data}
      series={series}
      categoryKey={categoryKey}
      showFallbackTable={showFallbackTable}
      forceReducedMotion={forceReducedMotion}
      className={className}
    >
      <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={categoryKey}
          stroke="var(--chart-axis)"
          tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--chart-axis)' }}
        />
        <YAxis
          stroke="var(--chart-axis)"
          tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        {showTooltip ? <ChartTooltip /> : null}
        {legendEnabled ? <ChartLegend /> : null}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={chartSeriesColor(i)}
            isAnimationActive={!reduced}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
});
BarChart.displayName = 'BarChart';
