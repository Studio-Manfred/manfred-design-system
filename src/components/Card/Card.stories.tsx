import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' },
  argTypes: {
    padding: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    as: { control: 'select', options: ['div', 'article', 'section', 'aside'] },
    interactive: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Brief supporting copy.</CardDescription>
      </CardHeader>
      <CardContent>
        Body content goes here. Reach for Card whenever you need a bordered
        surface for a panel, a KPI tile, or a filter section.
      </CardContent>
      <CardFooter>
        <Button variant="brand" size="sm">
          Primary action
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Paddings: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <Card padding="sm" className="w-48">
        <CardTitle>Small</CardTitle>
        <CardContent>p-4</CardContent>
      </Card>
      <Card padding="md" className="w-48">
        <CardTitle>Medium</CardTitle>
        <CardContent>p-6 (default)</CardContent>
      </Card>
      <Card padding="lg" className="w-48">
        <CardTitle>Large</CardTitle>
        <CardContent>p-8</CardContent>
      </Card>
    </div>
  ),
};

export const InteractiveAsButton: Story = {
  name: 'Interactive (clickable card)',
  render: () => (
    // Plain div + role="button" — axe rejects role="button" overlaid on
    // landmark elements like <article>. For native semantics, wrap a Card
    // in a <button> instead.
    <Card
      interactive
      role="button"
      tabIndex={0}
      className="w-80"
      onClick={() => console.log('clicked')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('activated');
        }
      }}
      aria-label="Open performance details"
    >
      <CardTitle as="h3">Open rate</CardTitle>
      <CardDescription>Click to view details</CardDescription>
      <CardContent className="text-2xl font-semibold">68%</CardContent>
    </Card>
  ),
};

export const KpiTile: Story = {
  name: 'KPI tile (dashboard sketch)',
  render: () => (
    <Card padding="md" className="w-56">
      <CardHeader>
        <CardDescription>Conversion rate</CardDescription>
        <CardTitle as="h2" className="text-3xl">
          12.4%
        </CardTitle>
      </CardHeader>
      <CardFooter className="gap-2">
        <Badge variant="success" size="sm">
          +2.1pp
        </Badge>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </CardFooter>
    </Card>
  ),
};

export const ChartPanel: Story = {
  name: 'Chart panel (dashboard sketch)',
  render: () => (
    <Card as="section" padding="lg" className="w-[480px]" aria-labelledby="chart-title">
      <CardHeader>
        <CardTitle id="chart-title" as="h2">
          Lane breakdown
        </CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          (donut chart placeholder)
        </div>
      </CardContent>
    </Card>
  ),
};

export const FilterPanel: Story = {
  name: 'Filter panel (dashboard sketch)',
  render: () => (
    <Card as="aside" padding="md" className="w-72" aria-label="Filters">
      <CardTitle as="h3">Filters</CardTitle>
      <CardContent className="space-y-2 text-sm">
        <div>Lane: All</div>
        <div>Role title: Any</div>
        <div>Source: Any</div>
      </CardContent>
    </Card>
  ),
};
