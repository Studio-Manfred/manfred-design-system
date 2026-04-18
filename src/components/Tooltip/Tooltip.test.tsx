import { describe, it, expect } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';

function Fixture() {
  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Helpful text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe('Tooltip', () => {
  it('is hidden by default', () => {
    render(<Fixture />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('appears on trigger focus', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    expect(screen.getByText('Hover me')).toHaveFocus();
    await waitFor(() =>
      expect(screen.getAllByText('Helpful text').length).toBeGreaterThan(0),
    );
  });

  it('trigger has aria-describedby when open', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    await waitFor(() =>
      expect(screen.getByText('Hover me')).toHaveAttribute('aria-describedby'),
    );
  });

  it('disappears on blur', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    await waitFor(() =>
      expect(screen.getAllByText('Helpful text').length).toBeGreaterThan(0),
    );
    await act(async () => {
      (screen.getByText('Hover me') as HTMLElement).blur();
    });
    await waitFor(() =>
      expect(screen.queryByText('Helpful text', { selector: '[role="tooltip"]' })).not.toBeInTheDocument(),
    );
  });
});
