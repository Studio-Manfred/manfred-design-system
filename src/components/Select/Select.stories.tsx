import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { userEvent, within, expect } from 'storybook/test';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './Select';
import { FormField } from '../FormField';
import { Button } from '../Button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../Dialog';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Fruit" fullWidth>
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Fruit' });
    await expect(trigger).toHaveTextContent('Pick a fruit');
    await userEvent.click(trigger);
    const option = await within(document.body).findByRole('option', { name: 'Banana' });
    await expect(option).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const Controlled: Story = {
  render: () => {
    const ControlledFixture = () => {
      const [value, setValue] = React.useState<string>('');
      return (
        <div className="flex flex-col gap-2 w-64">
          <Select
            value={value}
            onValueChange={(v) => {
              setValue(v);
              action('onValueChange')(v);
            }}
          >
            <SelectTrigger aria-label="Color" fullWidth>
              <SelectValue placeholder="Pick a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">value: {value || '(none)'}</span>
        </div>
      );
    };
    return <ControlledFixture />;
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Color' });
    await userEvent.click(trigger);
    const option = await within(document.body).findByRole('option', { name: 'Green' });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('Green');
  },
};

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Food" fullWidth>
        <SelectValue placeholder="Pick something to eat" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruit</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetable</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="potato">Potato</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Food' }));
    await within(document.body).findByText('Fruit');
    await within(document.body).findByText('Vegetable');
    await userEvent.keyboard('{Escape}');
  },
};

export const WithLeadingIcon: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Search scope" fullWidth leadingIcon="search">
        <SelectValue placeholder="Search in…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All projects</SelectItem>
        <SelectItem value="mine">My projects</SelectItem>
        <SelectItem value="archive">Archive</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Search scope' });
    await expect(trigger).toBeVisible();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-64">
      <Select>
        <SelectTrigger aria-label="Small" size="sm" fullWidth>
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger aria-label="Medium" size="md" fullWidth>
          <SelectValue placeholder="Medium" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger aria-label="Large" size="lg" fullWidth>
          <SelectValue placeholder="Large" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithFormField: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <FormField label="Country" htmlFor="country" status="hint" message="Select your country.">
        <Select>
          <SelectTrigger id="country" aria-label="Country" fullWidth>
            <SelectValue placeholder="Pick a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="se">Sweden</SelectItem>
            <SelectItem value="no">Norway</SelectItem>
            <SelectItem value="dk">Denmark</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField
        label="Plan"
        htmlFor="plan"
        status="error"
        message="Please choose a plan."
      >
        <Select>
          <SelectTrigger
            id="plan"
            aria-label="Plan"
            aria-describedby="plan-error"
            status="error"
            fullWidth
          >
            <SelectValue placeholder="Choose a plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const errorTrigger = within(canvasElement).getByRole('combobox', { name: 'Plan' });
    await expect(errorTrigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const InsideDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile settings</DialogTitle>
        </DialogHeader>
        <FormField label="Language" htmlFor="lang">
          <Select>
            <SelectTrigger id="lang" aria-label="Language" fullWidth>
              <SelectValue placeholder="Pick a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sv">Swedish</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /open dialog/i }));
    const trigger = await within(document.body).findByRole('combobox', { name: 'Language' });
    await userEvent.click(trigger);
    const option = await within(document.body).findByRole('option', { name: 'Swedish' });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('Swedish');
  },
};
