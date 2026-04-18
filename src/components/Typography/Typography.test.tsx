import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  it.each([
    ['headline1', 'H1'],
    ['headline2', 'H2'],
    ['headline3', 'H3'],
    ['headline4', 'H4'],
  ] as const)('%s renders as %s by default', (variant, tag) => {
    render(<Typography variant={variant}>Hi</Typography>);
    expect(screen.getByText('Hi').tagName).toBe(tag);
  });

  it.each(['large', 'body', 'bodySmall'] as const)('%s renders as P by default', (variant) => {
    render(<Typography variant={variant}>Hi</Typography>);
    expect(screen.getByText('Hi').tagName).toBe('P');
  });

  it.each(['label', 'caption'] as const)('%s renders as SPAN by default', (variant) => {
    render(<Typography variant={variant}>Hi</Typography>);
    expect(screen.getByText('Hi').tagName).toBe('SPAN');
  });

  it('respects the `as` prop override', () => {
    render(
      <Typography variant="body" as="label">
        Label
      </Typography>,
    );
    expect(screen.getByText('Label').tagName).toBe('LABEL');
  });

  it('applies color variant classes', () => {
    render(
      <Typography variant="body" color="muted">
        M
      </Typography>,
    );
    expect(screen.getByText('M').className).toMatch(/text-muted-foreground/);
  });

  it('merges external className', () => {
    render(
      <Typography variant="body" className="custom-x">
        X
      </Typography>,
    );
    expect(screen.getByText('X').className).toContain('custom-x');
  });
});
