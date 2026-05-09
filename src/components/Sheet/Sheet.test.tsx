import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import type { SheetSide } from './Sheet';

interface FixtureProps {
  showCloseButton?: boolean;
  side?: SheetSide;
}

function Fixture({ showCloseButton, side }: FixtureProps) {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent showCloseButton={showCloseButton} side={side}>
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Body copy</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe('Sheet', () => {
  it('is closed by default', () => {
    render(<Fixture />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('SheetTitle is wired via aria-labelledby on the dialog', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    // The element pointed to by aria-labelledby should be the title node.
    const titleEl = document.getElementById(labelledBy as string);
    expect(titleEl?.textContent).toBe('Title');
  });

  it('SheetDescription is wired via aria-describedby on the dialog', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby');
  });

  it('SheetClose button closes the sheet', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape key closes the sheet', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('default X close button is rendered', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeInTheDocument();
  });

  it('showCloseButton=false suppresses the X button', async () => {
    const user = userEvent.setup();
    render(<Fixture showCloseButton={false} />);
    await user.click(screen.getByText('Open'));
    expect(screen.queryByRole('button', { name: 'Close sheet' })).not.toBeInTheDocument();
  });

  it('side="left" renders content with the left-edge positional class', async () => {
    const user = userEvent.setup();
    render(<Fixture side="left" />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toMatch(/left-0/);
    expect(dialog.className).toMatch(/border-r/);
  });

  it('side="right" (default) renders content with the right-edge positional class', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toMatch(/right-0/);
    expect(dialog.className).toMatch(/border-l/);
  });

  it('side="top" renders content with the top-edge positional class', async () => {
    const user = userEvent.setup();
    render(<Fixture side="top" />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toMatch(/top-0/);
    expect(dialog.className).toMatch(/border-b/);
  });

  it('side="bottom" renders content with the bottom-edge positional class', async () => {
    const user = userEvent.setup();
    render(<Fixture side="bottom" />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toMatch(/bottom-0/);
    expect(dialog.className).toMatch(/border-t/);
  });

  it('animation classes are gated behind motion-safe:', async () => {
    const user = userEvent.setup();
    render(<Fixture side="right" />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    // Every animate-in / slide-in class must be wrapped in motion-safe: so
    // prefers-reduced-motion users get no slide.
    expect(dialog.className).toMatch(/motion-safe:data-\[state=open\]:slide-in-from-right/);
    expect(dialog.className).toMatch(/motion-safe:data-\[state=open\]:animate-in/);
  });
});
