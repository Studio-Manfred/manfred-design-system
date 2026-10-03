import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Intro' },
  ];

  it('renders a nav with aria-label="Breadcrumb"', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders links for non-last items', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('marks last item with aria-current=page and not a link', () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText('Intro');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.tagName).toBe('SPAN');
  });

  it('slash separator uses "/" glyph', () => {
    render(<Breadcrumb items={items} separator="slash" />);
    const slashes = screen.getAllByText('/', { selector: 'span' });
    expect(slashes.length).toBeGreaterThanOrEqual(2);
  });

  it('chevron separator renders SVG', () => {
    const { container } = render(<Breadcrumb items={items} separator="chevron" />);
    // 2 separators × 1 svg each
    expect(container.querySelectorAll('li[aria-hidden="true"] svg').length).toBe(2);
  });

  it('non-link intermediate item renders as plain span (no href)', () => {
    const noHref = [{ label: 'A' }, { label: 'B' }];
    render(<Breadcrumb items={noHref} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  describe('onNavigate (STU-1021)', () => {
    it('calls onNavigate with the href and prevents the default on a plain left-click', () => {
      const onNavigate = vi.fn();
      render(<Breadcrumb items={items} onNavigate={onNavigate} />);
      const link = screen.getByRole('link', { name: 'Docs' });
      const notCancelled = fireEvent.click(link, { button: 0 });
      expect(notCancelled).toBe(false);
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/docs', expect.objectContaining({ type: 'click' }));
    });

    it.each([
      ['metaKey', { metaKey: true }],
      ['ctrlKey', { ctrlKey: true }],
      ['shiftKey', { shiftKey: true }],
      ['altKey', { altKey: true }],
      ['middle button', { button: 1 }],
    ])('leaves %s clicks to the browser', (_name, init) => {
      const onNavigate = vi.fn();
      render(<Breadcrumb items={items} onNavigate={onNavigate} />);
      const link = screen.getByRole('link', { name: 'Home' });
      const notCancelled = fireEvent.click(link, { button: 0, ...init });
      expect(notCancelled).toBe(true);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('does nothing when the click was already default-prevented', () => {
      const onNavigate = vi.fn();
      render(
        <div onClickCapture={(e) => e.preventDefault()}>
          <Breadcrumb items={items} onNavigate={onNavigate} />
        </div>,
      );
      fireEvent.click(screen.getByRole('link', { name: 'Home' }), { button: 0 });
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('keeps the real href so links stay openable in a new tab', () => {
      render(<Breadcrumb items={items} onNavigate={() => {}} />);
      expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    });

    it('without onNavigate, a plain click is not prevented (plain anchors)', () => {
      render(<Breadcrumb items={items} />);
      const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Home' }), { button: 0 });
      expect(notCancelled).toBe(true);
    });

    it('the current page is never a link, even with onNavigate', () => {
      render(
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Here', href: '/here' }]}
          onNavigate={() => {}}
        />,
      );
      expect(screen.queryByRole('link', { name: 'Here' })).not.toBeInTheDocument();
      expect(screen.getByText('Here')).toHaveAttribute('aria-current', 'page');
    });
  });
});
