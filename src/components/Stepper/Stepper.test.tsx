import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper, type StepperStep } from './Stepper';

const STEPS: StepperStep[] = [
  { label: 'Dates', status: 'complete' },
  { label: 'Times', status: 'current', description: 'Pick slots' },
  { label: 'Share', status: 'upcoming' },
];

describe('Stepper', () => {
  it('renders a nav landmark with the default "Progress" label', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(<Stepper steps={STEPS} aria-label="Checkout progress" />);
    expect(
      screen.getByRole('navigation', { name: 'Checkout progress' }),
    ).toBeInTheDocument();
  });

  it('renders every step label', () => {
    render(<Stepper steps={STEPS} />);
    for (const { label } of STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders an optional description under the label', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByText('Pick slots')).toBeInTheDocument();
  });

  it('announces position for screen readers', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
  });

  it('marks only the current step with aria-current="step"', () => {
    render(<Stepper steps={STEPS} />);
    const items = screen.getAllByRole('listitem');
    const current = items.filter((li) => li.getAttribute('aria-current') === 'step');
    expect(current).toHaveLength(1);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
  });

  it('shows an icon for complete steps and a number for current/upcoming', () => {
    render(<Stepper steps={STEPS} />);
    const items = screen.getAllByRole('listitem');
    // complete step: no visible index number, has an svg icon
    expect(within(items[0]).queryByText('1')).toBeNull();
    expect(items[0].querySelector('svg')).toBeTruthy();
    // current step: shows its number
    expect(within(items[1]).getByText('2')).toBeInTheDocument();
  });

  it('renders an error step with an icon and an sr-only "error" announcement', () => {
    render(
      <Stepper
        steps={[
          { label: 'Dates', status: 'complete' },
          { label: 'Times', status: 'error' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[1].querySelector('svg')).toBeTruthy();
    expect(within(items[1]).getByText(/, error/)).toBeInTheDocument();
  });

  it('renders no buttons when onStepClick is not provided', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders eligible steps as buttons and fires onStepClick with index + step', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} onStepClick={onStepClick} />);
    await user.click(screen.getByRole('button', { name: /Dates/ }));
    expect(onStepClick).toHaveBeenCalledWith(0, expect.objectContaining({ label: 'Dates' }));
  });

  it('does not render upcoming steps as buttons (cannot jump ahead)', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} onStepClick={onStepClick} />);
    expect(screen.queryByRole('button', { name: /Share/ })).toBeNull();
  });

  it('does not render disabled steps as buttons', () => {
    const onStepClick = vi.fn();
    render(
      <Stepper
        steps={[{ label: 'Dates', status: 'complete', disabled: true }]}
        onStepClick={onStepClick}
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the vertical orientation with positioned connectors', () => {
    const { container } = render(<Stepper steps={STEPS} orientation="vertical" />);
    expect(container.querySelector('ol')?.className).toContain('flex-col');
    const items = container.querySelectorAll('li');
    // vertical list items are position:relative so the absolute connector anchors to them
    expect(items[0].className).toContain('relative');
    // a decorative connector span is rendered between steps (not after the last)
    expect(container.querySelector('span[aria-hidden="true"].absolute')).toBeTruthy();
  });

  it('merges an external className onto the nav', () => {
    render(<Stepper steps={STEPS} className="custom-x" />);
    expect(screen.getByRole('navigation').className).toContain('custom-x');
  });
});
