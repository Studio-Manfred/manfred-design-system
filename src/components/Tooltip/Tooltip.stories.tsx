import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import { Button } from '../Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: true },
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={200}>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent side="top">This is a tooltip</TooltipContent>
    </Tooltip>
  ),
};

export const AllPlacements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '48px' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Appears above</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Appears below</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">Appears to the left</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">Appears to the right</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">No delay</Button>
          </TooltipTrigger>
          <TooltipContent side="top">Instant (0ms delay)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">500ms delay</Button>
          </TooltipTrigger>
          <TooltipContent side="top">500ms delay</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};

// Play: keyboard-focus the trigger (Tab), assert tooltip appears, blur to dismiss.
export const KeyboardInteraction: Story = {
  render: () => (
    // Per-story delayDuration=0 shadows the meta decorator's 200ms default — tooltip must appear immediately for the assertion.
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Focus me</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Keyboard tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('button', { name: 'Focus me' });
    // Radix Tooltip responds to focus events; tab() in headless runtime does not always propagate focusin reliably — using direct focus() for determinism.
    const trigger = canvas.getByRole('button', { name: 'Focus me' });
    trigger.focus();
    // Wait for the portaled tooltip content to appear.
    const tooltip = await within(document.body).findByRole('tooltip', { name: 'Keyboard tooltip' });
    expect(tooltip).toBeVisible();
    // Press Escape — Radix closes the tooltip.
    await userEvent.keyboard('{Escape}');
    expect(within(document.body).queryByRole('tooltip')).toBeNull();
  },
};

export const OnInlineText: Story = {
  render: () => (
    <p style={{ fontFamily: 'Host Grotesk, sans-serif', maxWidth: '480px' }}>
      Hover over{' '}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            style={{
              textDecoration: 'underline dotted',
              textUnderlineOffset: '3px',
              cursor: 'help',
            }}
            tabIndex={0}
          >
            this term
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">Definition or extra context</TooltipContent>
      </Tooltip>{' '}
      to see an inline tooltip with definition text.
    </p>
  ),
};
