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
} from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { FormField } from '@/components/FormField';
import { TextInput } from '@/components/TextInput';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/Radio';

import {
  brand,
  mockUser,
  navItems,
  footerLinks,
} from '../_shared/content';
import {
  settingsCategories,
  roleOptions,
  notificationPrefs,
  themeOptions,
  sessionTimeouts,
  defaultSettings,
} from './_fixtures';

/**
 * Examples/Settings — second demo in the Examples/* family (after Dashboard).
 *
 * Pattern (mirrors Dashboard.stories.tsx):
 *  - One CSF meta with parameters.layout = 'fullscreen' + landmark-one-main
 *    re-enabled per-story via `enableLandmarkRule`.
 *  - Four state stories: HappyPath / Empty / Loading / Error.
 *  - Brand identity comes from src/examples/_shared/content.ts.
 *  - Demo-specific copy/data lives in ./_fixtures.ts.
 *  - Single h1 (Typography variant="headline2"); CardTitle as="h2" everywhere
 *    else so heading order is h1 -> h2.
 *  - No inline tags (button/h1/p/select/input/label) — every visible element
 *    is a DS component or a layout primitive.
 *  - Card frames keep fixed body heights in Loading so layout doesn't shift.
 *  - Every form input is wrapped in a <FormField> with a visible label so the
 *    `label` axe rule passes.
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

interface SettingsShellProps {
  children: React.ReactNode;
}

function SettingsShell({ children }: SettingsShellProps) {
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
                  active={item.label === 'Settings'}
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
          Settings
        </Typography>
        <Typography variant="bodySmall" color="muted">
          Manage your account, theme, and notification preferences.
        </Typography>
      </VStack>
      {trailing}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Sidebar — vertical settings categories, NavBar with a column override.
// ---------------------------------------------------------------------------

function SettingsSidebar({ activeLabel }: { activeLabel: string }) {
  return (
    <NavBar
      aria-label="Settings sections"
      className="flex-col items-stretch gap-1 w-full"
    >
      {settingsCategories.map((cat) => (
        <NavItem
          key={cat.href}
          href={cat.href}
          active={cat.label === activeLabel}
          className="justify-start"
        >
          {cat.label}
        </NavItem>
      ))}
    </NavBar>
  );
}

// ---------------------------------------------------------------------------
// Card frames — fixed body height for Loading so layout doesn't shift.
// ---------------------------------------------------------------------------

const ACCOUNT_BODY_HEIGHT = 360;
const NOTIFICATIONS_BODY_HEIGHT = 200;
const THEME_BODY_HEIGHT = 140;
const SESSION_BODY_HEIGHT = 96;

interface SettingsCardProps {
  title: string;
  titleId: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsCard({ title, titleId, description, children }: SettingsCardProps) {
  return (
    <Card as="section" padding="md" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId} as="h2">
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// HappyPath — saved settings with the studio's default values.
// ---------------------------------------------------------------------------

function HappyPathBody() {
  return (
    <HStack as="div" gap={8} align="start" wrap>
      <VStack as="aside" gap={4} className="w-full md:w-60 md:shrink-0">
        <SettingsSidebar activeLabel="Account" />
      </VStack>

      <VStack gap={6} className="flex-1 min-w-0 w-full">
        <PageHeading />

        <SettingsCard
          title="Account profile"
          titleId="settings-account-title"
          description="Visible to other studio members."
        >
          <VStack gap={4}>
            <FormField label="Full name" htmlFor="settings-fullname">
              <TextInput
                id="settings-fullname"
                defaultValue={defaultSettings.fullName}
                fullWidth
              />
            </FormField>
            <FormField label="Email" htmlFor="settings-email">
              <TextInput
                id="settings-email"
                type="email"
                defaultValue={defaultSettings.email}
                fullWidth
              />
            </FormField>
            <FormField label="Role" htmlFor="settings-role">
              <Select defaultValue={defaultSettings.role}>
                <SelectTrigger
                  id="settings-role"
                  fullWidth
                  aria-label="Role"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <HStack gap={3} align="center">
              <Avatar
                alt={`Profile picture for ${mockUser.name}`}
                name={mockUser.name}
                initials={mockUser.initials}
                size="lg"
                variant="brand"
              />
              <Button variant="outline" size="sm">
                Change avatar
              </Button>
            </HStack>
          </VStack>
        </SettingsCard>

        <SettingsCard
          title="Notifications"
          titleId="settings-notifications-title"
          description="Choose what reaches your inbox."
        >
          <Grid cols={{ base: 1, md: 2 }} gap={3}>
            {notificationPrefs.map((pref) => (
              <FormField
                key={pref.id}
                label={pref.label}
                htmlFor={pref.id}
              >
                <Checkbox id={pref.id} defaultChecked={pref.enabled} />
              </FormField>
            ))}
          </Grid>
        </SettingsCard>

        <SettingsCard
          title="Theme preference"
          titleId="settings-theme-title"
          description="Applies across all studio tools."
        >
          <FormField label="Theme">
            <RadioGroup
              defaultValue={defaultSettings.theme}
              aria-labelledby="settings-theme-title"
            >
              {themeOptions.map((opt) => (
                <RadioGroupItem
                  key={opt.value}
                  value={opt.value}
                  id={`settings-theme-${opt.value}`}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          </FormField>
        </SettingsCard>

        <SettingsCard
          title="Active session"
          titleId="settings-session-title"
        >
          <FormField label="Session timeout" htmlFor="settings-session-timeout">
            <Select defaultValue={defaultSettings.sessionTimeout}>
              <SelectTrigger
                id="settings-session-timeout"
                fullWidth
                aria-label="Session timeout"
              >
                <SelectValue placeholder="Select a timeout" />
              </SelectTrigger>
              <SelectContent>
                {sessionTimeouts.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </SettingsCard>

        <HStack justify="end" gap={3}>
          <Button variant="ghost">Cancel</Button>
          <Button variant="brand">Save changes</Button>
        </HStack>
      </VStack>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Empty — no saved settings, info alert, blank/placeholder fields.
// ---------------------------------------------------------------------------

function EmptyBody() {
  return (
    <HStack as="div" gap={8} align="start" wrap>
      <VStack as="aside" gap={4} className="w-full md:w-60 md:shrink-0">
        <SettingsSidebar activeLabel="Account" />
      </VStack>

      <VStack gap={6} className="flex-1 min-w-0 w-full">
        <PageHeading />

        <Alert variant="info" title="Nothing saved yet">
          No saved settings yet — adjust the fields below to get started.
        </Alert>

        <SettingsCard
          title="Account profile"
          titleId="settings-empty-account-title"
          description="Visible to other studio members."
        >
          <VStack gap={4}>
            <FormField label="Full name" htmlFor="settings-empty-fullname">
              <TextInput
                id="settings-empty-fullname"
                placeholder="Anna Lindqvist"
                fullWidth
              />
            </FormField>
            <FormField label="Email" htmlFor="settings-empty-email">
              <TextInput
                id="settings-empty-email"
                type="email"
                placeholder="anna@studiomanfred.com"
                fullWidth
              />
            </FormField>
            <FormField label="Role" htmlFor="settings-empty-role">
              <Select>
                <SelectTrigger
                  id="settings-empty-role"
                  fullWidth
                  aria-label="Role"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <HStack gap={3} align="center">
              <Avatar
                alt="No profile picture set"
                initials="?"
                size="lg"
                variant="neutral"
              />
              <Button variant="outline" size="sm">
                Add avatar
              </Button>
            </HStack>
          </VStack>
        </SettingsCard>

        <SettingsCard
          title="Notifications"
          titleId="settings-empty-notifications-title"
          description="Choose what reaches your inbox."
        >
          <Grid cols={{ base: 1, md: 2 }} gap={3}>
            {notificationPrefs.map((pref) => (
              <FormField
                key={`empty-${pref.id}`}
                label={pref.label}
                htmlFor={`empty-${pref.id}`}
              >
                <Checkbox id={`empty-${pref.id}`} defaultChecked={false} />
              </FormField>
            ))}
          </Grid>
        </SettingsCard>

        <SettingsCard
          title="Theme preference"
          titleId="settings-empty-theme-title"
          description="Applies across all studio tools."
        >
          <FormField label="Theme">
            <RadioGroup aria-labelledby="settings-empty-theme-title">
              {themeOptions.map((opt) => (
                <RadioGroupItem
                  key={opt.value}
                  value={opt.value}
                  id={`settings-empty-theme-${opt.value}`}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          </FormField>
        </SettingsCard>

        <SettingsCard
          title="Active session"
          titleId="settings-empty-session-title"
        >
          <FormField label="Session timeout" htmlFor="settings-empty-session-timeout">
            <Select>
              <SelectTrigger
                id="settings-empty-session-timeout"
                fullWidth
                aria-label="Session timeout"
              >
                <SelectValue placeholder="Select a timeout" />
              </SelectTrigger>
              <SelectContent>
                {sessionTimeouts.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </SettingsCard>

        <HStack justify="end" gap={3}>
          <Button variant="ghost" disabled>
            Cancel
          </Button>
          <Button variant="brand" disabled>
            Save changes
          </Button>
        </HStack>
      </VStack>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Loading — same shell, spinners replace card bodies, fixed heights.
// ---------------------------------------------------------------------------

function LoadingBody() {
  const spinnerRow = (label: string, height: number) => (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight: height }}
    >
      <Spinner size="lg" label={label} />
    </div>
  );

  return (
    <HStack as="div" gap={8} align="start" wrap>
      <VStack as="aside" gap={4} className="w-full md:w-60 md:shrink-0">
        <SettingsSidebar activeLabel="Account" />
      </VStack>

      <VStack gap={6} className="flex-1 min-w-0 w-full">
        <PageHeading />

        <SettingsCard
          title="Account profile"
          titleId="settings-loading-account-title"
          description="Visible to other studio members."
        >
          {spinnerRow('Loading account profile', ACCOUNT_BODY_HEIGHT)}
        </SettingsCard>

        <SettingsCard
          title="Notifications"
          titleId="settings-loading-notifications-title"
          description="Choose what reaches your inbox."
        >
          {spinnerRow('Loading notification preferences', NOTIFICATIONS_BODY_HEIGHT)}
        </SettingsCard>

        <SettingsCard
          title="Theme preference"
          titleId="settings-loading-theme-title"
          description="Applies across all studio tools."
        >
          {spinnerRow('Loading theme preference', THEME_BODY_HEIGHT)}
        </SettingsCard>

        <SettingsCard
          title="Active session"
          titleId="settings-loading-session-title"
        >
          {spinnerRow('Loading session settings', SESSION_BODY_HEIGHT)}
        </SettingsCard>

        <HStack justify="end" gap={3}>
          <Button variant="ghost" disabled>
            Cancel
          </Button>
          <Button variant="brand" disabled>
            Save changes
          </Button>
        </HStack>
      </VStack>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Error — same shell + last-known values, error alert at top.
// ---------------------------------------------------------------------------

function ErrorBody() {
  return (
    <HStack as="div" gap={8} align="start" wrap>
      <VStack as="aside" gap={4} className="w-full md:w-60 md:shrink-0">
        <SettingsSidebar activeLabel="Account" />
      </VStack>

      <VStack gap={6} className="flex-1 min-w-0 w-full">
        <PageHeading />

        <Alert variant="error" title="Couldn't save your settings">
          Couldn't save your settings. Try again, or refresh the page if the
          problem persists.
        </Alert>

        <SettingsCard
          title="Account profile"
          titleId="settings-error-account-title"
          description="Visible to other studio members."
        >
          <VStack gap={4}>
            <FormField label="Full name" htmlFor="settings-error-fullname">
              <TextInput
                id="settings-error-fullname"
                defaultValue={defaultSettings.fullName}
                fullWidth
              />
            </FormField>
            <FormField label="Email" htmlFor="settings-error-email">
              <TextInput
                id="settings-error-email"
                type="email"
                defaultValue={defaultSettings.email}
                fullWidth
              />
            </FormField>
            <FormField label="Role" htmlFor="settings-error-role">
              <Select defaultValue={defaultSettings.role}>
                <SelectTrigger
                  id="settings-error-role"
                  fullWidth
                  aria-label="Role"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <HStack gap={3} align="center">
              <Avatar
                alt={`Profile picture for ${mockUser.name}`}
                name={mockUser.name}
                initials={mockUser.initials}
                size="lg"
                variant="brand"
              />
              <Button variant="outline" size="sm">
                Change avatar
              </Button>
            </HStack>
          </VStack>
        </SettingsCard>

        <SettingsCard
          title="Notifications"
          titleId="settings-error-notifications-title"
          description="Choose what reaches your inbox."
        >
          <Grid cols={{ base: 1, md: 2 }} gap={3}>
            {notificationPrefs.map((pref) => (
              <FormField
                key={`error-${pref.id}`}
                label={pref.label}
                htmlFor={`error-${pref.id}`}
              >
                <Checkbox
                  id={`error-${pref.id}`}
                  defaultChecked={pref.enabled}
                />
              </FormField>
            ))}
          </Grid>
        </SettingsCard>

        <SettingsCard
          title="Theme preference"
          titleId="settings-error-theme-title"
          description="Applies across all studio tools."
        >
          <FormField label="Theme">
            <RadioGroup
              defaultValue={defaultSettings.theme}
              aria-labelledby="settings-error-theme-title"
            >
              {themeOptions.map((opt) => (
                <RadioGroupItem
                  key={opt.value}
                  value={opt.value}
                  id={`settings-error-theme-${opt.value}`}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          </FormField>
        </SettingsCard>

        <SettingsCard
          title="Active session"
          titleId="settings-error-session-title"
        >
          <FormField
            label="Session timeout"
            htmlFor="settings-error-session-timeout"
          >
            <Select defaultValue={defaultSettings.sessionTimeout}>
              <SelectTrigger
                id="settings-error-session-timeout"
                fullWidth
                aria-label="Session timeout"
              >
                <SelectValue placeholder="Select a timeout" />
              </SelectTrigger>
              <SelectContent>
                {sessionTimeouts.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </SettingsCard>

        <HStack justify="end" gap={3}>
          <Button variant="ghost">Cancel</Button>
          <Button variant="brand">Try saving again</Button>
        </HStack>
      </VStack>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta + stories.
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Examples/Settings',
  parameters: {
    layout: 'fullscreen',
    ...enableLandmarkRule,
  },
};
export default meta;

type Story = StoryObj;

export const HappyPath: Story = {
  render: () => (
    <SettingsShell>
      <HappyPathBody />
    </SettingsShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <SettingsShell>
      <EmptyBody />
    </SettingsShell>
  ),
};

export const Loading: Story = {
  render: () => (
    <SettingsShell>
      <LoadingBody />
    </SettingsShell>
  ),
};

export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <SettingsShell>
      <ErrorBody />
    </SettingsShell>
  ),
};
