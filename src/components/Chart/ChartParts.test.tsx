import * as React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, renderHook, screen, act, waitFor, within } from '@testing-library/react';
import { BarChart as RechartsBarChart, Bar, XAxis } from 'recharts';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { DonutChart } from './DonutChart';
import {
  ChartContainer,
  useChartContainer,
  usePrefersReducedMotion,
} from './ChartContainer';
import { ChartTooltip, ChartTooltipContent } from './ChartTooltip';

// Same jsdom sizing shim as Chart.test.tsx so Recharts renders its svg layers.
const RC_WIDTH = 600;
const RC_HEIGHT = 240;

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(
  matches: boolean,
  { legacyOnly = false }: { legacyOnly?: boolean } = {},
) {
  const listeners = new Set<Listener>();
  const mq: Record<string, unknown> = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn((l: Listener) => listeners.add(l)),
    removeListener: vi.fn((l: Listener) => listeners.delete(l)),
    dispatchEvent: vi.fn(),
  };
  if (!legacyOnly) {
    mq.addEventListener = vi.fn((_: string, l: Listener) => listeners.add(l));
    mq.removeEventListener = vi.fn((_: string, l: Listener) => listeners.delete(l));
  }
  const matchMedia = vi.fn(() => mq);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMedia,
  });
  return {
    mq,
    listeners,
    emit(next: boolean) {
      listeners.forEach((l) => l({ matches: next }));
    },
  };
}

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return RC_WIDTH;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return RC_HEIGHT;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return { width: RC_WIDTH, height: RC_HEIGHT, top: 0, left: 0, right: RC_WIDTH, bottom: RC_HEIGHT, x: 0, y: 0, toJSON() {} };
    },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: originalMatchMedia,
  });
  vi.restoreAllMocks();
});

