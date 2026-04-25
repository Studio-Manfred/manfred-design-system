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
  categoryKey: string;
  height?: number;
  ariaLabel?: string;
  ariaDescription?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showFallbackTable?: boolean;
  forceReducedMotion?: boolean;
  /** innerRadius as a fraction (0-1) of the chart radius. */
  innerRadiusRatio?: number;
  /** outerRadius as a fraction (0-1) of the chart radius. */
  outerRadiusRatio?: number;
  className?: string;
}

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
