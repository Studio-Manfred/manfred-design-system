import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

function Triple({
  variant,
  onValueChange,
}: {
  variant?: 'segmented' | 'underline';
  onValueChange?: (v: string) => void;
}) {
  return (
    <Tabs defaultValue="board" variant={variant} onValueChange={onValueChange}>
      <TabsList aria-label="View">
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
      </TabsList>
      <TabsContent value="board">Board content</TabsContent>
      <TabsContent value="dashboard">Dashboard content</TabsContent>
      <TabsContent value="list">List content</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders three triggers under role="tablist"', () => {
    render(<Triple />);
    const list = screen.getByRole('tablist', { name: 'View' });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('shows the default panel and hides the others', () => {
    render(<Triple />);
    expect(screen.getByText('Board content')).toBeVisible();
    expect(screen.queryByText('Dashboard content')).toBeNull();
  });

  it('marks the active tab with aria-selected and data-state', () => {
    render(<Triple />);
    const board = screen.getByRole('tab', { name: 'Board' });
    expect(board).toHaveAttribute('aria-selected', 'true');
    expect(board).toHaveAttribute('data-state', 'active');
  });

  it('arrow-key navigation moves focus and selection (roving tabindex)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Triple onValueChange={onValueChange} />);
    const board = screen.getByRole('tab', { name: 'Board' });
    board.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Dashboard' })).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith('dashboard');
  });

  it('Home jumps to the first tab, End to the last', async () => {
    const user = userEvent.setup();
    render(<Triple />);
    screen.getByRole('tab', { name: 'Dashboard' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'List' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Board' })).toHaveFocus();
  });

  it('clicking a tab updates aria-selected and shows the panel', async () => {
    const user = userEvent.setup();
    render(<Triple />);
    await user.click(screen.getByRole('tab', { name: 'Dashboard' }));
    expect(screen.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Dashboard content')).toBeVisible();
  });

  it('emits data-variant and data-size on the root', () => {
    const { container } = render(<Triple variant="underline" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'underline');
    expect(root).toHaveAttribute('data-size', 'md');
  });

  it('underline variant applies the border style on the active trigger', () => {
    render(<Triple variant="underline" />);
    const board = screen.getByRole('tab', { name: 'Board' });
    expect(board.className).toMatch(/data-\[state=active\]:border-foreground/);
  });

  it('aria-controls on each trigger points to the matching panel', () => {
    render(<Triple />);
    const board = screen.getByRole('tab', { name: 'Board' });
    const controls = board.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).not.toBeNull();
  });
});
