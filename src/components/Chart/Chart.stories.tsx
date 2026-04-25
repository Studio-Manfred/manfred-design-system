import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { DonutChart } from './DonutChart';
import { ChartContainer, chartSeriesColor } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';

const meta: Meta = {
  title: 'Components/Chart',
  parameters: { layout: 'padded' },
};
export default meta;

type AnyStory = StoryObj;

const monthly = [
  { month: 'Jan', revenue: 12, costs: 8 },
  { month: 'Feb', revenue: 18, costs: 9 },
  { month: 'Mar', revenue: 14, costs: 10 },
  { month: 'Apr', revenue: 22, costs: 11 },
  { month: 'May', revenue: 19, costs: 12 },
  { month: 'Jun', revenue: 25, costs: 13 },
  { month: 'Jul', revenue: 28, costs: 14 },
  { month: 'Aug', revenue: 24, costs: 13 },
  { month: 'Sep', revenue: 30, costs: 15 },
  { month: 'Oct', revenue: 33, costs: 16 },
  { month: 'Nov', revenue: 31, costs: 17 },
  { month: 'Dec', revenue: 38, costs: 18 },
];

const monthlySeries = [
  { key: 'revenue', name: 'Revenue' },
  { key: 'costs', name: 'Costs' },
];

const lanes = [
  { lane: 'Design', share: 40 },
  { lane: 'Code', share: 35 },
  { lane: 'Ops', share: 25 },
];
const laneSeries = [{ key: 'share', name: 'Share' }];

const Tile: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div
    style={{
      borderRadius: 12,
      border: '1px solid var(--border)',
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      padding: 16,
      width: 380,
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

export const DonutLanes: AnyStory = {
  name: 'Donut: lane breakdown',
  render: () => (
    <Tile title="Lane breakdown">
      <DonutChart
        data={lanes}
        series={laneSeries}
        categoryKey="lane"
        height={240}
        ariaLabel="Lane breakdown"
        ariaDescription="Share of work across Design, Code and Ops"
      />
    </Tile>
  ),
};

export const BarMonthly: AnyStory = {
  name: 'Bar: monthly performance',
  render: () => (
    <Tile title="Monthly performance">
      <BarChart
        data={monthly}
        series={monthlySeries}
        categoryKey="month"
        height={260}
        ariaLabel="Monthly revenue and costs"
        ariaDescription="Revenue and costs per month for the last 12 months"
      />
    </Tile>
  ),
};

export const LineTrend: AnyStory = {
  name: 'Line: trend',
  render: () => (
    <Tile title="Trend">
      <LineChart
        data={monthly}
        series={monthlySeries}
        categoryKey="month"
        height={260}
        ariaLabel="Revenue and costs trend"
      />
    </Tile>
  ),
};

/**
 * Composed example using `ChartContainer` + Recharts primitives directly,
 * which is the path to take when you need a custom tooltip body, ordering, or
 * additional chart elements beyond what the BarChart wrapper exposes.
 */
export const WithCustomTooltip: AnyStory = {
  name: 'With custom tooltip',
  render: () => {
    const data = monthly.slice(0, 6);
    return (
      <Tile title="Currency-formatted tooltip">
        <ChartContainer
          data={data}
          series={monthlySeries}
          categoryKey="month"
          height={240}
          ariaLabel="Half-year revenue and costs in USD"
        >
          <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" stroke="var(--chart-axis)" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} tickLine={false} />
            <YAxis stroke="var(--chart-axis)" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <ChartTooltip
              valueFormatter={(value) =>
                typeof value === 'number'
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(value * 1000)
                  : (value as React.ReactNode)
              }
            />
            {monthlySeries.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={chartSeriesColor(i)} radius={[4, 4, 0, 0]} />
            ))}
          </RechartsBarChart>
        </ChartContainer>
      </Tile>
    );
  },
};

export const WithLegend: AnyStory = {
  name: 'With legend',
  render: () => {
    const data = monthly.slice(0, 6);
    return (
      <Tile title="Legend visible">
        <ChartContainer
          data={data}
          series={monthlySeries}
          categoryKey="month"
          height={260}
          ariaLabel="Half-year revenue and costs"
        >
          <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" stroke="var(--chart-axis)" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} tickLine={false} />
            <YAxis stroke="var(--chart-axis)" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <ChartTooltip />
            <ChartLegend />
            {monthlySeries.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={chartSeriesColor(i)} radius={[4, 4, 0, 0]} />
            ))}
          </RechartsBarChart>
        </ChartContainer>
      </Tile>
    );
  },
};

export const AccessibilityFallback: AnyStory = {
  name: 'Accessibility fallback (table)',
  render: () => (
    <Tile title="Sr-only table forced visible">
      <BarChart
        data={monthly.slice(0, 6)}
        series={monthlySeries}
        categoryKey="month"
        height={220}
        showFallbackTable
        ariaLabel="Half-year revenue and costs"
        ariaDescription="The same data is also offered as a table for assistive technology."
      />
    </Tile>
  ),
};

export const ReducedMotion: AnyStory = {
  name: 'Reduced motion',
  render: () => (
    <Tile title="prefers-reduced-motion: forced">
      <LineChart
        data={monthly}
        series={monthlySeries}
        categoryKey="month"
        height={240}
        forceReducedMotion
        ariaLabel="Revenue and costs trend (no animation)"
      />
    </Tile>
  ),
};
