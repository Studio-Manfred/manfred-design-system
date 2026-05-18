import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TextInput } from '../TextInput';
import { Icon } from '../Icon';
import type { TextInputSize } from '../TextInput';

export type SearchBarSize = TextInputSize;

/**
 * Props for the {@link SearchBar} component.
 *
 * Composes {@link TextInput} with a leading search icon, a clear-on-type
 * affordance, optional Enter-to-submit behaviour, and an opt-in
 * `trailing` slot for shortcut hints. Works in both controlled and
 * uncontrolled modes.
 */
export interface SearchBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** Size scale, inherited from `TextInput` (`sm` / `md` / `lg`). Defaults to `md`. */
  size?: SearchBarSize;
  /** Placeholder rendered while the input is empty. Defaults to `Search…`. */
  placeholder?: string;
  /**
   * Controlled value. When provided, `onChange` must be wired to keep
   * the value in sync. Omit for uncontrolled use.
   */
  value?: string;
  /** Initial value for uncontrolled mode. Ignored when `value` is set. */
  defaultValue?: string;
  /** Called on every keystroke with the next string value. */
  onChange?: (value: string) => void;
  /** Called when the user presses Enter, with the current value. */
  onSearch?: (value: string) => void;
  /** Called when the user clicks the clear button. */
  onClear?: () => void;
  /** Disable interaction and hide the clear button. */
  disabled?: boolean;
  /** Stretch the input to fill the available container width. */
  fullWidth?: boolean;
  /**
   * Optional trailing-edge content (e.g. a `<Kbd>` shortcut hint).
   * Sits inside the input's right edge. When the input has a value,
   * the Clear button renders to its left (closer to the text); when
   * empty, the trailing content has the right edge to itself.
   *
   * The element is rendered as-is — manage its own a11y semantics.
   * Decorative elements like `<Kbd>` ship with `aria-hidden="true"`
   * by default; interactive elements should provide their own label.
   */
  trailing?: React.ReactNode;
}

/**
 * Single-line search input with leading icon, Enter-to-submit, and a
 * built-in clear affordance.
 *
 * Composes {@link TextInput} with a `search` leading icon and adds an
 * inline clear button that appears once the field has content. Supports
 * controlled and uncontrolled use, an optional `trailing` slot for
 * shortcut hints, and the standard size scale (`sm` / `md` / `lg`).
 *
 * Accessibility:
 * - The input carries `aria-label="Search"` so it announces correctly
 *   even without a visible label.
 * - The clear button is labelled `Clear search` and uses the same focus
 *   ring token (`--ring`) as the rest of the system.
 * - `trailing` content is rendered as-is — pass `aria-hidden` for
 *   decorative shortcut hints; interactive trailing items must label
 *   themselves.
 *
 * @example Uncontrolled with Enter-to-search
 * ```tsx
 * <SearchBar onSearch={(q) => router.push(`/search?q=${q}`)} />
 * ```
 *
 * @example Controlled with shortcut hint
 * ```tsx
 * <SearchBar
 *   value={query}
 *   onChange={setQuery}
 *   trailing={<Kbd>⌘K</Kbd>}
 * />
 * ```
 */
export function SearchBar({
  size = 'md',
  placeholder = 'Search…',
  value,
  defaultValue,
  onChange,
  onSearch,
  onClear,
  disabled = false,
  fullWidth = false,
  className,
  style,
  trailing,
  ...rest
}: SearchBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(currentValue ?? '');
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    onClear?.();
  };

  const showClear = (currentValue ?? '').length > 0 && !disabled;

  return (
    <div
      {...rest}
      className={cn('relative inline-flex items-center', fullWidth && 'w-full', className)}
      style={style}
    >
      <TextInput
        size={size}
        placeholder={placeholder}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        leadingIcon="search"
        disabled={disabled}
        fullWidth={fullWidth}
        aria-label="Search"
      />
      {(showClear || trailing) && (
        <div className="absolute right-3 flex items-center gap-2">
          {showClear && (
            <button
              type="button"
              className="flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <Icon name="x" size="sm" />
            </button>
          )}
          {trailing}
        </div>
      )}
    </div>
  );
}
