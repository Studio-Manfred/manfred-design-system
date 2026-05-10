import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { userEvent, within, expect } from 'storybook/test';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inline feedback message — for status, validation, and one-off ' +
          'notices that should sit alongside content rather than overlay it. ' +
          'Four severity variants (`info` / `success` / `warning` / ' +
          '`error`), optional title, optional dismiss button, and a ' +
          'colour-and-icon pairing so severity is never communicated by ' +
          'colour alone. Renders with `role="alert"` so screen readers ' +
          'announce the message when it appears in the DOM.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description:
        'Severity. Drives both the colour palette and the leading icon. ' +
        '`info` is neutral; `success` / `warning` / `error` are status.',
      table: { defaultValue: { summary: 'info' } },
    },
    title: {
      control: 'text',
      description:
        'Optional bold heading. Use a short noun phrase ("Changes saved", ' +
        '"Something went wrong") rather than a sentence.',
    },
    children: {
      control: 'text',
      description:
        'Body content. Plain text or inline markup. Omit when `title` ' +
        'alone suffices.',
    },
    icon: {
      control: 'boolean',
      description:
        'Show the variant icon at the leading edge. Defaults to `true`.',
      table: { defaultValue: { summary: 'true' } },
    },
    onClose: {
      action: 'close',
      description:
        'When provided, renders a dismiss button. Caller owns dismissal — ' +
        'typically by removing the alert from state.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational message for the user.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle every prop via the Controls panel below.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Alert carries role="alert" so AT announces the message immediately on insertion.
    expect(canvas.getByRole('alert')).toBeInTheDocument();
    // Hovering the alert verifies the element is interactable (no pointer-events: none regression).
    await userEvent.hover(canvas.getByRole('alert'));
    expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All four severity levels in vertical sequence so the colour-and-icon ' +
          'pairing is comparable at a glance. Confirms each variant carries ' +
          'meaning beyond colour alone.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info">Your account settings have been updated.</Alert>
      <Alert variant="success">Payment processed successfully.</Alert>
      <Alert variant="warning">Your subscription expires in 3 days.</Alert>
      <Alert variant="error">Failed to save changes. Please try again.</Alert>
    </div>
  ),
};

export const WithTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Title + body shape — the most common form. The title is the ' +
          'scannable summary, the body the detail. Use this when the message ' +
          'has both a "what happened" and a "what to do".',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="success" title="Changes saved">
        Your profile has been updated successfully.
      </Alert>
      <Alert variant="error" title="Something went wrong">
        We could not process your request. Please try again later.
      </Alert>
    </div>
  ),
};

export const Dismissible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Dismissible alerts — pass `onClose` to render the close button. ' +
          'Each alert can be dismissed independently; the close control ships ' +
          'with `aria-label="Dismiss alert"` for screen readers.',
      },
    },
  },
  render: () => {
    const [alerts, setAlerts] = useState<string[]>(['info', 'success', 'warning', 'error']);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' }}>
        {alerts.length === 0 && (
          <span style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            All alerts dismissed.
          </span>
        )}
        {alerts.includes('info') && (
          <Alert variant="info" onClose={() => setAlerts((a) => a.filter((x) => x !== 'info'))}>
            Informational alert — dismiss me.
          </Alert>
        )}
        {alerts.includes('success') && (
          <Alert variant="success" onClose={() => setAlerts((a) => a.filter((x) => x !== 'success'))}>
            Success alert — dismiss me.
          </Alert>
        )}
        {alerts.includes('warning') && (
          <Alert variant="warning" onClose={() => setAlerts((a) => a.filter((x) => x !== 'warning'))}>
            Warning alert — dismiss me.
          </Alert>
        )}
        {alerts.includes('error') && (
          <Alert variant="error" onClose={() => setAlerts((a) => a.filter((x) => x !== 'error'))}>
            Error alert — dismiss me.
          </Alert>
        )}
      </div>
    );
  },
};
