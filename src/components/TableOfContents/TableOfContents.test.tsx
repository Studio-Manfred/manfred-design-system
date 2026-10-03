import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TableOfContents, type TableOfContentsItem } from './TableOfContents';

const items: TableOfContentsItem[] = [
  { id: 'intro', label: 'Intro', level: 1 },
  { id: 'vision', label: 'Vision', level: 1 },
  { id: 'vision-why', label: 'Why', level: 2 },
  { id: 'mission', label: 'Mission', level: 1 },
];

/** Headings in the DOM with a controllable viewport top. */
function mountHeadings(tops: Record<string, number>) {
  const els = Object.keys(tops).map((id) => {
    const h = document.createElement('h2');
    h.id = id;
    h.tabIndex = -1;
    h.textContent = id;
    h.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
    document.body.appendChild(h);
    return h;
  });
  return {
    els,
    setTop(id: string, top: number) {
      tops[id] = top;
    },
    remove() {
      els.forEach((e) => e.remove());
    },
  };
}

type IOCallback = (entries: IntersectionObserverEntry[]) => void;
class MockIO {
  static instances: MockIO[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public cb: IOCallback,
    public options?: IntersectionObserverInit,
  ) {
    MockIO.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
  fire() {
    act(() => this.cb([]));
  }
}

const lastIO = () => MockIO.instances[MockIO.instances.length - 1];

describe('TableOfContents', () => {
  describe('structure + a11y', () => {
    it('is a nav labelled by its visible title (default "On this page")', () => {
      render(<TableOfContents items={items} activeId="intro" />);
      const nav = screen.getByRole('navigation', { name: 'On this page' });
      expect(nav).toBeInTheDocument();
      expect(screen.getByText('On this page').tagName).toBe('P');
    });

    it('accepts a custom label', () => {
      render(<TableOfContents items={items} label="Contents" activeId="intro" />);
      expect(screen.getByRole('navigation', { name: 'Contents' })).toBeInTheDocument();
    });

    it('renders one link per item pointing at #id', () => {
      render(<TableOfContents items={items} activeId="intro" />);
      expect(screen.getAllByRole('link')).toHaveLength(4);
      expect(screen.getByRole('link', { name: 'Why' })).toHaveAttribute('href', '#vision-why');
    });

    it('nests deeper levels in a list inside their parent item', () => {
      render(<TableOfContents items={items} activeId="intro" />);
      const why = screen.getByRole('link', { name: 'Why' });
      const parentLi = why.closest('ul')!.closest('li')!;
      expect(parentLi).toContainElement(screen.getByRole('link', { name: 'Vision' }));
    });

    it('treats levels as relative: a jump of two levels nests only one deeper', () => {
      render(
        <TableOfContents
          activeId="a"
          items={[
            { id: 'a', label: 'A', level: 1 },
            { id: 'b', label: 'B', level: 3 },
            { id: 'c', label: 'C', level: 2 },
          ]}
        />,
      );
      const b = screen.getByRole('link', { name: 'B' });
      const c = screen.getByRole('link', { name: 'C' });
      // B and C are siblings under A.
      expect(b.closest('ul')).toBe(c.closest('ul'));
      expect(b.closest('ul')!.closest('li')).toContainElement(screen.getByRole('link', { name: 'A' }));
    });

    it('a list that starts at level 2 renders at the top level', () => {
      render(
        <TableOfContents
          activeId="x"
          items={[
            { id: 'x', label: 'X', level: 2 },
            { id: 'y', label: 'Y', level: 2 },
          ]}
        />,
      );
      expect(screen.getByRole('link', { name: 'X' }).closest('ul')).toBe(
        screen.getByRole('link', { name: 'Y' }).closest('ul'),
      );
    });

    it('marks only the active link with aria-current="location"', () => {
      render(<TableOfContents items={items} activeId="vision-why" />);
      expect(screen.getByRole('link', { name: 'Why' })).toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('aria-current');
    });

    it('activeId={null} marks nothing as active', () => {
      render(<TableOfContents items={items} activeId={null} />);
      screen.getAllByRole('link').forEach((l) => expect(l).not.toHaveAttribute('aria-current'));
    });

    it('renders nothing when there are no items', () => {
      const { container } = render(<TableOfContents items={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('forwards className, extra props and ref to the nav', () => {
      const ref = { current: null as HTMLElement | null };
      render(<TableOfContents ref={ref} items={items} activeId="intro" className="sticky" data-testid="toc" />);
      const nav = screen.getByTestId('toc');
      expect(nav).toHaveClass('sticky');
      expect(ref.current).toBe(nav);
    });
  });

  describe('clicking a link', () => {
    let headings: ReturnType<typeof mountHeadings>;
    beforeEach(() => {
      headings = mountHeadings({ intro: 0, vision: 400, 'vision-why': 700, mission: 1200 });
    });
    afterEach(() => headings.remove());

    it('scrolls smoothly to the heading, focuses it and calls onNavigate', () => {
      const onNavigate = vi.fn();
      const target = document.getElementById('mission')!;
      const scroll = vi.spyOn(target, 'scrollIntoView');
      const focus = vi.spyOn(target, 'focus');
      render(<TableOfContents items={items} activeId="intro" onNavigate={onNavigate} />);
      const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Mission' }), { button: 0 });
      expect(notCancelled).toBe(false);
      expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(onNavigate).toHaveBeenCalledWith('mission');
    });

    it('jumps without animation when the user prefers reduced motion', () => {
      const original = window.matchMedia;
      window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
      const target = document.getElementById('vision')!;
      const scroll = vi.spyOn(target, 'scrollIntoView');
      render(<TableOfContents items={items} activeId="intro" />);
      fireEvent.click(screen.getByRole('link', { name: 'Vision' }), { button: 0 });
      expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
      window.matchMedia = original;
    });

    it('scrolls smoothly when matchMedia is unavailable', () => {
      const original = window.matchMedia;
      // @ts-expect-error simulate an environment without matchMedia
      window.matchMedia = undefined;
      const target = document.getElementById('vision')!;
      const scroll = vi.spyOn(target, 'scrollIntoView');
      render(<TableOfContents items={items} activeId="intro" />);
      fireEvent.click(screen.getByRole('link', { name: 'Vision' }), { button: 0 });
      expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      window.matchMedia = original;
    });

    it('in uncontrolled mode, marks the clicked link active right away', () => {
      render(<TableOfContents items={items} />);
      fireEvent.click(screen.getByRole('link', { name: 'Mission' }), { button: 0 });
      expect(screen.getByRole('link', { name: 'Mission' })).toHaveAttribute('aria-current', 'location');
    });

    it('in controlled mode, leaves the active link to the consumer', () => {
      render(<TableOfContents items={items} activeId="intro" />);
      fireEvent.click(screen.getByRole('link', { name: 'Mission' }), { button: 0 });
      expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('aria-current', 'location');
    });

    it.each([
      ['metaKey', { metaKey: true }],
      ['ctrlKey', { ctrlKey: true }],
      ['shiftKey', { shiftKey: true }],
      ['altKey', { altKey: true }],
      ['middle button', { button: 1 }],
    ])('leaves %s clicks to the browser', (_n, init) => {
      const onNavigate = vi.fn();
      render(<TableOfContents items={items} activeId="intro" onNavigate={onNavigate} />);
      const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Vision' }), { button: 0, ...init });
      expect(notCancelled).toBe(true);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('ignores clicks that were already default-prevented', () => {
      const onNavigate = vi.fn();
      render(
        <div onClickCapture={(e) => e.preventDefault()}>
          <TableOfContents items={items} activeId="intro" onNavigate={onNavigate} />
        </div>,
      );
      fireEvent.click(screen.getByRole('link', { name: 'Vision' }), { button: 0 });
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('falls back to the browser hash jump when the heading is missing', () => {
      const onNavigate = vi.fn();
      render(
        <TableOfContents
          items={[{ id: 'nowhere', label: 'Nowhere', level: 1 }]}
          activeId={null}
          onNavigate={onNavigate}
        />,
      );
      const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Nowhere' }), { button: 0 });
      expect(notCancelled).toBe(true);
      expect(onNavigate).toHaveBeenCalledWith('nowhere');
    });
  });

  describe('built-in tracking (IntersectionObserver)', () => {
    let headings: ReturnType<typeof mountHeadings>;
    const originalIO = globalThis.IntersectionObserver;
    beforeEach(() => {
      MockIO.instances = [];
      globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
      headings = mountHeadings({ intro: 0, vision: 400, 'vision-why': 700, mission: 1200 });
    });
    afterEach(() => {
      globalThis.IntersectionObserver = originalIO;
      headings.remove();
      vi.useRealTimers();
    });

    it('observes every heading, with the offset as a negative top root margin', () => {
      render(<TableOfContents items={items} offsetTop={64} />);
      const io = lastIO();
      expect(io.observed.map((e: Element) => e.id)).toEqual(['intro', 'vision', 'vision-why', 'mission']);
      expect(io.options?.rootMargin).toBe('-64px 0px 0px 0px');
    });

    it('starts on the last heading at or above the offset line', () => {
      headings.setTop('intro', -500);
      headings.setTop('vision', 10);
      headings.setTop('vision-why', 300);
      render(<TableOfContents items={items} offsetTop={16} />);
      expect(screen.getByRole('link', { name: 'Vision' })).toHaveAttribute('aria-current', 'location');
    });

    it('activates the first item when no heading has reached the line yet', () => {
      headings.setTop('intro', 200);
      render(<TableOfContents items={items} />);
      expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('aria-current', 'location');
    });

    it('follows the scroll position when the observer fires', () => {
      render(<TableOfContents items={items} />);
      headings.setTop('intro', -1000);
      headings.setTop('vision', -600);
      headings.setTop('vision-why', -1);
      headings.setTop('mission', 300);
      lastIO().fire();
      expect(screen.getByRole('link', { name: 'Why' })).toHaveAttribute('aria-current', 'location');
    });

    it('skips ids whose heading is not in the DOM', () => {
      render(
        <TableOfContents
          items={[...items, { id: 'ghost', label: 'Ghost', level: 1 }]}
        />,
      );
      expect(lastIO().observed).toHaveLength(4);
    });

    it('keeps the clicked section active while the click scroll is running', () => {
      vi.useFakeTimers();
      render(<TableOfContents items={items} />);
      fireEvent.click(screen.getByRole('link', { name: 'Mission' }), { button: 0 });
      // Mid-scroll the observer reports Vision crossing the line…
      headings.setTop('intro', -900);
      headings.setTop('vision', -10);
      lastIO().fire();
      // …but the clicked link stays active.
      expect(screen.getByRole('link', { name: 'Mission' })).toHaveAttribute('aria-current', 'location');
      // Once the scroll has settled, tracking resumes.
      act(() => {
        window.dispatchEvent(new Event('scrollend'));
        vi.advanceTimersByTime(100);
      });
      lastIO().fire();
      expect(screen.getByRole('link', { name: 'Vision' })).toHaveAttribute('aria-current', 'location');
    });

    it('resumes tracking after a timeout when no scrollend arrives', () => {
      vi.useFakeTimers();
      render(<TableOfContents items={items} />);
      fireEvent.click(screen.getByRole('link', { name: 'Mission' }), { button: 0 });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      headings.setTop('intro', -900);
      headings.setTop('vision', -10);
      lastIO().fire();
      expect(screen.getByRole('link', { name: 'Vision' })).toHaveAttribute('aria-current', 'location');
    });

    it('does not track in controlled mode', () => {
      render(<TableOfContents items={items} activeId="mission" />);
      expect(MockIO.instances).toHaveLength(0);
    });

    it('disconnects on unmount', () => {
      const { unmount } = render(<TableOfContents items={items} />);
      const io = lastIO();
      unmount();
      expect(io.disconnected).toBe(true);
    });

    it('does not crash and does not track without IntersectionObserver', () => {
      // @ts-expect-error simulate jsdom / old browsers
      globalThis.IntersectionObserver = undefined;
      render(<TableOfContents items={items} />);
      // No auto-tracking: nothing is active until the user clicks.
      screen.getAllByRole('link').forEach((l) => expect(l).not.toHaveAttribute('aria-current'));
      fireEvent.click(screen.getByRole('link', { name: 'Vision' }), { button: 0 });
      expect(screen.getByRole('link', { name: 'Vision' })).toHaveAttribute('aria-current', 'location');
    });
  });
});
