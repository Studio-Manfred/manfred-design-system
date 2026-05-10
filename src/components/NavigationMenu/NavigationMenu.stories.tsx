import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
} from './NavigationMenu';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { Container } from '@/components/Container';
import { PageHeader } from '@/components/PageShell';
import { Logo } from '@/components/Logo';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Top-level navigation that supports sub-menu dropdown panels. ' +
          'Token-styled wrapper around `@radix-ui/react-navigation-menu`. ' +
          'For **flat** horizontal nav with no dropdowns, use `NavBar` ' +
          'instead — NavigationMenu carries the full Radix machinery for ' +
          'triggers, viewport sizing, motion-safe transitions, and keyboard ' +
          'menu traversal. Eight exported sub-parts: `NavigationMenu`, ' +
          '`NavigationMenuList`, `NavigationMenuItem`, ' +
          '`NavigationMenuTrigger`, `NavigationMenuContent`, ' +
          '`NavigationMenuLink`, `NavigationMenuViewport`, ' +
          '`NavigationMenuIndicator`, plus the `navigationMenuTriggerStyle` ' +
          'cva helper. All animations respect `prefers-reduced-motion`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NavigationMenu>;

export const Simple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Flat list of links — no sub-menus. Each `NavigationMenuLink` uses ' +
          'the shared `navigationMenuTriggerStyle()` so plain links match the ' +
          'look of sub-menu triggers. The current route gets `data-active` to ' +
          'pick up the active treatment from the cva style.',
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#home"
            data-active
            className={navigationMenuTriggerStyle()}
          >
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#projects" className={navigationMenuTriggerStyle()}>
            Projects
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#people" className={navigationMenuTriggerStyle()}>
            People
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs" className={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithSubmenus: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Realistic top-bar pattern with two triggers each opening a panel ' +
          'of grouped links, plus one plain link. Demonstrates the typical ' +
          'mixed shape: dropdowns for sections that need a sub-menu, plain ' +
          'links styled with `navigationMenuTriggerStyle()` for the rest.',
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] gap-2 p-4 md:grid-cols-2">
              {[
                ['Analytics', 'See what your team is working on.'],
                ['Engagement', 'Keep your community in the loop.'],
                ['Security', 'Govern access and compliance.'],
                ['Integrations', 'Connect to the rest of your stack.'],
              ].map(([title, desc]) => (
                <li key={title}>
                  <NavigationMenuLink
                    href={`#${title.toLowerCase()}`}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {desc}
                    </p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-1 p-4">
              {['Documentation', 'Changelog', 'Status', 'Contact'].map((label) => (
                <li key={label}>
                  <NavigationMenuLink
                    href={`#${label.toLowerCase()}`}
                    className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    {label}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing" className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const NestedRich: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A content panel with a richer layout — a hero card on the left, a ' +
          'list of links on the right. Exists to show that ' +
          '`NavigationMenuContent` is just a container — it can hold any ' +
          'composition, not just lists, and the viewport sizes itself to fit.',
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Studio Manfred</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[640px] grid-cols-[1fr_1fr] gap-4 p-4">
              <Card className="bg-accent/50">
                <CardHeader>
                  <CardTitle>About us</CardTitle>
                </CardHeader>
                <CardContent>
                  <Typography variant="body" className="text-muted-foreground">
                    A design-led product studio building thoughtful internal
                    tools for European businesses.
                  </Typography>
                </CardContent>
              </Card>
              <ul className="grid gap-1">
                {[
                  ['Our work', 'Selected client projects and case studies.'],
                  ['Approach', 'How we run discovery and delivery.'],
                  ['Team', 'The people behind the work.'],
                  ['Careers', 'Open roles at Studio Manfred.'],
                ].map(([title, desc]) => (
                  <li key={title}>
                    <NavigationMenuLink
                      href={`#${title.toLowerCase()}`}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">{title}</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {desc}
                      </p>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithIndicator: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Adds the optional `NavigationMenuIndicator` — a small arrow that ' +
          'tracks the active trigger and points at the open panel. Purely ' +
          'decorative; visibility is driven by Radix data attributes and ' +
          'fades in/out under `motion-safe:`.',
      },
    },
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[280px] gap-1 p-4">
              <li>
                <NavigationMenuLink
                  href="#a"
                  className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Product A
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#b"
                  className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Product B
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[280px] gap-1 p-4">
              <li>
                <NavigationMenuLink
                  href="#docs"
                  className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Documentation
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#guides"
                  className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  Guides
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const InAppHeader: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Composed inside a `<PageHeader>` + `Container` — what the ' +
          "intranet's top bar looks like in production. Uses a monogram " +
          'logo on the left, a NavigationMenu in the centre with mixed ' +
          'plain links + dropdowns, and shows realistic spacing inside the ' +
          'page-shell chrome.',
      },
    },
  },
  render: () => (
    <PageHeader>
      <Container size="xl">
        <div className="flex items-center justify-between gap-6 py-3">
          <Logo variant="monogram" />
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#home"
                  data-active
                  className={navigationMenuTriggerStyle()}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-1 p-4">
                    {['All projects', 'My projects', 'Archived'].map((label) => (
                      <li key={label}>
                        <NavigationMenuLink
                          href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>People</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-1 p-4">
                    {['Directory', 'Teams', 'Org chart'].map((label) => (
                      <li key={label}>
                        <NavigationMenuLink
                          href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block rounded-md p-2 text-sm motion-safe:transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#docs"
                  className={navigationMenuTriggerStyle()}
                >
                  Docs
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </Container>
    </PageHeader>
  ),
};
