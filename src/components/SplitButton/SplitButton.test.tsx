import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
  SplitButtonContent,
} from './SplitButton';

function Fixture({ onPlay = () => {} }: { onPlay?: () => void }) {
  return (
    <SplitButton variant="brand">
      <SplitButtonAction onClick={onPlay}>Play</SplitButtonAction>
      <SplitButtonTrigger aria-label="More options" />
      <SplitButtonContent>
        <p>Panel body</p>
      </SplitButtonContent>
    </SplitButton>
  );
}

describe('SplitButton', () => {
  it('renders both segments inside a group', () => {
    render(<Fixture />);
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More options' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('runs the action without opening the dropdown', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    render(<Fixture onPlay={onPlay} />);
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();
  });

  it('opens the dropdown from the chevron', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    render(<Fixture onPlay={onPlay} />);
    await user.click(screen.getByRole('button', { name: 'More options' }));
    await waitFor(() => expect(screen.getByText('Panel body')).toBeInTheDocument());
    expect(onPlay).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'More options' })).toHaveAttribute('aria-expanded', 'true');
  });
});
