import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates label via htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email-id">
        <input id="email-id" />
      </FormField>,
    );
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'email-id');
  });

  it('shows required marker', () => {
    render(
      <FormField label="Email" required>
        <input />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('error message has role=alert', () => {
    render(
      <FormField label="E" status="error" message="Required">
        <input />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it.each([
    ['hint', 'polite'],
    ['success', 'polite'],
  ] as const)('%s message has aria-live=%s', (status, live) => {
    render(
      <FormField label="E" status={status} message="msg">
        <input />
      </FormField>,
    );
    const msg = screen.getByText('msg');
    expect(msg).toHaveAttribute('aria-live', live);
  });

  it('does not render message when not provided', () => {
    render(
      <FormField label="E">
        <input />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
