import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent, fn } from 'storybook/test';
import { Stepper, type StepperStep } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Generic, data-driven progress indicator for multi-step flows ' +
          '(wizards, checkouts, onboarding). The consumer supplies a `steps` ' +
          "array and each step's `status` (`complete` / `current` / " +
          '`upcoming` / `error`). Horizontal or vertical, optional per-step ' +
          'descriptions, and optional click-to-navigate via `onStepClick` ' +
          '(only `complete` / `current` / `error` steps are interactive — you ' +
          'can never jump ahead).',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    steps: { control: 'object', description: 'Ordered step descriptors.' },
    // Display-only stories must NOT receive a handler, or every step becomes a
    // button. Keep onStepClick out of the auto-controls; pass it explicitly in
    // the Clickable story only.
    onStepClick: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const WIZARD: StepperStep[] = [
  { label: 'Dates', status: 'complete' },
  { label: 'Times', status: 'current' },
  { label: 'Share', status: 'upcoming' },
];

export const Playground: Story = {
  args: { steps: WIZARD, orientation: 'horizontal' },
  parameters: {
    docs: {
      description: {
        story: 'Interactive sandbox — edit the steps array and orientation via the Controls panel.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  args: { steps: WIZARD },
  parameters: {
    docs: {
      description: {
        story:
          'Default horizontal layout. Completed steps show a check; the current ' +
          'step shows its number with a bold label; upcoming steps are muted.',
      },
    },
  },
};

export const Vertical: Story = {
  args: { steps: WIZARD, orientation: 'vertical' },
  parameters: {
    docs: {
      description: {
        story: 'Vertical layout for sidebars and mobile flows — the connector becomes a vertical line.',
      },
    },
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: [
      { label: 'Dates', status: 'complete', description: 'Pick candidate days' },
      { label: 'Times', status: 'current', description: 'Set time slots' },
      { label: 'Share', status: 'upcoming', description: 'Send the poll link' },
    ],
    orientation: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Optional per-step `description` renders under the label — most legible in the vertical layout.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    steps: [
      { label: 'Dates', status: 'complete' },
      { label: 'Times', status: 'error', description: 'Fix the overlapping slots' },
      { label: 'Share', status: 'upcoming' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'A step in the `error` state shows the destructive token + an x-circle ' +
          'icon and adds an sr-only ", error" so the state is announced, not ' +
          'conveyed by colour alone.',
      },
    },
  },
};

export const Clickable: Story = {
  args: { steps: WIZARD, onStepClick: fn() },
  parameters: {
    docs: {
      description: {
        story:
          'When `onStepClick` is set, completed and current steps become ' +
          'keyboard-focusable buttons. Upcoming steps stay non-interactive — ' +
          'you cannot jump ahead.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Dates/ }));
    expect(args.onStepClick).toHaveBeenCalled();
    expect(canvas.queryByRole('button', { name: /Share/ })).toBeNull();
  },
};
