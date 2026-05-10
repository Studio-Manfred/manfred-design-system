import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './Sheet';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { Textarea } from '../Textarea';
import { FormField } from '../FormField';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          // Radix portals SheetContent outside the story root, so axe
          // cannot resolve aria-controls="radix-*" → the target IS on the
          // page, just not in the scanned subtree. Known false positive.
          { id: 'aria-valid-attr-value', enabled: false },
          // Radix's focus-guard <span tabindex=0 aria-hidden> sentinels are
          // load-bearing for the focus trap — by design focusable + hidden.
          { id: 'aria-hidden-focus', enabled: false },
        ],
      },
    },
    docs: {
      description: {
        component:
          'Side-anchored sheet built on `@radix-ui/react-dialog`. Slides in ' +
          'from `top` / `right` / `bottom` / `left`. Compose with ' +
          '`SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, ' +
          '`SheetDescription`, `SheetFooter`, and `SheetClose`. Focus trap, ' +
          'escape-to-close, and overlay click-through come from Radix; slide ' +
          'animations are gated on `motion-safe`.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default `right`-side sheet with full header / body / footer. Most ' +
          'common form-edit pattern.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open right sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Update your account details. Changes are saved when you press Save.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 py-4">
          <p className="text-sm text-muted-foreground">Sheet body content goes here.</p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="brand">Save</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Left-anchored sheet — fits the mobile navigation drawer pattern.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Mobile-friendly nav drawer.</SheetDescription>
        </SheetHeader>
        <nav className="flex-1 py-4">
          <ul className="flex flex-col gap-2">
            <li>Dashboard</li>
            <li>Projects</li>
            <li>Settings</li>
          </ul>
        </nav>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Top-anchored sheet — useful for system-wide announcements and ' +
          'quick-action surfaces.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open top sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>System notice</SheetTitle>
          <SheetDescription>
            A drop-down banner anchored to the top of the viewport.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="brand">Got it</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Bottom-anchored sheet — fits the mobile action-sheet / comments ' +
          'thread pattern.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open bottom sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription>Mobile bottom-sheet pattern.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 py-4">
          <p className="text-sm text-muted-foreground">Comment thread content.</p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="brand">Post</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Sheet hosting a `FormField` + `TextInput` + `Textarea` form. ' +
          'Demonstrates how the focus trap interacts with form controls and ' +
          'how the footer aligns Cancel / Save buttons.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Edit project</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit project</SheetTitle>
          <SheetDescription>Update name and description.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4">
          <FormField label="Project name" htmlFor="sheet-form-name">
            <TextInput id="sheet-form-name" defaultValue="Manfred intranet" />
          </FormField>
          <FormField label="Description" htmlFor="sheet-form-desc">
            <Textarea id="sheet-form-desc" rows={4} defaultValue="Internal product." />
          </FormField>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="brand">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const NoCloseButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Hide the corner X via `showCloseButton={false}` when you want users ' +
          'to commit to an explicit Cancel / Save decision. Escape and ' +
          'overlay click still close.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open sheet</Button>
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Confirm changes</SheetTitle>
          <SheetDescription>
            Use the explicit Cancel / Save buttons or press Escape — there is no X.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 py-4" />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="brand">Save</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Opened: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Visual / a11y review story — the `play` function clicks the trigger ' +
          'so the sheet starts open. Lets axe scan the dialog subtree.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open right sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Opened by play function</SheetTitle>
          <SheetDescription>For visual review and a11y scanning.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="brand">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /open right sheet/i }));
    const sheet = await within(document.body).findByRole('dialog');
    expect(sheet).toBeVisible();
  },
};