describe('ChartTooltipContent', () => {
  const payload = [
    { name: 'Revenue', value: 18, color: 'var(--chart-1)', dataKey: 'revenue' },
    { name: 'Costs', value: 9, color: 'var(--chart-2)', dataKey: 'costs' },
  ];

  it('renders nothing when the tooltip is not active', () => {
    const { container } = render(
      <ChartTooltipContent active={false} payload={payload} label="Feb" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when active but the payload is missing or empty', () => {
    const { container, rerender } = render(<ChartTooltipContent active label="Feb" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ChartTooltipContent active payload={[]} label="Feb" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the category label and one row per series with name, value and swatch colour', () => {
    render(<ChartTooltipContent active payload={payload} label="Feb" />);
    expect(screen.getByText('Feb')).toBeInTheDocument();

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Revenue')).toBeInTheDocument();
    expect(within(rows[0]).getByText('18')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Costs')).toBeInTheDocument();
    expect(within(rows[1]).getByText('9')).toBeInTheDocument();

    const swatches = rows.map(
      (row) => row.querySelector('[aria-hidden="true"]') as HTMLElement,
    );
    expect(swatches.map((s) => s.style.backgroundColor)).toEqual([
      'var(--chart-1)',
      'var(--chart-2)',
    ]);
  });

  it('omits the label heading when no label is given but still renders a numeric 0 label', () => {
    const { container, rerender } = render(
      <ChartTooltipContent active payload={payload} />,
    );
    // Only the series rows' text — no heading above the list.
    expect(container.firstElementChild?.firstElementChild?.tagName).toBe('UL');

    rerender(<ChartTooltipContent active payload={payload} label={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('falls back to dataKey when a payload entry has no name', () => {
    render(
      <ChartTooltipContent
        active
        payload={[{ dataKey: 'visits', value: 42, color: 'var(--chart-1)' }]}
      />,
    );
    expect(screen.getByText('visits')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders an empty series name (never "undefined") when neither name nor dataKey is set', () => {
    render(<ChartTooltipContent active payload={[{ value: 7 }]} />);
    const row = screen.getByRole('listitem');
    expect(row).toHaveTextContent(/^7$/);
    expect(row).not.toHaveTextContent('undefined');
  });

  it('passes each value and series name through valueFormatter', () => {
    const valueFormatter = vi.fn((v: number | string | undefined) => `${v} kr`);
    render(
      <ChartTooltipContent
        active
        payload={payload}
        label="Feb"
        valueFormatter={valueFormatter}
      />,
    );
    expect(valueFormatter).toHaveBeenCalledWith(18, 'Revenue');
    expect(valueFormatter).toHaveBeenCalledWith(9, 'Costs');
    expect(screen.getByText('18 kr')).toBeInTheDocument();
    expect(screen.getByText('9 kr')).toBeInTheDocument();
  });
});

describe('ChartTooltip (inside a Recharts chart)', () => {
  const rows = [
    { month: 'Jan', visits: 100 },
    { month: 'Feb', visits: 250 },
  ];

  it('renders the token-styled content for the active point with valueFormatter applied', async () => {
    render(
      <RechartsBarChart width={RC_WIDTH} height={RC_HEIGHT} data={rows}>
        <XAxis dataKey="month" />
        <Bar dataKey="visits" name="Visits" fill="var(--chart-1)" isAnimationActive={false} />
        <ChartTooltip
          active
          defaultIndex={1}
          valueFormatter={(v) => `${v} visits`}
        />
      </RechartsBarChart>,
    );
    expect(await screen.findByText('250 visits')).toBeInTheDocument();
    expect(screen.getByText('Visits')).toBeInTheDocument();
    expect(screen.getAllByText('Feb').length).toBeGreaterThan(0);
  });

  it('uses a consumer-supplied content renderer instead of the default body', async () => {
    render(
      <RechartsBarChart width={RC_WIDTH} height={RC_HEIGHT} data={rows}>
        <XAxis dataKey="month" />
        <Bar dataKey="visits" name="Visits" isAnimationActive={false} />
        <ChartTooltip
          active
          defaultIndex={0}
          valueFormatter={(v) => `${v} visits`}
          content={() => <div>custom tooltip</div>}
        />
      </RechartsBarChart>,
    );
    expect(await screen.findByText('custom tooltip')).toBeInTheDocument();
    expect(screen.queryByText('100 visits')).not.toBeInTheDocument();
  });
});

describe('ChartContainer accessible name and description', () => {
  const Plot = () => <svg />;

  it('falls back to "Chart" when there is neither data nor series', () => {
    render(
      <ChartContainer>
        <Plot />
      </ChartContainer>,
    );
    expect(screen.getByRole('img', { name: 'Chart' })).toBeInTheDocument();
  });

  it('uses the singular "category" for one row and omits the series count for a single series', () => {
    render(
      <ChartContainer data={[{ x: 'a', y: 1 }]} series={[{ key: 'y', name: 'Y' }]} categoryKey="x">
        <Plot />
      </ChartContainer>,
    );
    expect(screen.getByRole('img', { name: 'Chart with 1 category' })).toBeInTheDocument();
  });

  it('uses the singular "category" in the multi-series label too', () => {
    render(
      <ChartContainer
        data={[{ x: 'a', y: 1, z: 2 }]}
        series={[
          { key: 'y', name: 'Y' },
          { key: 'z', name: 'Z' },
        ]}
        categoryKey="x"
      >
        <Plot />
      </ChartContainer>,
    );
    expect(
      screen.getByRole('img', { name: 'Chart with 2 series across 1 category' }),
    ).toBeInTheDocument();
  });

  it('links ariaDescription via aria-describedby and appends it to the table caption', () => {
    render(
      <ChartContainer
        ariaLabel="Sales"
        ariaDescription="Revenue peaks in April"
        data={[{ x: 'Apr', y: 22 }]}
        series={[{ key: 'y', name: 'Revenue' }]}
        categoryKey="x"
      >
        <Plot />
      </ChartContainer>,
    );
    const img = screen.getByRole('img', { name: 'Sales' });
    expect(img).toHaveAccessibleDescription('Revenue peaks in April');
    expect(screen.getByRole('table', { name: 'Sales. Revenue peaks in April' })).toBeInTheDocument();
  });

  it('has no aria-describedby when no description is given', () => {
    render(
      <ChartContainer ariaLabel="Sales">
        <Plot />
      </ChartContainer>,
    );
    expect(screen.getByRole('img')).not.toHaveAttribute('aria-describedby');
  });
});

describe('ChartContainer fallback table', () => {
  const Plot = () => <svg />;

  it('is not rendered without a categoryKey or series', () => {
    const { rerender } = render(
      <ChartContainer data={[{ x: 'a', y: 1 }]} series={[{ key: 'y', name: 'Y' }]}>
        <Plot />
      </ChartContainer>,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    rerender(
      <ChartContainer data={[{ x: 'a', y: 1 }]} series={[]} categoryKey="x">
        <Plot />
      </ChartContainer>,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('formats cells: empty for null/undefined, booleans as text, objects as JSON', () => {
    render(
      <ChartContainer
        data={[
          { x: 'a', n: null, u: undefined, b: true, o: { hi: 1 } },
        ]}
        series={[
          { key: 'n', name: 'N' },
          { key: 'u', name: 'U' },
          { key: 'b', name: 'B' },
          { key: 'o', name: 'O' },
        ]}
        categoryKey="x"
      >
        <Plot />
      </ChartContainer>,
    );
    const cells = screen.getAllByRole('cell').map((c) => c.textContent);
    expect(cells).toEqual(['', '', 'true', '{"hi":1}']);
  });

  it('renders an empty cell for values that cannot be serialised', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    render(
      <ChartContainer
        data={[{ x: 'a', c: circular }]}
        series={[{ key: 'c', name: 'C' }]}
        categoryKey="x"
      >
        <Plot />
      </ChartContainer>,
    );
    expect(screen.getByRole('cell')).toHaveTextContent('');
  });

  it('is visually hidden by default and visible with showFallbackTable', () => {
    const props = {
      data: [{ x: 'a', y: 1 }],
      series: [{ key: 'y', name: 'Y' }],
      categoryKey: 'x',
    };
    const { rerender } = render(
      <ChartContainer {...props}>
        <Plot />
      </ChartContainer>,
    );
    // sr-only IS the contract: present for AT, hidden visually.
    expect(screen.getByRole('table')).toHaveClass('sr-only');

    rerender(
      <ChartContainer {...props} showFallbackTable>
        <Plot />
      </ChartContainer>,
    );
    expect(screen.getByRole('table')).not.toHaveClass('sr-only');
    expect(screen.getByRole('columnheader', { name: 'x' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'a' })).toBeInTheDocument();
  });

  it('forwards the ref and extra div attributes to the role="img" element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ChartContainer ref={ref} id="kpi" className="my-chart">
        <Plot />
      </ChartContainer>,
    );
    const img = screen.getByRole('img');
    expect(ref.current).toBe(img);
    expect(img).toHaveAttribute('id', 'kpi');
    expect(img).toHaveClass('my-chart');
  });
});

describe('useChartContainer', () => {
  const Probe = () => {
    const { reducedMotion } = useChartContainer();
    return <span>{reducedMotion ? 'reduced' : 'full'}</span>;
  };

  it('defaults to full motion outside a ChartContainer', () => {
    render(<Probe />);
    expect(screen.getByText('full')).toBeInTheDocument();
  });
});

describe('usePrefersReducedMotion', () => {
  it('reads the prefers-reduced-motion media query on mount', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes and unsubscribes on unmount', () => {
    const mm = mockMatchMedia(false);
    const { result, unmount } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => mm.emit(true));
    expect(result.current).toBe(true);

    unmount();
    expect(mm.listeners.size).toBe(0);
    expect(mm.mq.removeEventListener).toHaveBeenCalled();
  });

  it('falls back to addListener/removeListener on older browsers', () => {
    const mm = mockMatchMedia(false, { legacyOnly: true });
    const { result, unmount } = renderHook(() => usePrefersReducedMotion());
    expect(mm.mq.addListener).toHaveBeenCalled();

    act(() => mm.emit(true));
    expect(result.current).toBe(true);

    unmount();
    expect(mm.mq.removeListener).toHaveBeenCalled();
    expect(mm.listeners.size).toBe(0);
  });

  it('lets forceReducedMotion override the OS preference either way', () => {
    mockMatchMedia(true);
    expect(renderHook(() => usePrefersReducedMotion(false)).result.current).toBe(false);
    mockMatchMedia(false);
    expect(renderHook(() => usePrefersReducedMotion(true)).result.current).toBe(true);
  });

  it('returns false without throwing when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe('chart tooltip / legend toggles', () => {
  const data = [
    { m: 'Jan', a: 1, b: 2 },
    { m: 'Feb', a: 3, b: 4 },
  ];
  const one = [{ key: 'a', name: 'Alpha' }];
  const two = [
    { key: 'a', name: 'Alpha' },
    { key: 'b', name: 'Beta' },
  ];
  const legend = (c: HTMLElement) => c.querySelector('.recharts-legend-wrapper');
  const tooltip = (c: HTMLElement) => c.querySelector('.recharts-tooltip-wrapper');

  it.each([
    ['BarChart', BarChart],
    ['LineChart', LineChart],
  ] as const)('%s shows a legend only for multiple series unless showLegend overrides it', async (_, Chart) => {
    const { container, rerender } = render(<Chart data={data} series={two} categoryKey="m" />);
    await waitFor(() => expect(legend(container)).toBeInTheDocument());

    rerender(<Chart data={data} series={one} categoryKey="m" />);
    await waitFor(() => expect(legend(container)).not.toBeInTheDocument());

    rerender(<Chart data={data} series={one} categoryKey="m" showLegend />);
    await waitFor(() => expect(legend(container)).toBeInTheDocument());

    rerender(<Chart data={data} series={two} categoryKey="m" showLegend={false} />);
    await waitFor(() => expect(legend(container)).not.toBeInTheDocument());
  });

  it.each([
    ['BarChart', BarChart],
    ['LineChart', LineChart],
  ] as const)('%s mounts a tooltip by default and none with showTooltip={false}', async (_, Chart) => {
    const { container, rerender } = render(<Chart data={data} series={one} categoryKey="m" />);
    await waitFor(() => expect(tooltip(container)).toBeInTheDocument());

    rerender(<Chart data={data} series={one} categoryKey="m" showTooltip={false} />);
    await waitFor(() => expect(tooltip(container)).not.toBeInTheDocument());
  });
});

describe('DonutChart options', () => {
  const data = [
    { lane: 'Design', share: 40 },
    { lane: 'Code', share: 60 },
  ];
  const series = [{ key: 'share', name: 'Share' }];

  it('throws a descriptive error when no series is given', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<DonutChart data={data} series={[]} categoryKey="lane" />),
    ).toThrow('DonutChart requires at least one series describing the value field.');
  });

  it('shows legend and tooltip by default and hides them when turned off', async () => {
    const { container, rerender } = render(
      <DonutChart data={data} series={series} categoryKey="lane" />,
    );
    await waitFor(() => {
      expect(container.querySelector('.recharts-legend-wrapper')).toBeInTheDocument();
      expect(container.querySelector('.recharts-tooltip-wrapper')).toBeInTheDocument();
    });

    rerender(
      <DonutChart
        data={data}
        series={series}
        categoryKey="lane"
        showLegend={false}
        showTooltip={false}
      />,
    );
    await waitFor(() => {
      expect(container.querySelector('.recharts-legend-wrapper')).not.toBeInTheDocument();
      expect(container.querySelector('.recharts-tooltip-wrapper')).not.toBeInTheDocument();
    });
  });

  it('lists every slice in the screen-reader table', () => {
    render(<DonutChart data={data} series={series} categoryKey="lane" ariaLabel="Mix" />);
    expect(screen.getByRole('img', { name: 'Mix' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Design' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '60' })).toBeInTheDocument();
  });
});
