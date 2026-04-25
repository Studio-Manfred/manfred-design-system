import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavBar, NavItem } from './NavBar';

const meta: Meta<typeof NavBar> = {
  title: 'Components/NavBar',
  component: NavBar,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof NavBar>;

export const Default: Story = {
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
