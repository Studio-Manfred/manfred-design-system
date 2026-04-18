import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

type RadixCheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

export interface CheckboxProps extends Omit<RadixCheckboxProps, 'children'> {
  label?: React.ReactNode;
  indeterminate?: boolean;
  error?: boolean;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ label, indeterminate, error, className, disabled, checked, id, ...rest }, ref) => {
  const checkedValue: CheckboxPrimitive.CheckedState | undefined =
    indeterminate ? 'indeterminate' : checked;

  const control = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={id}
      disabled={disabled}
      checked={checkedValue}
      aria-invalid={error || undefined}
      className={cn(
        'peer shrink-0 w-[18px] h-[18px] rounded-[var(--radius-sm)] border-[1.5px] bg-background',
        'border-[var(--color-border-strong)]',
        'data-[state=checked]:bg-[var(--color-bg-brand)] data-[state=checked]:border-[var(--color-bg-brand)] data-[state=checked]:text-[var(--color-text-on-brand)]',
        'data-[state=indeterminate]:bg-[var(--color-bg-brand)] data-[state=indeterminate]:border-[var(--color-bg-brand)] data-[state=indeterminate]:text-[var(--color-text-on-brand)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-[var(--color-feedback-error-fg)]',
        !label && className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Icon name={indeterminate ? 'minus' : 'check'} size="xs" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'cursor-not-allowed',
        className,
      )}
    >
      {control}
      <span className="font-sans text-base text-foreground leading-[1.5]">{label}</span>
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
