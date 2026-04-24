import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { inputLikeVariants } from '@/lib/inputLikeVariants';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

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

export type TextInputSize = NonNullable<VariantProps<typeof inputLikeVariants>['size']>;
export type TextInputStatus = NonNullable<VariantProps<typeof inputLikeVariants>['status']>;

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
      <div className={cn(inputLikeVariants({ size, status, fullWidth }), className)}>
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
