/**
 * Studio Manfred-flavoured mock data for the Dashboard demo.
 *
 * Names and actions read like a real Swedish design studio's internal tools.
 * Numbers are tuned so charts have visible variance and KPI deltas mix
 * positive and negative directions. NOT lorem ipsum on purpose.
 */

export interface KPI {
  label: string;
  value: string;
  delta: string;
  deltaDirection: 'up' | 'down';
}

export const kpis: readonly KPI[] = [
  {
    label: 'Active users',
    value: '1,284',
    delta: '+12% MoM',
    deltaDirection: 'up',
  },
  {
    label: 'Open requests',
    value: '42',
    delta: '-3% MoM',
    deltaDirection: 'down',
  },
  {
    label: 'Synced sources',
    value: '7',
    delta: '+1 this week',
    deltaDirection: 'up',
  },
];

export interface ChartPoint {
  month: string;
  value: number;
}

// Monthly active users — twelve months of growth with a summer dip.
export const chartSeriesA: readonly ChartPoint[] = [
  { month: 'Jan', value: 820 },
  { month: 'Feb', value: 880 },
  { month: 'Mar', value: 940 },
  { month: 'Apr', value: 1010 },
  { month: 'May', value: 1080 },
  { month: 'Jun', value: 1020 },
  { month: 'Jul', value: 970 },
  { month: 'Aug', value: 1040 },
  { month: 'Sep', value: 1140 },
  { month: 'Oct', value: 1210 },
  { month: 'Nov', value: 1260 },
  { month: 'Dec', value: 1284 },
];

// Open requests trend — fluctuates, ends slightly down.
export const chartSeriesB: readonly ChartPoint[] = [
  { month: 'Jan', value: 38 },
  { month: 'Feb', value: 44 },
  { month: 'Mar', value: 51 },
  { month: 'Apr', value: 47 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 60 },
  { month: 'Jul', value: 49 },
  { month: 'Aug', value: 46 },
  { month: 'Sep', value: 52 },
  { month: 'Oct', value: 48 },
  { month: 'Nov', value: 45 },
  { month: 'Dec', value: 42 },
];

export interface ActivityEntry {
  timestamp: string;
  actor: string;
  action: string;
  category: 'system' | 'user' | 'data';
}

export const recentActivity: readonly ActivityEntry[] = [
  {
    timestamp: '09:14',
    actor: 'Anna Lindqvist',
    action: 'deployed v0.10.0 to production',
    category: 'system',
  },
  {
    timestamp: '08:47',
    actor: 'Erik Holmberg',
    action: 'added 3 new users to the studio workspace',
    category: 'user',
  },
  {
    timestamp: '08:12',
    actor: 'Maja Westin',
    action: 'exported Q1 report (CSV)',
    category: 'data',
  },
  {
    timestamp: 'Yesterday',
    actor: 'Oskar Bergman',
    action: 'connected the Figma data source',
    category: 'data',
  },
  {
    timestamp: 'Yesterday',
    actor: 'Linnea Strom',
    action: 'updated the studio handbook',
    category: 'user',
  },
  {
    timestamp: '2 days ago',
    actor: 'System',
    action: 'rotated API keys',
    category: 'system',
  },
];
