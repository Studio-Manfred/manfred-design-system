import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageBackground } from '@/components/PageBackground';
import { VStack, HStack } from '@/components/Stack';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/Card';
import { FormField } from '@/components/FormField';
import { TextInput } from '@/components/TextInput';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Spinner } from '@/components/Spinner';
import { Typography } from '@/components/Typography';

import { mockUser } from '../_shared/content';
import { authCopy, authErrors } from './_fixtures';

/**
 * Examples/Login — auth screen built only from public DS exports.
 *
 * Pattern (mirrors Examples/Dashboard, smaller in scope):
 *  - Single CSF meta with parameters.layout = 'fullscreen' + landmark-one-main
 *    re-enabled. The runtime axe scan also opts `examples-*` story IDs back
 *    into the landmark rule.
 *  - Four state stories per demo: HappyPath / Empty / Loading / Error.
 *  - No PageShell — this is a single-card screen, so PageBackground itself
 *    renders as `<main>` to provide the one required landmark.
 *  - One h1 per story: <Typography variant="headline2" as="h1"> above the
 *    form, inside CardHeader.
 *  - Form is a real <form onSubmit={preventDefault}> so screen readers
 *    announce it as a form (visual-only demo, no submission).
 *  - Loading + Error reuse the same Card frame as HappyPath; no layout shift.
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
// Shared shell — PageBackground renders as the single <main> landmark, with
// the auth Card centred inside it. All four state stories pass their body
// through this shell so the frame stays identical across states.
// ---------------------------------------------------------------------------

interface LoginShellProps {
  children: React.ReactNode;
}

function LoginShell({ children }: LoginShellProps) {
  return (
    <PageBackground
      as="main"
      variant="warm"
      className="flex items-center justify-center p-6"
    >
      <Card as="section" padding="lg" className="w-full max-w-[24rem]">
        {children}
      </Card>
    </PageBackground>
  );
}

// ---------------------------------------------------------------------------
// Header — same in every state. h1 + description live inside CardHeader so
// the form's accessible name is anchored to the visible heading.
// ---------------------------------------------------------------------------

function LoginHeader() {
  return (
    <CardHeader>
      <Typography variant="headline2" as="h1">
        {authCopy.heading}
      </Typography>
      <Typography variant="bodySmall" color="muted">
        {authCopy.description}
      </Typography>
    </CardHeader>
  );
}

// ---------------------------------------------------------------------------
// Footer — "New to Studio Manfred? Create account". Button has no `link`
// variant in this DS, so the ghost variant carries the role; size="sm" keeps
// it visually inline with surrounding bodySmall copy.
// ---------------------------------------------------------------------------

function LoginFooter() {
  return (
    <CardFooter className="justify-center gap-1">
      <Typography variant="bodySmall" color="muted" as="span">
        {authCopy.switchToSignupPrefix}
      </Typography>
      <Button variant="ghost" size="sm" type="button">
        {authCopy.switchToSignupCta}
      </Button>
    </CardFooter>
  );
}

// ---------------------------------------------------------------------------
// Body sections — composed by each state story.
// ---------------------------------------------------------------------------

interface FormBodyProps {
  /** Stable per-story id prefix so labels link to the right inputs. */
  idPrefix: string;
  /** Optional Alert rendered above the fields (Error state only). */
  alert?: React.ReactNode;
  /** Pre-filled email value (Error state only). */
  emailValue?: string;
  /** Lock all inputs and the submit button (Loading state only). */
  disabled?: boolean;
  /** Render a Spinner inside the submit button (Loading state only). */
  loading?: boolean;
}

function LoginFormBody({
  idPrefix,
  alert,
  emailValue,
  disabled = false,
  loading = false,
}: FormBodyProps) {
  const emailId = `${idPrefix}-email`;
  const passwordId = `${idPrefix}-password`;
  const rememberId = `${idPrefix}-remember`;

  return (
    <CardContent>
      <form
        onSubmit={(event) => event.preventDefault()}
        aria-labelledby={`${idPrefix}-form-title`}
        noValidate
      >
        {/* Hidden form title links the form to the h1 for AT users that read
            the form landmark before reaching the visible heading. */}
        <span id={`${idPrefix}-form-title`} className="sr-only">
          {authCopy.heading}
        </span>

        <VStack gap={4}>
          {alert}

          <FormField label="Email" htmlFor={emailId}>
            <TextInput
              id={emailId}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={authCopy.emailPlaceholder}
              defaultValue={emailValue}
              disabled={disabled}
              fullWidth
            />
          </FormField>

          <FormField label="Password" htmlFor={passwordId}>
            <TextInput
              id={passwordId}
              type="password"
              name="password"
              autoComplete="current-password"
              disabled={disabled}
              fullWidth
            />
          </FormField>

          <HStack justify="between" align="center" gap={3} wrap>
            <Checkbox
              id={rememberId}
              label={authCopy.rememberLabel}
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={disabled}
            >
              {authCopy.forgotLabel}
            </Button>
          </HStack>

          <Button
            variant="brand"
            size="md"
            fullWidth
            type="submit"
            disabled={disabled}
            isLoading={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" label={`${authCopy.submitLabel} in progress`} />
                <span>{authCopy.submitLabel}</span>
              </>
            ) : (
              authCopy.submitLabel
            )}
          </Button>
        </VStack>
      </form>
    </CardContent>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta + stories.
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Examples/Login',
  parameters: {
    layout: 'fullscreen',
    ...enableLandmarkRule,
  },
};
export default meta;

type Story = StoryObj;

export const HappyPath: Story = {
  render: () => (
    <LoginShell>
      <LoginHeader />
      <LoginFormBody idPrefix="login-happy" />
      <LoginFooter />
    </LoginShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <LoginShell>
      <LoginHeader />
      <LoginFormBody idPrefix="login-empty" />
      <LoginFooter />
    </LoginShell>
  ),
};

export const Loading: Story = {
  render: () => (
    <LoginShell>
      <LoginHeader />
      <LoginFormBody
        idPrefix="login-loading"
        emailValue={mockUser.email}
        disabled
        loading
      />
      <LoginFooter />
    </LoginShell>
  ),
};

export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <LoginShell>
      <LoginHeader />
      <LoginFormBody
        idPrefix="login-error"
        emailValue={mockUser.email}
        alert={
          <Alert variant="error" title="Sign-in failed">
            {authErrors[0].message}
          </Alert>
        }
      />
      <LoginFooter />
    </LoginShell>
  ),
};
