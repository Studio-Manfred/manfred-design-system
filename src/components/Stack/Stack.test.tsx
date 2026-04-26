import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Stack, VStack, HStack } from './Stack';

describe('Stack', () => {
  it('renders flex-col by default', () => {
    const { container } = render(<Stack>x</Stack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/flex/);
    expect(el.className).toMatch(/flex-col/);
  });

  it('switches to flex-row when direction="horizontal"', () => {
    const { container } = render(<Stack direction="horizontal">x</Stack>);
    expect(container.firstElementChild!.className).toMatch(/flex-row/);
    expect(container.firstElementChild!.className).not.toMatch(/flex-col/);
  });

  it('applies the gap utility for the chosen scale step', () => {
    const { container } = render(<Stack gap={6}>x</Stack>);
    expect(container.firstElementChild!.className).toMatch(/\bgap-6\b/);
  });

  it('default gap is 4', () => {
    const { container } = render(<Stack>x</Stack>);
    expect(container.firstElementChild!.className).toMatch(/\bgap-4\b/);
  });

  it('respects align + justify', () => {
    const { container } = render(
      <Stack align="center" justify="between">
        x
      </Stack>,
    );
    const cn = container.firstElementChild!.className;
    expect(cn).toMatch(/items-center/);
    expect(cn).toMatch(/justify-between/);
  });

  it('opts into flex-wrap', () => {
    const { container } = render(<Stack wrap>x</Stack>);
    expect(container.firstElementChild!.className).toMatch(/flex-wrap/);
  });

  it('renders the chosen element via `as`', () => {
    const { container } = render(<Stack as="ul">x</Stack>);
    expect(container.firstElementChild!.tagName).toBe('UL');
  });

  it('as="nav" renders a nav landmark', () => {
    const { container } = render(
      <Stack as="nav" aria-label="Primary">
        x
      </Stack>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('NAV');
    expect(el).toHaveAttribute('aria-label', 'Primary');
  });

  it('forwards arbitrary HTML attributes to the rendered element', () => {
    const { container } = render(
      <Stack data-testid="stack-x" id="my-stack">
        x
      </Stack>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('id', 'my-stack');
    expect(el).toHaveAttribute('data-testid', 'stack-x');
  });

  it('does not leak the `as` prop onto the rendered element', () => {
    const { container } = render(<Stack as="section">x</Stack>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SECTION');
    expect(el).not.toHaveAttribute('as');
    expect(el).not.toHaveAttribute('direction');
    expect(el).not.toHaveAttribute('gap');
  });

  it('forwards ref to the root element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<Stack ref={ref}>x</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('fullWidth applies w-full', () => {
    const { container } = render(<Stack fullWidth>x</Stack>);
    expect(container.firstElementChild!.className).toMatch(/\bw-full\b/);
  });
});

describe('VStack', () => {
  it('is a Stack pre-bound to direction="vertical"', () => {
    const { container } = render(<VStack>x</VStack>);
    expect(container.firstElementChild!.className).toMatch(/flex-col/);
  });

  it('still accepts gap / align / justify / as', () => {
    const { container } = render(
      <VStack gap={2} align="center" as="section">
        x
      </VStack>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SECTION');
    expect(el.className).toMatch(/\bgap-2\b/);
    expect(el.className).toMatch(/items-center/);
  });
});

describe('HStack', () => {
  it('is a Stack pre-bound to direction="horizontal"', () => {
    const { container } = render(<HStack>x</HStack>);
    expect(container.firstElementChild!.className).toMatch(/flex-row/);
  });
});
