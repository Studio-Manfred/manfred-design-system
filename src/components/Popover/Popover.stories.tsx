import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './Popover';
import { Button } from '../Button';
import { Icon } from '../Icon';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compound popover built on `@radix-ui/react-popover`. Compose ' +
          '`Popover` + `PopoverTrigger asChild` + `PopoverContent`. The ' +
          'trigger can be any element (button, link, icon); the panel portals ' +
          'to `body`, animates, and uses the popover surface tokens. Radix ' +
          'handles focus, outside-click / Escape dismissal, and the ' +
          '`aria-expanded` / `aria-controls` wiring on the trigger.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A popover opened from a button. Click outside or press Escape to dismiss.',
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p style={{ margin: 0 }}>Popover content — any interactive controls live here.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const FromAnIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The trigger is an icon button (`asChild`) — the same pattern works ' +
          'for a link, a `Badge`, or plain text. Shows a `PopoverClose` inside.',
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" aria-label="Settings">
          <Icon name="settings" size="sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p style={{ marginTop: 0 }}>Settings live here.</p>
        <PopoverClose asChild>
          <Button size="sm">Done</Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  ),
};

// Play: click the trigger, assert it opens (aria-expanded + portalled content), Escape closes.
export const ClickInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — clicks the trigger, asserts the panel opens and ' +
          'the trigger reports `aria-expanded`, then Escape closes it.',
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open settings</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p style={{ margin: 0 }}>Settings panel</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: 'Open settings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Content portals to body, so query there rather than the canvas.
    expect(await within(document.body).findByText('Settings panel')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
