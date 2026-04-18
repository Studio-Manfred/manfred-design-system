import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TextInput } from '../TextInput';
import { Icon } from '../Icon';
import type { TextInputSize } from '../TextInput';

export type SearchBarSize = TextInputSize;

export interface SearchBarProps {
  size?: SearchBarSize;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

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
      {showClear && (
        <button
          type="button"
          className="absolute right-3 flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <Icon name="x" size="sm" />
        </button>
      )}
    </div>
  );
}
