import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, fn } from 'storybook/test';
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
  SplitButtonContent,
} from './SplitButton';
import { Button } from '../Button';
import { VStack } from '../Stack';

const meta: Meta<typeof SplitButton> = {
  title: 'Components/SplitButton',
  component: SplitButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A split button — a primary action joined to a dropdown toggle ' +
          '(`[ Play │ ▾ ]`). Built on `Button` (variants / sizes / theming) and ' +
          'the DS `Popover` (focus, outside-click / Escape, `aria-expanded`). ' +
          'Compose `SplitButtonAction` (left), `SplitButtonTrigger` (chevron), ' +
          'and `SplitButtonContent` (the panel). `variant` / `size` set on the ' +
          'root flow to both segments.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'brand', 'outline', 'ghost', 'destructive'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;

type Story = StoryObj<typeof SplitButton>;

export const Playground: Story = {
  args: { variant: 'brand', size: 'md' },
  render: (args) => (
    <SplitButton {...args}>
      <SplitButtonAction onClick={() => {}}>Play</SplitButtonAction>
      <SplitButtonTrigger aria-label="More play options" />
      <SplitButtonContent>
        <VStack gap={2}>
          <Button variant="ghost" size="sm">Play from start</Button>
          <Button variant="ghost" size="sm">Play at 1.5×</Button>
          <Button variant="ghost" size="sm">Loop</Button>
        </VStack>
      </SplitButtonContent>
    </SplitButton>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: { description: { story: 'The split button inherits every `Button` variant on both segments.' } },
  },
  render: () => (
    <VStack gap={4} align="start">
      {(['primary', 'brand', 'outline', 'ghost'] as const).map((variant) => (
        <SplitButton key={variant} variant={variant}>
          <SplitButtonAction onClick={() => {}}>Play</SplitButtonAction>
          <SplitButtonTrigger aria-label={`More ${variant} options`} />
          <SplitButtonContent>
            <p style={{ margin: 0 }}>{variant} dropdown content</p>
          </SplitButtonContent>
        </SplitButton>
      ))}
    </VStack>
  ),
};

// Play: the action fires its own onClick; the chevron opens the dropdown (not the action).
export const ClickInteraction: Story = {
  args: { variant: 'primary' },
  render: (args) => {
    const onPlay = fn();
    return (
      <SplitButton {...args}>
        <SplitButtonAction onClick={onPlay}>Play</SplitButtonAction>
        <SplitButtonTrigger aria-label="More play options" />
        <SplitButtonContent>
          <p style={{ margin: 0 }}>Dropdown panel</p>
        </SplitButtonContent>
      </SplitButton>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: 'More play options' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // The chevron opens the dropdown.
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await within(document.body).findByText('Dropdown panel')).toBeVisible();

    // Escape closes it; the action segment is a separate button.
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  },
};
