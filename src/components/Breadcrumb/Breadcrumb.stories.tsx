import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, fn, waitFor } from 'storybook/test';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hierarchical wayfinding trail — shows the user\'s position in a ' +
          'nested page structure and links back to ancestors. Renders a ' +
          '`<nav aria-label="Breadcrumb">` containing an ordered list. The ' +
          'last item is treated as the current page (`aria-current="page"`, ' +
          'no link). Separators are decorative and `aria-hidden`.',
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Ordered list of entries from root to current page. Last item is ' +
        'rendered as the current page and gets `aria-current="page"`.',
    },
    separator: {
      control: 'select',
      options: ['chevron', 'slash'],
      description:
        'Visual divider. `chevron` (default) for typical app shells; ' +
        '`slash` for a denser, text-only treatment.',
      table: { defaultValue: { summary: 'chevron' } },
    },
    onNavigate: {
      control: false,
      description:
        '`(href, event) => void`. Client-side navigation for single-page ' +
        'apps: on a plain left-click the crumb calls `preventDefault()` and ' +
        'then `onNavigate(href, event)` — e.g. `(href) => navigate(href)` ' +
        "with react-router's `useNavigate()`. Cmd / Ctrl / Shift / Alt and " +
        'middle-clicks are left to the browser, and crumbs stay real ' +
        '`<a href>` links. Omit for plain links (full page navigation).',
      table: { type: { summary: '(href: string, event: React.MouseEvent<HTMLAnchorElement>) => void' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {
  args: {
    separator: 'chevron',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Shoes' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Standard three-level trail. The first two items link back to ' +
          'ancestor pages; the last (current page) is rendered as bold text ' +
          'with `aria-current="page"`.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Breadcrumb wraps in <nav aria-label="Breadcrumb"> so it appears as a named navigation landmark.
    expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    // Verify the first ancestor link is reachable. Avoid userEvent.click on
    // the anchor: clicking <a href="#"> changes the iframe URL hash and
    // aborts vitest browser-mode with `[birpc] rpc is closed`.
    const homeLink = canvas.getByRole('link', { name: 'Home' });
    // Hover exercises pointer reachability without firing the anchor's
    // navigation handler.
    await userEvent.hover(homeLink);
    homeLink.focus();
    expect(homeLink).toHaveFocus();
    // Tab to the next breadcrumb link to confirm keyboard navigation order.
    await userEvent.tab();
    // The current page item carries aria-current="page" so AT announces which crumb is active.
    const currentItem = canvas.getByText('Shoes');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  },
};

export const WithSlashSeparator: Story = {
  args: {
    separator: 'slash',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Design Systems' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Slash separator — denser, text-only divider. Useful in compact ' +
          'headers or content surfaces where the chevron icon feels heavy.',
      },
    },
  },
};

export const LongPath: Story = {
  args: {
    separator: 'chevron',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Dashboard', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Account', href: '#' },
      { label: 'Security' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Five-level path. Stress-tests the wrap behaviour at narrow ' +
          'viewports — the list uses `flex-wrap` so deep trails reflow onto ' +
          'multiple rows instead of overflowing horizontally.',
      },
    },
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Home' }],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Edge case: a single-item trail. The lone item is the current page, ' +
          'so it renders as bold text with `aria-current="page"` — no ' +
          'separator, no link.',
      },
    },
  },
};

export const ClientSideNavigation: Story = {
  args: {
    items: [
      { label: 'Handbook', href: '/info' },
      { label: 'Company', href: '/info/company' },
      { label: 'Vision and mission' },
    ],
    onNavigate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Single-page app usage. Pass `onNavigate` and route with your ' +
          "router — with react-router: `const navigate = useNavigate();` then " +
          '`<Breadcrumb items={items} onNavigate={(href) => navigate(href)} />`. ' +
          'A plain left-click (or Enter on a focused crumb) is intercepted and ' +
          'handed to `onNavigate`; Cmd / Ctrl / Shift-click and middle-click ' +
          'still open new tabs and windows like any link. No router ' +
          'dependency in the design system.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // The trail is still a named navigation landmark.
    expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    const company = canvas.getByRole('link', { name: 'Company' });
    // Crumbs stay real links with an href, so new-tab and copy-link keep working.
    expect(company).toHaveAttribute('href', '/info/company');
    // A plain click is safe here: onNavigate prevents the default navigation.
    await userEvent.click(company);
    // The click is routed through onNavigate with the crumb's href.
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledWith('/info/company', expect.anything()));
    // Keyboard: focus the first crumb, Tab to the second, Enter activates it.
    const handbook = canvas.getByRole('link', { name: 'Handbook' });
    handbook.focus();
    await waitFor(() => expect(handbook).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(company).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    // Enter fires a plain click on the anchor, which onNavigate handles too.
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledTimes(2));
    // The current page is not a link and carries aria-current="page".
    expect(canvas.getByText('Vision and mission')).toHaveAttribute('aria-current', 'page');
    expect(canvas.queryByRole('link', { name: 'Vision and mission' })).not.toBeInTheDocument();
  },
};
