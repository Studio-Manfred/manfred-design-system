import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('renders one <kbd> per key', () => {
    const { container } = render(<Kbd keys={['⌘', 'K']} />);
    const chips = container.querySelectorAll('kbd');
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent('⌘');
    expect(chips[1]).toHaveTextContent('K');
  });

  it('renders a separator between keys but not before the first', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'Shift', 'P']} />);
    expect(container.textContent).toBe('Ctrl+Shift+P');
  });

  it('is aria-hidden by default (decorative)', () => {
    const { container } = render(<Kbd keys={['⌘', 'K']} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes itself to assistive tech when aria-hidden is explicitly false', () => {
    const { container } = render(<Kbd keys={['⌘', 'K']} aria-hidden={false} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'false');
  });

  it('renders a single key without separator', () => {
    const { container } = render(<Kbd keys={['Esc']} />);
    expect(container.textContent).toBe('Esc');
    expect(container.querySelectorAll('kbd')).toHaveLength(1);
  });

  it('accepts a custom separator', () => {
    const { container } = render(<Kbd keys={['⌘', 'K']} separator="•" />);
    expect(container.textContent).toBe('⌘•K');
  });

  it('accepts size="md"', () => {
    render(<Kbd keys={['⌘']} size="md" data-testid="kbd" />);
    expect(screen.getByTestId('kbd')).toBeInTheDocument();
  });
});
