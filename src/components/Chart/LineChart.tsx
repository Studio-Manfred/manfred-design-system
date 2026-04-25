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

export interface LineChartProps {
  data: Record<string, unknown>[];
  series: ChartSeriesDef[];
  categoryKey: string;
  height?: number;
  ariaLabel?: string;
  ariaDescription?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showFallbackTable?: boolean;
  forceReducedMotion?: boolean;
  className?: string;
}

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
