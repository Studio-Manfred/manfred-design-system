import * as React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import {
  ChartContainer,
  chartSeriesColor,
  usePrefersReducedMotion,
  type ChartSeriesDef,
} from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';

/** Props for the {@link DonutChart} component. */
export interface DonutChartProps {
  /**
   * Donut data. Each row is a segment. The categoryKey field labels the slice;
   * the single series key (series[0].key) is the value.
   */
  data: Record<string, unknown>[];
  /**
   * Donut takes a single value series. The series array's first entry's `key` is
   * read as the numeric value field. (Multiple entries are tolerated but only
   * the first is plotted.)
   */
  series: ChartSeriesDef[];
  /** Field on each row used as the slice label. */
  categoryKey: string;
  /** Fixed canvas height in px. Width fills the parent. Defaults to 240. */
  height?: number;
  /** Accessible name for the chart. Auto-generated when omitted. */
  ariaLabel?: string;
  /** Long description linked via `aria-describedby`. */
  ariaDescription?: string;
  /** Show the legend. Defaults to true. */
  showLegend?: boolean;
  /** Show the tooltip. Defaults to true. */
  showTooltip?: boolean;
  /** Force-render the sr-only fallback table visibly (a11y demo only). */
  showFallbackTable?: boolean;
  /** Force reduced motion (test/story override). */
  forceReducedMotion?: boolean;
  /** innerRadius as a fraction (0-1) of the chart radius. Defaults to 0.6. */
  innerRadiusRatio?: number;
  /** outerRadius as a fraction (0-1) of the chart radius. Defaults to 0.9. */
  outerRadiusRatio?: number;
  /** Extra classes merged onto the wrapping `ChartContainer`. */
  className?: string;
}

/**
 * Donut (ring) chart wrapping Recharts' `PieChart` + `Pie`.
 *
 * One slice per row, coloured through the `--chart-1` … `--chart-5`
 * tokens via {@link chartSeriesColor}. Throws if `series` is empty
 * (the first entry's `key` selects the numeric value field). Wraps in
 * {@link ChartContainer} for consistent a11y + reduced-motion handling.
 *
 * @example Channel mix donut
 * ```tsx
 * <DonutChart
 *   data={mix}
 *   series={[{ key: 'share', name: 'Share' }]}
 *   categoryKey="channel"
 * />
 * ```
 */
export const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>((props, ref) => {
  const {
    data,
    series,
    categoryKey,
    height = 240,
    ariaLabel,
    ariaDescription,
    showLegend = true,
    showTooltip = true,
    showFallbackTable,
    forceReducedMotion,
    innerRadiusRatio = 0.6,
    outerRadiusRatio = 0.9,
    className,
  } = props;

  const reduced = usePrefersReducedMotion(forceReducedMotion);
  const valueKey = series[0]?.key;

  if (!valueKey) {
    throw new Error('DonutChart requires at least one series describing the value field.');
  }

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
      <RechartsPieChart>
        {showTooltip ? <ChartTooltip /> : null}
        {showLegend ? <ChartLegend /> : null}
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={categoryKey}
          innerRadius={`${innerRadiusRatio * 100}%`}
          outerRadius={`${outerRadiusRatio * 100}%`}
          paddingAngle={2}
          isAnimationActive={!reduced}
          stroke="var(--background)"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={chartSeriesColor(i)} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
});
DonutChart.displayName = 'DonutChart';
