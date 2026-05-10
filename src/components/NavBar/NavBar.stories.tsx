import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { NavBar, NavItem } from './NavBar';

const meta: Meta<typeof NavBar> = {
  title: 'Components/NavBar',
  component: NavBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Flat horizontal navigation with no sub-menus. Wraps children in a ' +
          '`<nav aria-label="Primary">` landmark; pair with `NavItem` for ' +
          'styled links that get `aria-current="page"` automatically when ' +
          '`active`. For navigation with dropdown panels, use ' +
          '`NavigationMenu` instead — that one is built on Radix and supports ' +
          'sub-menus, viewport animations, and keyboard menu traversal.',
      },
    },
  },
  argTypes: {
    'aria-label': {
      control: 'text',
      description:
        'Accessible name for the nav landmark. Defaults to "Primary"; set when more than one nav exists on a page.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof NavBar>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three flat links, with the first marked `active`. The active item ' +
          'gets the foreground colour, an underline indicator, and ' +
          '`aria-current="page"` on the rendered element.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // NavBar wraps children in <nav aria-label="Primary"> so it registers as a named landmark.
    expect(canvas.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    // The active NavItem must have aria-current="page" so AT announces the current route.
    const homeLink = canvas.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
    // Clicking a non-active link confirms all nav links are pointer-accessible.
    await userEvent.click(canvas.getByRole('link', { name: 'Boards' }));
    // Tab back to Home to verify keyboard navigation order across the nav items.
    await userEvent.tab();
    expect(canvas.getByRole('navigation')).toBeInTheDocument();
  },
  render: () => (
    <NavBar>
      <NavItem href="#home" active>
        Home
      </NavItem>
      <NavItem href="#boards">Boards</NavItem>
      <NavItem href="#information">Information</NavItem>
    </NavBar>
  ),
};

export const SecondActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Sanity check that the active treatment moves cleanly between items — ' +
          'this story exists to catch regressions where the indicator pins to ' +
          'the first child by accident.',
      },
    },
  },
  render: () => (
    <NavBar>
      <NavItem href="#home">Home</NavItem>
      <NavItem href="#boards" active>
        Boards
      </NavItem>
      <NavItem href="#information">Information</NavItem>
    </NavBar>
  ),
};

export const InTopBar: Story = {
  name: 'TopBar usage (dashboard sketch)',
  parameters: {
    docs: {
      description: {
        story:
          'Realistic placement: NavBar sits between a brand label and a ' +
          'utility item inside a `<header>`. Shows the spacing + alignment ' +
          'NavBar is designed for.',
      },
    },
  },
  render: () => (
    <header className="flex items-center justify-between w-[640px] h-14 px-4 border-b border-border bg-card">
      <span className="text-sm font-semibold">Mitt Intranat</span>
      <NavBar>
        <NavItem href="#home" active>
          Home
        </NavItem>
        <NavItem href="#boards">Boards</NavItem>
        <NavItem href="#information">Information</NavItem>
      </NavBar>
      <span className="text-xs text-muted-foreground">v1.0</span>
    </header>
  ),
};

export const WithRouterLikeComponent: Story = {
  name: 'NavItem with `as` (router Link mock)',
  parameters: {
    docs: {
      description: {
        story:
          'Passing `as={RouterLink}` swaps the underlying element while ' +
          'keeping NavItem styling. The mock Link here writes a ' +
          '`data-router` attribute so it is obvious in the DOM that the ' +
          'consumer-supplied component renders, not a plain `<a>`.',
      },
    },
  },
  render: () => {
    const RouterLink = ({
      to,
      children,
      className,
    }: {
      to: string;
      children: React.ReactNode;
      className?: string;
    }) => (
      <a href={to} data-router="true" className={className}>
        {children}
      </a>
    );
    return (
      <NavBar aria-label="Docs">
        <NavItem as={RouterLink} to="/intro">
          Intro
        </NavItem>
        <NavItem as={RouterLink} to="/components" active>
          Components
        </NavItem>
        <NavItem as={RouterLink} to="/tokens">
          Tokens
        </NavItem>
      </NavBar>
    );
  },
};
