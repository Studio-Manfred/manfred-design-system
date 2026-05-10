import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Vertically stacked, expand-and-collapse panel set built on ' +
          '`@radix-ui/react-accordion`. Composes `Accordion` (root) with ' +
          '`AccordionItem`, `AccordionTrigger`, and `AccordionContent`. ' +
          'Single-open or multi-open via Radix\'s discriminated `type` prop. ' +
          'Animations are gated behind `motion-safe:` so reduced-motion ' +
          'users still get full open / close behaviour.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description:
        '`single` allows one open item at a time; `multiple` allows any ' +
        'number open. Required by Radix.',
    },
    collapsible: {
      control: 'boolean',
      description:
        'Only valid when `type="single"`. Lets the user close the open ' +
        'item by clicking it again.',
    },
    defaultValue: {
      control: 'text',
      description:
        'Uncontrolled initial open value (string for single, string[] for ' +
        'multiple).',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Single-open mode with `collapsible`. The most common shape — an ' +
          'FAQ block, where focusing one answer hides the others. Clicking ' +
          'the open item closes it.',
      },
    },
  },
  render: () => (
    <Accordion type="single" collapsible className="w-[480px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. The Accordion is built on @radix-ui/react-accordion which
          handles roving tabindex, keyboard navigation, and ARIA semantics
          out of the box.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Does it animate?</AccordionTrigger>
        <AccordionContent>
          Yes — but only when the user hasn&apos;t set
          `prefers-reduced-motion`. Reduced-motion users still see open
          and close, just without the slide.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
        <AccordionContent>
          Yes. All colors flow through the design-token contract, so the
          component reskins automatically under the `dark` class on the
          root element.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Can I open multiple items?</AccordionTrigger>
        <AccordionContent>
          Use `type="multiple"` instead of `type="single"`.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All triggers render as buttons with aria-expanded="false" initially —
    // guards against an item opening by default when no defaultValue is set.
    const firstTrigger = canvas.getByRole('button', { name: /accessible/i });
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

    // Click opens the first item — guards against the Radix
    // onValueChange / state-machine wiring regressing under future refactors.
    await userEvent.click(firstTrigger);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    // Content becomes available; findByText handles the open animation —
    // guards against AccordionContent failing to mount on state change.
    expect(await canvas.findByText(/roving tabindex/i)).toBeVisible();

    // ArrowDown moves focus to the next trigger via Radix's roving
    // tabindex — guards against the keyboard handler regressing.
    await userEvent.keyboard('{ArrowDown}');
    const secondTrigger = canvas.getByRole('button', { name: /animate/i });
    expect(secondTrigger).toHaveFocus();

    // Single-collapsible: opening item 2 must close item 1 — guards
    // against the discriminated `type` prop regressing into multi-open.
    await userEvent.click(secondTrigger);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Multi-open mode. Use when the items are independent and the user ' +
          'might want to compare them — settings categories, side-by-side ' +
          'sections — rather than scan one at a time.',
      },
    },
  },
  render: () => (
    <Accordion type="multiple" className="w-[480px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Account</AccordionTrigger>
        <AccordionContent>
          Manage your profile, password, and authentication methods.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent>
          Configure email, push, and in-app notification preferences.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Billing</AccordionTrigger>
        <AccordionContent>
          Update your payment method, view invoices, and change plans.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Uncontrolled accordion seeded with `defaultValue` so the named ' +
          'item is open on first render. Use when the page should land on a ' +
          'specific section without forcing controlled state.',
      },
    },
  },
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-2"
      className="w-[480px]"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Section one</AccordionTrigger>
        <AccordionContent>Closed by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section two</AccordionTrigger>
        <AccordionContent>
          Opened by default via `defaultValue=&quot;item-2&quot;`.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section three</AccordionTrigger>
        <AccordionContent>Closed by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithRichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`AccordionContent` accepts arbitrary children. Demonstrates that ' +
          'content panels can hold paragraphs, lists, and call-to-action ' +
          'buttons — not just plain copy — for FAQ pages with embedded ' +
          'flows.',
      },
    },
  },
  render: () => (
    <Accordion type="single" collapsible className="w-[520px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What does the free plan include?</AccordionTrigger>
        <AccordionContent>
          <p className="mb-3">The free plan covers everything you need to evaluate the product:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Up to 3 projects</li>
            <li>500 MB of storage</li>
            <li>Community support</li>
          </ul>
          <Button variant="primary" size="sm">
            Start free trial
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I upgrade?</AccordionTrigger>
        <AccordionContent>
          <p className="mb-3">
            Open the billing settings and choose Pro or Team. Upgrades
            take effect immediately and we prorate the first invoice.
          </p>
          <Button variant="outline" size="sm">
            Open billing
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const InCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Realistic placement: an Accordion nested inside a Card — the ' +
          'standard FAQ block on a settings or marketing page. Verifies ' +
          'the two components compose without padding clashes.',
      },
    },
  },
  render: () => (
    <Card className="w-[520px]">
      <CardHeader>
        <CardTitle>Frequently asked questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>How is my data stored?</AccordionTrigger>
            <AccordionContent>
              All data is encrypted at rest and in transit. Backups are
              taken daily and retained for 30 days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I export my data?</AccordionTrigger>
            <AccordionContent>
              Yes — go to Settings → Data and choose CSV or JSON.
              Exports include every field visible in the UI.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Do you offer SSO?</AccordionTrigger>
            <AccordionContent>
              SAML 2.0 and OIDC are available on the Team plan.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  ),
};
