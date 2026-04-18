import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

const wrapperVariants = cva(
  [
    'relative inline-flex items-center bg-background border-[1.5px] border-input rounded-[var(--radius-md)]',
    'transition-[border-color,box-shadow] duration-150 ease-in-out',
    'focus-within:border-[var(--color-border-focus)] focus-within:shadow-[var(--shadow-focus)]',
    'has-[input:disabled]:bg-muted has-[input:disabled]:opacity-60 has-[input:disabled]:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
      status: {
        default: '',
        error:
          'border-[var(--color-feedback-error-fg)] focus-within:border-[var(--color-feedback-error-fg)] focus-within:shadow-[0_0_0_3px_var(--color-feedback-error-bg)]',
        success:
          'border-[var(--color-feedback-success-fg)] focus-within:border-[var(--color-feedback-success-fg)] focus-within:shadow-[0_0_0_3px_var(--color-feedback-success-bg)]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'default',
      fullWidth: false,
    },
  },
);

const inputVariants = cva(
  [
    'flex-1 min-w-0 w-full bg-transparent border-0 outline-none font-sans text-foreground',
    'placeholder:text-muted-foreground disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-sm px-3',
        md: 'text-base px-4',
        lg: 'text-lg px-4',
      },
      hasLeadingIcon: {
        true: 'pl-10',
        false: '',
      },
      hasTrailingIcon: {
        true: 'pr-10',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      hasLeadingIcon: false,
      hasTrailingIcon: false,
    },
  },
);

export type TextInputSize = NonNullable<VariantProps<typeof wrapperVariants>['size']>;
export type TextInputStatus = NonNullable<VariantProps<typeof wrapperVariants>['status']>;

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextInputSize;
  status?: TextInputStatus;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  fullWidth?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = 'md',
      status = 'default',
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const iconSize = size === 'lg' ? 'md' : 'sm';

    return (
      <div className={cn(wrapperVariants({ size, status, fullWidth }), className)}>
        {leadingIcon && (
          <span
            className="absolute left-3 flex items-center pointer-events-none text-muted-foreground"
            aria-hidden="true"
          >
            <Icon name={leadingIcon} size={iconSize} />
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            inputVariants({
              size,
              hasLeadingIcon: Boolean(leadingIcon),
              hasTrailingIcon: Boolean(trailingIcon),
            }),
          )}
          disabled={disabled}
          aria-invalid={status === 'error' ? true : undefined}
          {...rest}
        />
        {trailingIcon && (
          <span
            className="absolute right-3 flex items-center pointer-events-none text-muted-foreground"
            aria-hidden="true"
          >
            <Icon name={trailingIcon} size={iconSize} />
          </span>
        )}
      </div>
    );
  },
);
TextInput.displayName = 'TextInput';
