import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders a search input', () => {
    render(<SearchBar />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('uses provided placeholder', () => {
    render(<SearchBar placeholder="Find things" />);
    expect(screen.getByPlaceholderText('Find things')).toBeInTheDocument();
  });

  it('fires onChange with the typed value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'hi');
    expect(onChange).toHaveBeenLastCalledWith('hi');
  });

  it('fires onSearch when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar defaultValue="query" onSearch={onSearch} />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSearch).toHaveBeenCalledWith('query');
  });

  it('clear button appears when value is non-empty and dismisses input', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchBar defaultValue="abc" onClear={onClear} />);
    const clear = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clear);
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('clear button is hidden when disabled', () => {
    render(<SearchBar defaultValue="x" disabled />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('controlled value overrides internal state', () => {
    render(<SearchBar value="external" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('external');
  });

  it('controlled mode: typing calls onChange but does not mutate internal state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="fixed" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'z');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('fixed');
  });

  it('Enter without onSearch is a no-op', async () => {
    const user = userEvent.setup();
    render(<SearchBar defaultValue="q" />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    // no crash, input still has value
    expect(screen.getByRole('textbox')).toHaveValue('q');
  });

  it('controlled clear: onChange and onClear fire without mutating value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchBar value="xyz" onChange={onChange} onClear={onClear} />);
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledOnce();
    // controlled value unchanged without parent update
    expect(screen.getByRole('textbox')).toHaveValue('xyz');
  });
});
