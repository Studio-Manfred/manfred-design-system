import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './Grid';
import { Container } from '../Container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';
import { Badge } from '../Badge';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    gap: { control: 'inline-radio', options: [1, 2, 3, 4, 6, 8, 12] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch'] },
    as: { control: 'select', options: ['div', 'ul', 'section'] },
  },
};
export default meta;

type Story = StoryObj<typeof Grid>;

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md border border-dashed border-border bg-card p-4 text-sm text-foreground">
    {children}
  </div>
);

export const Default: Story = {
  args: { cols: 3, gap: 4 },
  render: (args) => (
    <Container>
      <Grid {...args}>
        <Tile>1</Tile>
        <Tile>2</Tile>
        <Tile>3</Tile>
        <Tile>4</Tile>
        <Tile>5</Tile>
        <Tile>6</Tile>
      </Grid>
    </Container>
  ),
};

export const FixedCols: Story = {
  name: 'Fixed cols (1-12)',
  render: () => (
    <Container>
      <div className="space-y-6">
        {[2, 3, 4, 6].map((n) => (
          <div key={n}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              cols={n}
            </p>
            <Grid cols={n as 2 | 3 | 4 | 6} gap={4}>
              {Array.from({ length: n }).map((_, i) => (
                <Tile key={i}>Item {i + 1}</Tile>
              ))}
            </Grid>
          </div>
        ))}
      </div>
    </Container>
  ),
};

export const ResponsiveCols: Story = {
  name: 'Responsive cols',
  render: () => (
    <Container>
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        cols={'{ base: 1, sm: 2, md: 3, lg: 4 }'}
      </p>
      <Grid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Tile key={i}>Item {i + 1}</Tile>
        ))}
      </Grid>
    </Container>
  ),
};

export const Gaps: Story = {
  render: () => (
    <Container>
      <div className="space-y-6">
        {[1, 2, 4, 8, 12].map((g) => (
          <div key={g}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              gap={g}
            </p>
            <Grid cols={4} gap={g as 1 | 2 | 4 | 8 | 12}>
              <Tile>A</Tile>
              <Tile>B</Tile>
              <Tile>C</Tile>
              <Tile>D</Tile>
            </Grid>
          </div>
        ))}
      </div>
    </Container>
  ),
};

export const Alignment: Story = {
  render: () => (
    <Container>
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        align=&quot;center&quot; / justify=&quot;center&quot;
      </p>
      <Grid cols={3} gap={4} align="center" justify="center" className="min-h-[200px] bg-secondary p-4">
        <div className="h-12 w-24 rounded bg-card text-center text-sm leading-[3rem]">A</div>
        <div className="h-20 w-32 rounded bg-card text-center text-sm leading-[5rem]">B (taller)</div>
        <div className="h-12 w-24 rounded bg-card text-center text-sm leading-[3rem]">C</div>
      </Grid>
    </Container>
  ),
};

export const AsListLandmark: Story = {
  name: 'As <ul> list',
  render: () => (
    <Container>
      <Grid as="ul" cols={{ base: 1, sm: 2, md: 4 }} gap={3} className="list-none p-0">
        {['Lane', 'Role', 'Source', 'Owner'].map((t) => (
          <li key={t} className="rounded-md border border-border bg-card p-3 text-sm">
            {t}
          </li>
        ))}
      </Grid>
    </Container>
  ),
};

export const KpiTileRow: Story = {
  name: 'KPI tile row (dashboard sketch)',
  render: () => (
    <Container size="xl">
      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        <Card>
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
        <Card>
          <CardHeader>
            <CardDescription>Open rate</CardDescription>
            <CardTitle as="h2" className="text-3xl">
              68%
            </CardTitle>
          </CardHeader>
          <CardFooter className="gap-2">
            <Badge variant="success" size="sm">
              +0.4pp
            </Badge>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Reply rate</CardDescription>
            <CardTitle as="h2" className="text-3xl">
              9.1%
            </CardTitle>
          </CardHeader>
          <CardFooter className="gap-2">
            <Badge variant="warning" size="sm">
              -0.6pp
            </Badge>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </CardFooter>
        </Card>
      </Grid>
    </Container>
  ),
};
