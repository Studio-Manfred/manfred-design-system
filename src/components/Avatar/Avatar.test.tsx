import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders initials derived from name when no src', () => {
    render(<Avatar alt="Jens Wedin" name="Jens Wedin" />);
    const av = screen.getByRole('img', { name: 'Jens Wedin' });
    expect(av).toHaveTextContent('JW');
  });

  it('falls back to alt when no name is provided', () => {
    render(<Avatar alt="User M" />);
    expect(screen.getByRole('img', { name: 'User M' })).toHaveTextContent('UM');
  });

  it('handles a single-word name', () => {
    render(<Avatar alt="M" name="M" />);
    expect(screen.getByRole('img', { name: 'M' })).toHaveTextContent('M');
  });

  it('caps initials at 2 characters even for long names', () => {
    render(<Avatar alt="Jens Aron Wedin" name="Jens Aron Wedin" />);
    expect(screen.getByRole('img', { name: 'Jens Aron Wedin' })).toHaveTextContent('JA');
  });

  it('renders the image when src is provided', () => {
    const { container } = render(
      <Avatar alt="Jens Wedin" name="Jens Wedin" src="/avatar.jpg" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', '/avatar.jpg');
    // Image is decorative — accessible name comes from the wrapper.
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
  });

  it('falls back to initials when the image fails to load', () => {
    const { container } = render(
      <Avatar alt="Jens Wedin" name="Jens Wedin" src="/missing.jpg" />,
    );
    const img = container.querySelector('img')!;
    fireEvent.error(img);
    expect(screen.getByRole('img', { name: 'Jens Wedin' })).toHaveTextContent('JW');
    expect(container.querySelector('img')).toBeNull();
  });

  it('respects an explicit initials override', () => {
    render(<Avatar alt="Jens Wedin" name="Jens Wedin" initials="JJ" />);
    expect(screen.getByRole('img', { name: 'Jens Wedin' })).toHaveTextContent('JJ');
  });

  it('exposes role="img" and the alt as aria-label', () => {
    render(<Avatar alt="Jens Wedin" />);
    const av = screen.getByRole('img', { name: 'Jens Wedin' });
    expect(av).toHaveAttribute('role', 'img');
    expect(av).toHaveAttribute('aria-label', 'Jens Wedin');
  });
});
