import type { Meta, StoryObj } from '@storybook/react-vite';
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
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

/**
 * Single mode: only one item open at a time. `collapsible` lets the
 * user close the open item by clicking it again.
 */
export const Single: Story = {
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
};

/**
 * Multiple mode: any number of items can be open at the same time.
 */
export const Multiple: Story = {
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

/**
 * Single mode with `defaultValue` set so item 2 is open on first render.
 */
export const DefaultOpen: Story = {
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

/**
 * Items can contain rich content — paragraphs, lists, buttons —
 * not just a string.
 */
export const WithRichContent: Story = {
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

/**
 * Realistic placement: Accordion inside a Card, e.g. an FAQ block on a
 * settings or marketing page.
 */
export const InCard: Story = {
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
