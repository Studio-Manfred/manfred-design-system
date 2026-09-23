import type * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('defaults to variant=primary and size=md', () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.className).toMatch(/bg-\[var\(--color-interactive-primary-bg\)\]/);
    expect(btn.className).toMatch(/h-10/);
  });

  it.each(['primary', 'brand', 'outline', 'ghost', 'inverse'] as const)(
    'applies %s variant classes',
    (variant) => {
      render(<Button variant={variant}>X</Button>);
      expect(screen.getByRole('button').className).toMatch(
        new RegExp(`var\\(--color-interactive-${variant}-|text-foreground`),
      );
    },
  );

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole('button', { name: 'Delete' });
    // Destructive uses the shadcn-contract --destructive / --destructive-foreground
    // tokens via named Tailwind utilities (not the bracketed [var(...)] pattern
    // the legacy variants use). Memory guards against phantom bracketed refs;
    // named utilities are the safer choice for contract tokens.
    expect(btn.className).toContain('bg-destructive');
    expect(btn.className).toContain('text-destructive-foreground');
    expect(btn.className).toContain('border-destructive');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies %s size', (size) => {
    render(<Button size={size}>X</Button>);
    const map = { sm: 'h-8', md: 'h-10', lg: 'h-12' };
    expect(screen.getByRole('button').className).toContain(map[size]);
  });

  it('fullWidth sets w-full', () => {
    render(<Button fullWidth>W</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });

  it('merges external className', () => {
    render(<Button className="extra-class">X</Button>);
    expect(screen.getByRole('button').className).toContain('extra-class');
  });

  it('disables and sets aria-busy while loading', () => {
    render(<Button isLoading>Saving</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<Button>Idle</Button>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('fires onClick when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tap</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Tap
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards ref to the button element', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>R</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('asChild renders the child element instead of a button', () => {
    render(
      <Button asChild>
        <a href="/target">Go</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/target');
  });

  describe('keyboard', () => {
    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('%s activates the focused button', async (_, key) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);
      await user.tab();
      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
      await user.keyboard(key);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('disabled and loading buttons are skipped by Tab', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
          <Button>Enabled</Button>
        </>,
      );
      await user.tab();
      expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();
    });

    it('asChild link is reachable by Tab and activates with Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
      render(
        <Button asChild>
          <a href="/docs" onClick={onClick}>
            Docs
          </a>
        </Button>,
      );
      await user.tab();
      expect(screen.getByRole('link', { name: 'Docs' })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
