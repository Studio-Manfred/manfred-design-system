import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PageShell,
  PageHeader,
  PageBody,
  PageFooter,
} from '@/components/PageShell';
import { NavBar, NavItem } from '@/components/NavBar';
import { Avatar } from '@/components/Avatar';
import { Container } from '@/components/Container';
import { Grid } from '@/components/Grid';
import { VStack, HStack } from '@/components/Stack';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { BarChart, LineChart } from '@/components/Chart';
import { cn } from '@/lib/utils';

import {
  brand,
  mockUser,
  navItems,
  footerLinks,
} from '../_shared/content';
import {
  kpis,
  chartSeriesA,
  chartSeriesB,
  recentActivity,
  type ActivityEntry,
} from './_fixtures';

/**
 * Examples/Dashboard — a full app screen built only from public DS exports.
 *
 * Pattern for the Examples/* family (next demos: Reports, People, Settings):
 *  - One CSF meta with parameters.layout = 'fullscreen' + landmark-one-main
 *    re-enabled (mirrors the Layout/PageShell stories).
 *  - Four state stories per demo: HappyPath / Empty / Loading / Error.
 *  - Brand identity comes from src/examples/_shared/content.ts (reusable).
 *  - Demo-specific copy/data lives in ./_fixtures.ts (one per demo).
 *  - Page heading is a single h1 (Typography variant="headline2"); KPI/chart
 *    Cards use CardTitle as="h2" so the heading order is h1 -> h2 -> h3.
 *  - No inline tags (button/h1/p/ul/li) — every visible element is a DS
 *    component or a layout primitive (VStack/HStack/Grid/Container).
 *  - The chart Card body keeps a fixed height so Loading/Error states don't
 *    cause layout shift versus HappyPath.
 */

// ---------------------------------------------------------------------------
// Per-story a11y override: re-enable landmark-one-main for the page-level
// preview (globally disabled in .storybook/preview.ts). The runtime axe scan
// also re-enables this rule for `examples-*` story IDs in
// scripts/a11y-runtime-scan.mjs.
// ---------------------------------------------------------------------------

const enableLandmarkRule = {
  a11y: {
    config: {
      rules: [{ id: 'landmark-one-main', enabled: true }],
    },
  },
};

// ---------------------------------------------------------------------------
// Shared shell — used by all four state stories so only the body changes.
// ---------------------------------------------------------------------------

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardShell({ children }: DashboardShellProps) {
  return (
    <PageShell>
      <PageHeader sticky>
        <Container size="xl">
          <HStack
            as="div"
            justify="between"
            align="center"
            gap={4}
            className="h-14"
          >
            <Typography variant="label" as="span">
              {brand.appName}
            </Typography>
            <NavBar aria-label="Primary">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  active={item.label === 'Dashboard'}
                >
                  {item.label}
                </NavItem>
              ))}
            </NavBar>
            <Avatar
              alt={`Account: ${mockUser.name}`}
              name={mockUser.name}
              initials={mockUser.initials}
              size="sm"
              variant="brand"
            />
          </HStack>
        </Container>
      </PageHeader>

      <PageBody padded>
        <Container size="xl" padded={false}>
          {children}
        </Container>
      </PageBody>

      <PageFooter>
        <Container size="xl" padded={false}>
          <HStack justify="between" align="center" gap={4}>
            <Typography variant="caption" color="muted" as="span">
              (c) {brand.name}
            </Typography>
            <NavBar aria-label="Footer">
              {footerLinks.map((link) => (
                <NavItem key={link.href} href={link.href}>
                  {link.label}
                </NavItem>
              ))}
            </NavBar>
          </HStack>
        </Container>
      </PageFooter>
    </PageShell>
  );
}

// ---------------------------------------------------------------------------
// Page heading — same in every state, with optional trailing slot.
// ---------------------------------------------------------------------------

