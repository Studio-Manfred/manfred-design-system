import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './components/Logo';
import { Typography } from './components/Typography';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/Card';
import { Badge } from './components/Badge';
import { HStack, VStack } from './components/Stack';
import { Grid } from './components/Grid';
import { Icon } from './components/Icon';

const meta: Meta = {
  title: 'Welcome',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

const Divider = () => (
  <hr
    style={{
      border: 0,
      borderTop: '1px solid var(--border)',
      margin: 0,
      width: '100%',
    }}
  />
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-muted text-foreground text-[0.92em]">
    {children}
  </code>
);

const Pre = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-muted text-foreground p-4 rounded-[var(--radius-md)] overflow-x-auto text-sm leading-relaxed">
    {children}
  </pre>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_top"
    className="text-foreground underline underline-offset-2 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] rounded-sm"
  >
    {children}
  </a>
);

export const Default: Story = {
  name: 'Welcome',
  render: () => (
    <div className="bg-background text-foreground min-h-screen">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '64px 24px' }}>
        <VStack gap={8}>
          <HStack gap={4} align="center" wrap>
            <Logo variant="wordmark" color="blue" height={56} />
            <Badge variant="secondary" size="sm">
              v0.10.1
            </Badge>
          </HStack>

          <VStack gap={3}>
            <Typography variant="headline1" as="h1">
              Studio Manfred Design System
            </Typography>
            <Typography variant="large" color="muted">
              The React component library powering Studio Manfred apps. Tokens, typography, layout
              primitives, and 30+ components — all built on Tailwind v4 and shadcn idioms, with
              light and dark mode out of the box.
            </Typography>
          </VStack>

          <Divider />

          <VStack gap={4}>
            <Typography variant="headline3" as="h2">
              What's in here
            </Typography>

            <Grid cols={{ base: 1, md: 2 }} gap={4}>
              <Card>
                <CardHeader>
                  <HStack gap={2} align="center">
                    <Icon name="check-circle" size="md" />
                    <CardTitle as="h3">Foundation</CardTitle>
                  </HStack>
                  <CardDescription>
                    Three-layer tokens (primitives → semantic → shadcn contract), a 9-step
                    typography scale, the Manfred logo in wordmark and monogram, and the icon set.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySmall" color="muted">
                    <NavLink href="./?path=/story/foundation-tokens--brand-palette">Tokens</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/foundation-typography--all-variants">
                      Typography
                    </NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/foundation-logo--all-variants">Logo</NavLink>
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <HStack gap={2} align="center">
                    <Icon name="check-circle" size="md" />
                    <CardTitle as="h3">Layout</CardTitle>
                  </HStack>
                  <CardDescription>
                    Page-level building blocks: Stack / VStack / HStack for sibling rhythm,
                    Container and Grid for max-widths and tile rows, PageShell for app shells,
                    PageBackground for surface variants.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySmall" color="muted">
                    <NavLink href="./?path=/story/layout-stack--default">Stack</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/layout-container--default">Container</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/layout-grid--default">Grid</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/layout-pageshell--dashboard-example">
                      PageShell
                    </NavLink>
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <HStack gap={2} align="center">
                    <Icon name="check-circle" size="md" />
                    <CardTitle as="h3">Components</CardTitle>
                  </HStack>
                  <CardDescription>
                    30+ interactive components — Button, Card, Dialog, Select, Tabs, DatePicker,
                    Toast, Tooltip, Charts, and more. Built on Radix primitives and CVA variants,
                    with sensible defaults.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySmall" color="muted">
                    <NavLink href="./?path=/story/components-button--all-variants">Button</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/components-card--default">Card</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/components-dialog--playground">Dialog</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/components-chart--bar-monthly">Charts</NavLink>
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <HStack gap={2} align="center">
                    <Icon name="check-circle" size="md" />
                    <CardTitle as="h3">Examples</CardTitle>
                  </HStack>
                  <CardDescription>
                    Full-page demos showing how the components compose into real layouts. Dashboard,
                    Settings, Landing, Login — each with happy / empty / loading / error states.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography variant="bodySmall" color="muted">
                    <NavLink href="./?path=/story/examples-dashboard--happy-path">
                      Dashboard
                    </NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/examples-settings--happy-path">Settings</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/examples-landing--happy-path">Landing</NavLink>
                    {' · '}
                    <NavLink href="./?path=/story/examples-login--happy-path">Login</NavLink>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </VStack>

          <Divider />

          <VStack gap={4}>
            <Typography variant="headline3" as="h2">
              Getting started
            </Typography>
            <Typography variant="body">
              The package is hosted on <strong>GitHub Packages</strong>, not public npm. Add a
              scoped <Code>.npmrc</Code> first:
            </Typography>
            <Pre>{`# .npmrc (in your consuming project root)
@studio-manfred:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`}</Pre>
            <Typography variant="body">Then install and import:</Typography>
            <Pre>{`npm install @studio-manfred/manfred-design-system`}</Pre>
            <Pre>{`import '@studio-manfred/manfred-design-system/styles';
import { Button } from '@studio-manfred/manfred-design-system';

export function App() {
  return <Button variant="brand">Hello, Manfred</Button>;
}`}</Pre>
            <Typography variant="body">
              Full onboarding (PAT setup, CI examples, troubleshooting): see the{' '}
              <NavLink href="https://github.com/Studio-Manfred/manfred-design-system/blob/main/docs/CONSUMING.md">
                Consuming guide
              </NavLink>
              .
            </Typography>
          </VStack>

          <Divider />

          <VStack gap={4}>
            <Typography variant="headline3" as="h2">
              Light, dark, and system
            </Typography>
            <Typography variant="body">
              Use the <strong>theme switcher</strong> in the Storybook toolbar (top right) to flip
              between <Code>system</Code> (follows OS), <Code>light</Code>, and <Code>dark</Code>.
              Every story is verified clean by the runtime axe scan in both modes — color contrast,
              focus indicators, and label semantics are part of the contract.
            </Typography>
          </VStack>

          <Divider />

          <VStack gap={4}>
            <Typography variant="headline3" as="h2">
              Working with the system
            </Typography>
            <VStack
              as="ul"
              gap={2}
              style={{ paddingLeft: '1.25rem', margin: 0, listStyle: 'disc' }}
            >
              <Typography as="li" variant="body">
                <strong>Tokens are the source of truth.</strong> Components reference{' '}
                <Code>var(--color-...)</Code> directly. Don't hardcode hex.
              </Typography>
              <Typography as="li" variant="body">
                <strong>Composition over configuration.</strong> <Code>Card</Code> is{' '}
                <Code>Card + CardHeader + CardContent + CardFooter</Code> — pick what you need.
              </Typography>
              <Typography as="li" variant="body">
                <strong>Layout primitives, then components.</strong> Reach for <Code>Stack</Code> /{' '}
                <Code>Grid</Code> / <Code>Container</Code> before raw Tailwind utilities.
              </Typography>
              <Typography as="li" variant="body">
                <strong>Accessibility is non-negotiable.</strong> Every interactive component
                supports keyboard, screen reader, and reduced-motion. The runtime axe scan blocks
                anything that regresses.
              </Typography>
            </VStack>
          </VStack>
        </VStack>
      </div>
    </div>
  ),
};
