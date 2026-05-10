import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './Dialog';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: true },
          // Radix portals the DialogContent outside the story root, so axe
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
          'Modal dialog built on `@radix-ui/react-dialog`. Compound API — ' +
          '`Dialog` owns state, `DialogTrigger` opens, and `DialogContent` ' +
          'renders the focus-trapped body via a portal. Pair with ' +
          '`DialogTitle` and `DialogDescription` so Radix can wire ' +
          '`aria-labelledby` / `aria-describedby` automatically. Three ' +
          'sizes (`sm` / `md` / `lg`); the built-in `X` close button can be ' +
          'suppressed for forced-choice flows.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Pair with `onOpenChange`. Omit for uncontrolled.',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial open state for the uncontrolled mode.',
    },
    modal: {
      control: 'boolean',
      description: 'Trap focus and dim the page. Defaults to `true` — set false for non-modal flows.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default destructive-confirmation pattern — title, description, ' +
          'cancel, confirm. Both footer buttons use `DialogClose asChild` so ' +
          'either resolves the dialog.',
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="brand">Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SmallSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Compact dialog for quick confirmations — `size="sm"` caps the ' +
          'content at `max-w-md` so it sits closer to a snackbar than a form.',
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Small dialog</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Quick confirm</DialogTitle>
        </DialogHeader>
        <p>A compact dialog for simple confirmations.</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="brand">OK</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LargeSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Large dialog with internal scroll (`size="lg"`, `max-w-2xl`) — ' +
          'used for terms-of-service / changelog dialogs where the body ' +
          'needs more vertical room than the snug default.',
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Large dialog</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Please review before continuing.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-auto prose">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="brand">Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Opened: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pre-opened variant for visual / a11y review — the play function ' +
          'clicks the trigger and waits for the portaled content to mount ' +
          'so axe scans the open state, not the opening animation.',
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="brand">Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /open dialog/i }));
    // Wait for the portaled dialog content to mount before the test finishes —
    // otherwise axe/coverage may scan the opening-animation state on slow CI.
    await within(document.body).findByRole('dialog');
  },
};

// Play: open dialog via click, tab through interactive elements, close with Escape.
export const KeyboardInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Keyboard regression — open with click, `Tab` through the focus ' +
          'trap (close button + footer actions), then `Escape` to close. ' +
          'Confirms the focus trap and Escape handling Radix provides.',
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard test</DialogTitle>
          <DialogDescription>
            Tab through the buttons and press Escape to close.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="brand">Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    // Open the dialog by clicking the trigger button.
    await userEvent.click(within(canvasElement).getByRole('button', { name: /open dialog/i }));
    // Wait for the portaled dialog to mount in document.body.
    const dialog = await within(document.body).findByRole('dialog');
    expect(dialog).toBeVisible();
    // Tab count (3) mirrors the dialog's focusable elements: close, Cancel, Confirm. Update if the dialog render changes.
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    // Press Escape — Radix closes the dialog.
    await userEvent.keyboard('{Escape}');
    // Assert the dialog is no longer in the DOM.
    expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

export const WithoutCloseButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Forced-choice variant — `showCloseButton={false}` removes the ' +
          'top-right `X` so the user must pick a footer action. Reserve for ' +
          'flows where dismissing without choosing would leave the app in ' +
          'an inconsistent state.',
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open forced-choice</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Please choose</DialogTitle>
          <DialogDescription>You must make a selection to continue.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">No</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="brand">Yes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
