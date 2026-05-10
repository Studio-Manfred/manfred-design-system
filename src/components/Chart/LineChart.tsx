import * as React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
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

/** Props for the {@link LineChart} component. */
export interface LineChartProps {
  /** Row data — each row is one X-axis category, with one numeric field per series. */
  data: Record<string, unknown>[];
  /** Series definitions; `key` matches a field on each row, `name` is the legend label. */
  series: ChartSeriesDef[];
  /** Field on each row used as the X-axis category label. */
  categoryKey: string;
  /** Fixed canvas height in px. Width fills the parent. Defaults to 240. */
  height?: number;
  /** Accessible name for the chart. Auto-generated when omitted. */
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
 * Continuous-axis line chart wrapping Recharts' `LineChart`.
 *
 * Renders one monotone-curved line per `series[]` entry with token
 * colours from {@link chartSeriesColor}. Wraps in {@link ChartContainer}
 * so it inherits the same a11y contract and reduced-motion handling
 * as the other Manfred charts.
 *
 * @example Multi-series time series
 * ```tsx
 * <LineChart
 *   data={rows}
 *   series={[
 *     { key: 'mrr', name: 'MRR' },
 *     { key: 'arr', name: 'ARR' },
 *   ]}
 *   categoryKey="month"
 * />
 * ```
 */
export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>((props, ref) => {
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
      <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={chartSeriesColor(i)}
            strokeWidth={2}
            dot={{ r: 3, fill: chartSeriesColor(i), stroke: chartSeriesColor(i) }}
            activeDot={{ r: 5 }}
            isAnimationActive={!reduced}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
});
LineChart.displayName = 'LineChart';