function PageHeading({ trailing }: { trailing?: React.ReactNode }) {
  return (
    <HStack justify="between" align="center" gap={4} wrap>
      <VStack gap={1}>
        <Typography variant="headline2" as="h1">
          Dashboard
        </Typography>
        <Typography variant="bodySmall" color="muted">
          {brand.tagline}
        </Typography>
      </VStack>
      {trailing}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// KPI card — value slot is swappable so Loading/Error reuse the same frame.
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  titleId: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function KpiCard({ label, titleId, children, footer }: KpiCardProps) {
  return (
    <Card as="article" padding="md" aria-labelledby={titleId}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle id={titleId} as="h2" className="text-3xl">
          {children}
        </CardTitle>
      </CardHeader>
      {footer ? <CardFooter className="gap-2">{footer}</CardFooter> : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Chart card frame — fixed body height so Loading/Error don't shift layout.
// ---------------------------------------------------------------------------

const CHART_BODY_HEIGHT = 240;

interface ChartCardProps {
  title: string;
  titleId: string;
  description: string;
  children: React.ReactNode;
}

function ChartCard({ title, titleId, description, children }: ChartCardProps) {
  return (
    <Card as="section" padding="md" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} as="h2">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent
        className="flex items-center justify-center"
        style={{ minHeight: CHART_BODY_HEIGHT }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Recent-activity row — ActivityEntry rendered as an HStack <li>.
// ---------------------------------------------------------------------------

const categoryVariant: Record<
  ActivityEntry['category'],
  'neutral' | 'info' | 'success'
> = {
  system: 'neutral',
  user: 'info',
  data: 'success',
};

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  return (
    <HStack
      as="li"
      justify="between"
      align="center"
      gap={4}
      className="border-b border-border pb-2 last:border-b-0 last:pb-0"
    >
      <HStack align="center" gap={3} className="min-w-0">
        <Typography
          variant="caption"
          color="muted"
          as="span"
          className="w-20 shrink-0 tabular-nums"
        >
          {entry.timestamp}
        </Typography>
        <VStack gap={1} className="min-w-0">
          <Typography variant="bodySmall" as="span">
            <span className="font-semibold">{entry.actor}</span>
            {' '}
            <span className="text-muted-foreground">{entry.action}</span>
          </Typography>
        </VStack>
      </HStack>
      <Badge variant={categoryVariant[entry.category]} size="sm">
        {entry.category}
      </Badge>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Body sections — composed by each state story.
// ---------------------------------------------------------------------------

function HappyPathBody() {
  return (
    <VStack gap={8}>
      <PageHeading
        trailing={
          <HStack gap={3} align="center">
            <Badge variant="success" size="sm">
              Live
            </Badge>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </HStack>
        }
      />

      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            titleId={`kpi-happy-${i}`}
            footer={
              <>
                <Badge
                  variant={kpi.deltaDirection === 'up' ? 'success' : 'error'}
                  size="sm"
                >
                  {kpi.delta}
                </Badge>
                <Typography variant="caption" color="muted" as="span">
                  vs last month
                </Typography>
              </>
            }
          >
            {kpi.value}
          </KpiCard>
        ))}
      </Grid>

      <Grid cols={{ base: 1, md: 2 }} gap={6}>
        <ChartCard
          title="Active users"
          titleId="chart-users"
          description="Monthly active users, last 12 months."
        >
          <LineChart
            data={[...chartSeriesA]}
            series={[{ key: 'value', name: 'Active users' }]}
            categoryKey="month"
            height={CHART_BODY_HEIGHT}
            ariaLabel="Active users by month"
            ariaDescription="Line chart showing active users from January to December."
            showLegend={false}
            className="w-full"
          />
        </ChartCard>
        <ChartCard
          title="Open requests"
          titleId="chart-requests"
          description="Support requests opened per month."
        >
          <BarChart
            data={[...chartSeriesB]}
            series={[{ key: 'value', name: 'Open requests' }]}
            categoryKey="month"
            height={CHART_BODY_HEIGHT}
            ariaLabel="Open requests by month"
            ariaDescription="Bar chart showing open support requests from January to December."
            showLegend={false}
            className="w-full"
          />
        </ChartCard>
      </Grid>

      <Card as="section" padding="md" aria-labelledby="activity-title">
        <CardHeader>
          <CardTitle id="activity-title" as="h2">
            Recent activity
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <VStack as="ul" gap={2}>
            {recentActivity.map((entry, i) => (
              <ActivityRow key={`${entry.timestamp}-${i}`} entry={entry} />
            ))}
          </VStack>
        </CardContent>
      </Card>
    </VStack>
  );
}

function EmptyBody() {
  return (
    <VStack gap={8}>
      <PageHeading />

      <Alert variant="info" title="No data yet">
        Connect a source to see your dashboard.
      </Alert>

      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        <KpiCard label="Active users" titleId="kpi-empty-0">
          <Typography variant="bodySmall" color="muted" as="span">
            No KPIs configured
          </Typography>
        </KpiCard>
        <KpiCard label="Open requests" titleId="kpi-empty-1">
          <Typography variant="bodySmall" color="muted" as="span">
            No KPIs configured
          </Typography>
        </KpiCard>
        <KpiCard label="Synced sources" titleId="kpi-empty-2">
          <Typography variant="bodySmall" color="muted" as="span">
            No KPIs configured
          </Typography>
        </KpiCard>
      </Grid>

      <Grid cols={{ base: 1, md: 2 }} gap={6}>
        <ChartCard
          title="Active users"
          titleId="chart-empty-users"
          description="Monthly active users, last 12 months."
        >
          <Typography variant="bodySmall" color="muted">
            Connect a chart source to populate this card.
          </Typography>
        </ChartCard>
        <ChartCard
          title="Open requests"
          titleId="chart-empty-requests"
          description="Support requests opened per month."
        >
          <Typography variant="bodySmall" color="muted">
            Connect a chart source to populate this card.
          </Typography>
        </ChartCard>
      </Grid>

      <Card as="section" padding="md" aria-labelledby="activity-empty-title">
        <CardHeader>
          <CardTitle id="activity-empty-title" as="h2">
            Recent activity
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Typography variant="bodySmall" color="muted">
            No recent activity yet.
          </Typography>
        </CardContent>
      </Card>
    </VStack>
  );
}

const ACTIVITY_LIST_HEIGHT = 220;

function LoadingBody() {
  return (
    <VStack gap={8}>
      <PageHeading
        trailing={
          <Badge variant="info" size="sm">
            Loading
          </Badge>
        }
      />

      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} label={kpi.label} titleId={`kpi-loading-${i}`}>
            <span className="flex items-center justify-center py-2">
              <Spinner size="md" label={`Loading ${kpi.label}`} />
            </span>
          </KpiCard>
        ))}
      </Grid>

      <Grid cols={{ base: 1, md: 2 }} gap={6}>
        <ChartCard
          title="Active users"
          titleId="chart-loading-users"
          description="Monthly active users, last 12 months."
        >
          <Spinner size="lg" label="Loading active users" />
        </ChartCard>
        <ChartCard
          title="Open requests"
          titleId="chart-loading-requests"
          description="Support requests opened per month."
        >
          <Spinner size="lg" label="Loading open requests" />
        </ChartCard>
      </Grid>

      <Card as="section" padding="md" aria-labelledby="activity-loading-title">
        <CardHeader>
          <CardTitle id="activity-loading-title" as="h2">
            Recent activity
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent
          className={cn('flex items-center justify-center')}
          style={{ minHeight: ACTIVITY_LIST_HEIGHT }}
        >
          <Spinner size="lg" label="Loading recent activity" />
        </CardContent>
      </Card>
    </VStack>
  );
}

function ErrorBody() {
  const failedValue = (
    <Typography variant="bodySmall" color="muted" as="span">
      Failed to load
    </Typography>
  );
  return (
    <VStack gap={8}>
      <PageHeading
        trailing={
          <Badge variant="error" size="sm">
            Error
          </Badge>
        }
      />

      <Alert variant="error" title="Couldn't load dashboard data">
        Try refreshing the page. If the problem persists, contact support.
      </Alert>

      <Grid cols={{ base: 1, md: 3 }} gap={6}>
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            titleId={`kpi-error-${i}`}
            footer={
              <Badge variant="error" size="sm">
                Error
              </Badge>
            }
          >
            {failedValue}
          </KpiCard>
        ))}
      </Grid>

      <Grid cols={{ base: 1, md: 2 }} gap={6}>
        <ChartCard
          title="Active users"
          titleId="chart-error-users"
          description="Monthly active users, last 12 months."
        >
          <Typography variant="bodySmall" color="muted">
            Failed to load chart data.
          </Typography>
        </ChartCard>
        <ChartCard
          title="Open requests"
          titleId="chart-error-requests"
          description="Support requests opened per month."
        >
          <Typography variant="bodySmall" color="muted">
            Failed to load chart data.
          </Typography>
        </ChartCard>
      </Grid>

      <Card as="section" padding="md" aria-labelledby="activity-error-title">
        <CardHeader>
          <CardTitle id="activity-error-title" as="h2">
            Recent activity
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Typography variant="bodySmall" color="muted">
            Failed to load recent activity.
          </Typography>
        </CardContent>
      </Card>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta + stories.
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Examples/Dashboard',
  parameters: {
    layout: 'fullscreen',
    ...enableLandmarkRule,
  },
};
export default meta;

type Story = StoryObj;

export const HappyPath: Story = {
  render: () => (
    <DashboardShell>
      <HappyPathBody />
    </DashboardShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <DashboardShell>
      <EmptyBody />
    </DashboardShell>
  ),
};

export const Loading: Story = {
  render: () => (
    <DashboardShell>
      <LoadingBody />
    </DashboardShell>
  ),
};

export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <DashboardShell>
      <ErrorBody />
    </DashboardShell>
  ),
};
