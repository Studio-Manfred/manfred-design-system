import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Bordered surface for KPI cards, chart panels, filter sections — ' +
          'any dashboard or page region that needs a contained, padded ' +
          'container. Composes with `CardHeader`, `CardTitle`, ' +
          '`CardDescription`, `CardContent`, and `CardFooter`. Three padding ' +
          'scales (`sm` / `md` / `lg`), an `interactive` flag for clickable ' +
          'cards, and an `as` prop to render landmark elements ' +
          '(`article` / `section` / `aside`) when needed.',
      },
    },
  },
  argTypes: {
    padding: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Inner padding scale: `sm` 16px, `md` 24px (default), `lg` 32px.',
      table: { defaultValue: { summary: 'md' } },
    },
    as: {
      control: 'select',
      options: ['div', 'article', 'section', 'aside'],
      description:
        'Element to render as. Defaults to `div`. Pick `article` / ' +
        '`section` / `aside` when the card represents a landmark.',
      table: { defaultValue: { summary: 'div' } },
    },
    interactive: {
      control: 'boolean',
      description:
        'Add hover and focus styles for clickable cards. Caller still owns ' +
        '`tabIndex`, key handling, and ARIA — prefer wrapping in a ' +
        '`<button>` over `role="button"` on landmark elements.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Standard composition — header (title + description), content, and ' +
          'footer with a primary action. The most common shape for a content ' +
          'card.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The footer button must be reachable so users can activate the card's primary action.
    const actionBtn = canvas.getByRole('button', { name: 'Primary action' });
    expect(actionBtn).toBeInTheDocument();
    // Clicking the button confirms pointer events flow through the Card surface.
    await userEvent.click(actionBtn);
    expect(actionBtn).toBeInTheDocument();
  },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Brief supporting copy.</CardDescription>
      </CardHeader>
      <CardContent>
        Body content goes here. Reach for Card whenever you need a bordered
        surface for a panel, a KPI tile, or a filter section.
      </CardContent>
      <CardFooter>
        <Button variant="brand" size="sm">
          Primary action
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Paddings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All three padding scales side by side. `sm` for dense list cards, ' +
          '`md` for the standard surface, `lg` for hero panels and full-page ' +
          'cards.',
      },
    },
  },
  render: () => (
    <div className="flex items-start gap-4">
      <Card padding="sm" className="w-48">
        <CardTitle>Small</CardTitle>
        <CardContent>p-4</CardContent>
      </Card>
      <Card padding="md" className="w-48">
        <CardTitle>Medium</CardTitle>
        <CardContent>p-6 (default)</CardContent>
      </Card>
      <Card padding="lg" className="w-48">
        <CardTitle>Large</CardTitle>
        <CardContent>p-8</CardContent>
      </Card>
    </div>
  ),
};

export const InteractiveAsButton: Story = {
  name: 'Interactive (clickable card)',
  parameters: {
    docs: {
      description: {
        story:
          'Clickable card pattern. Uses `interactive` for hover / focus ring ' +
          'and a plain `<div>` (default `as`) with `role="button"`, ' +
          'tabIndex, and keyboard handling supplied by the caller. Prefer ' +
          'wrapping a Card in a `<button>` over `role="button"` when the ' +
          'card is rendered as a landmark element.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The Card surface itself is the interactive control — role="button" +
    // aria-label make it the named target, separate from any inner Button.
    // This is the contract the Default story can't cover; Default clicks an
    // inner Button, not the Card surface.
    const card = canvas.getByRole('button', { name: 'Open performance details' });
    expect(card).toBeInTheDocument();
    // tabIndex={0} makes the card keyboard-reachable. Focusing then asserting
    // covers the contract without relying on the surrounding tab order of the
    // Storybook iframe (which can vary between runs).
    card.focus();
    expect(card).toHaveFocus();
    // Click activates the caller-supplied onClick handler. The handler logs
    // to the console; the assertion here is that the click reaches the card
    // (no overlay or pointer-events:none regression in the interactive style).
    await userEvent.click(card);
    expect(card).toBeInTheDocument();
  },
  render: () => (
    // Plain div + role="button" — axe rejects role="button" overlaid on
    // landmark elements like <article>. For native semantics, wrap a Card
    // in a <button> instead.
    <Card
      interactive
      role="button"
      tabIndex={0}
      className="w-80"
      onClick={() => console.log('clicked')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('activated');
        }
      }}
      aria-label="Open performance details"
    >
      <CardTitle as="h3">Open rate</CardTitle>
      <CardDescription>Click to view details</CardDescription>
      <CardContent className="text-2xl font-semibold">68%</CardContent>
    </Card>
  ),
};

export const KpiTile: Story = {
  name: 'KPI tile (dashboard sketch)',
  parameters: {
    docs: {
      description: {
        story:
          'Realistic KPI tile — small description, large number, footer with ' +
          'a delta badge. Shows that `CardDescription` works above the ' +
          'title when the metric is the headline figure.',
      },
    },
  },
  render: () => (
    <Card padding="md" className="w-56">
      <CardHeader>
        <CardDescription>Conversion rate</CardDescription>
        <CardTitle as="h2" className="text-3xl">
          12.4%
        </CardTitle>
      </CardHeader>
      <CardFooter className="gap-2">
        <Badge variant="success" size="sm">
          +2.1pp
        </Badge>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </CardFooter>
    </Card>
  ),
};

export const ChartPanel: Story = {
  name: 'Chart panel (dashboard sketch)',
  parameters: {
    docs: {
      description: {
        story:
          'Chart panel rendered as `<section>` with `aria-labelledby` linking ' +
          'to the title — the standard landmark pattern for dashboard ' +
          'sections, so each panel is named in the screen-reader landmark ' +
          'list.',
      },
    },
  },
  render: () => (
    <Card as="section" padding="lg" className="w-[480px]" aria-labelledby="chart-title">
      <CardHeader>
        <CardTitle id="chart-title" as="h2">
          Lane breakdown
        </CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          (donut chart placeholder)
        </div>
      </CardContent>
    </Card>
  ),
};

export const FilterPanel: Story = {
  name: 'Filter panel (dashboard sketch)',
  parameters: {
    docs: {
      description: {
        story:
          'Sidebar filter panel rendered as `<aside>` with `aria-label` — the ' +
          'standard landmark for complementary controls. Demonstrates Card ' +
          'as a navigation-adjacent surface, not just a content tile.',
      },
    },
  },
  render: () => (
    <Card as="aside" padding="md" className="w-72" aria-label="Filters">
      <CardTitle as="h3">Filters</CardTitle>
      <CardContent className="space-y-2 text-sm">
        <div>Lane: All</div>
        <div>Role title: Any</div>
        <div>Source: Any</div>
      </CardContent>
    </Card>
  ),
};
