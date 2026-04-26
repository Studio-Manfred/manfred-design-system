import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageShell, PageHeader, PageBody, PageFooter } from './PageShell';
import { NavBar, NavItem } from '../NavBar';
import { Avatar } from '../Avatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';
import { Badge } from '../Badge';

/**
 * Stories under Layout/* re-enable `landmark-one-main` (globally disabled in
 * .storybook/preview.ts) because these previews ARE pages — the whole point
 * of PageShell is enforcing exactly one <main> landmark.
 *
 * `region` stays disabled: the skip-link sits outside every landmark on
 * purpose (its target is <main>; nesting it inside <main> defeats the
 * point), and that triggers a false positive on the region rule.
 */
const enableLandmarkRule = {
  a11y: {
    config: {
      rules: [
        { id: 'landmark-one-main', enabled: true },
      ],
    },
  },
};

const meta: Meta<typeof PageShell> = {
  title: 'Layout/PageShell',
  component: PageShell,
  parameters: {
    layout: 'fullscreen',
    ...enableLandmarkRule,
  },
};
export default meta;

type Story = StoryObj<typeof PageShell>;

// ---------------------------------------------------------------------------
// Mandatory: full dashboard example matching the Mitt Intranat sketch.
// ---------------------------------------------------------------------------
export const DashboardExample: Story = {
  name: 'Dashboard (Mitt Intranat)',
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'landmark-one-main', enabled: true },
          { id: 'page-has-heading-one', enabled: true },
        ],
      },
    },
  },
  render: () => (
    <PageShell>
      <PageHeader>
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold">Mitt Intranat</span>
          <NavBar>
            <NavItem href="#home" active>
              Home
            </NavItem>
            <NavItem href="#boards">Boards</NavItem>
            <NavItem href="#information">Information</NavItem>
          </NavBar>
          <Avatar alt="Account: M" name="M" size="sm" variant="brand" />
        </div>
      </PageHeader>

      <PageBody>
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A quick view of how your intranet is performing today.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card padding="md" as="article" aria-labelledby="kpi-1">
              <CardHeader>
                <CardDescription>Active users</CardDescription>
                <CardTitle id="kpi-1" as="h2" className="text-3xl">
                  1,284
                </CardTitle>
              </CardHeader>
              <CardFooter className="gap-2">
                <Badge variant="success" size="sm">
                  +4.2%
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </CardFooter>
            </Card>

            <Card padding="md" as="article" aria-labelledby="kpi-2">
              <CardHeader>
                <CardDescription>New posts</CardDescription>
                <CardTitle id="kpi-2" as="h2" className="text-3xl">
                  37
                </CardTitle>
              </CardHeader>
              <CardFooter className="gap-2">
                <Badge variant="success" size="sm">
                  +12
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </CardFooter>
            </Card>

            <Card padding="md" as="article" aria-labelledby="kpi-3">
              <CardHeader>
                <CardDescription>Open requests</CardDescription>
                <CardTitle id="kpi-3" as="h2" className="text-3xl">
                  6
                </CardTitle>
              </CardHeader>
              <CardFooter className="gap-2">
                <Badge variant="warning" size="sm">
                  3 overdue
                </Badge>
              </CardFooter>
            </Card>
          </div>

          <Card as="section" padding="lg" className="mt-8" aria-labelledby="recent-title">
            <CardHeader>
              <CardTitle id="recent-title" as="h2">
                Recent activity
              </CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mt-2 space-y-2 text-sm">
                <li>Anna posted in Boards / Internkommunikation</li>
                <li>Erik updated the policy handbook</li>
                <li>Maria approved 2 access requests</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PageBody>

      <PageFooter>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <span>(c) Studio Manfred</span>
          <nav aria-label="Legal">
            <ul className="flex gap-4">
              <li>
                <a href="#privacy" className="hover:text-foreground">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-foreground">
                  Terms
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </PageFooter>
    </PageShell>
  ),
};

// ---------------------------------------------------------------------------
// WithoutSticky — the header scrolls off with the rest of the content.
// ---------------------------------------------------------------------------
export const WithoutSticky: Story = {
  render: () => (
    <PageShell>
      <PageHeader sticky={false}>
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold">Static header</span>
          <NavBar>
            <NavItem href="#home" active>
              Home
            </NavItem>
            <NavItem href="#boards">Boards</NavItem>
          </NavBar>
        </div>
      </PageHeader>

      <PageBody>
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-2xl font-semibold">Non-sticky header</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scroll down — the header above scrolls away with the content.
          </p>
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="mt-4 text-sm">
              Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
          ))}
        </div>
      </PageBody>

      <PageFooter>
        <div className="mx-auto w-full max-w-6xl">Footer</div>
      </PageFooter>
    </PageShell>
  ),
};

// ---------------------------------------------------------------------------
// ShortContent — verifies footer pins to the bottom even with little body.
// ---------------------------------------------------------------------------
export const ShortContent: Story = {
  render: () => (
    <PageShell>
      <PageHeader>
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold">Short page</span>
        </div>
      </PageHeader>

      <PageBody>
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-2xl font-semibold">Just one line</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The footer should still sit at the bottom of the viewport.
          </p>
        </div>
      </PageBody>

      <PageFooter>
        <div className="mx-auto w-full max-w-6xl">Pinned to bottom</div>
      </PageFooter>
    </PageShell>
  ),
};

// ---------------------------------------------------------------------------
// LongContent — verifies body scrolls under the sticky header.
// ---------------------------------------------------------------------------
export const LongContent: Story = {
  render: () => (
    <PageShell>
      <PageHeader>
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold">Long page</span>
          <NavBar>
            <NavItem href="#home" active>
              Home
            </NavItem>
          </NavBar>
        </div>
      </PageHeader>

      <PageBody>
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-2xl font-semibold">Scrollable body</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scroll — the header stays put.
          </p>
          {Array.from({ length: 60 }).map((_, i) => (
            <p key={i} className="mt-4 text-sm">
              Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit.
            </p>
          ))}
        </div>
      </PageBody>

      <PageFooter>
        <div className="mx-auto w-full max-w-6xl">Footer</div>
      </PageFooter>
    </PageShell>
  ),
};
