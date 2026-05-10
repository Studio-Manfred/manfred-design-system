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

/**
 * Props for the {@link TextInput} component.
 *
 * Inherits every native `<input>` attribute (`value`, `defaultValue`,
 * `placeholder`, `type`, `onChange`, `name`, `required`, etc.) via
 * `React.InputHTMLAttributes`, except for `size` which is replaced by
 * the design-token-driven scale.
 */
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size scale shared with `Textarea` and `Select`. Defaults to `md`. */
  size?: TextInputSize;
  /** Validation status; `error` flips `aria-invalid` and the danger border. */
  status?: TextInputStatus;
  /** Icon name from the Manfred icon set, rendered inside the left edge. */
  leadingIcon?: IconName;
  /** Icon name from the Manfred icon set, rendered inside the right edge. */
  trailingIcon?: IconName;
  /** Stretch the input to fill the available container width. */
  fullWidth?: boolean;
}

/**
 * Single-line text input that drives the rest of the form system.
 *
 * Three sizes (`sm` / `md` / `lg`), validation `status`, and optional
 * leading + trailing icons. The wrapper takes the focus / disabled /
 * error treatments from `inputLikeVariants` so `Select`, `Textarea`,
 * and `SearchBar` line up visually.
 *
 * Accessibility:
 * - `status="error"` sets `aria-invalid="true"`. Pair with `FormField`
 *   to wire the label and error message.
 * - Icons are decorative (`aria-hidden`) — never rely on the icon to
 *   convey meaning the label doesn't already carry.
 *
 * @example Email input with leading icon
 * ```tsx
 * <TextInput leadingIcon="mail" type="email" placeholder="you@studio.com" />
 * ```
 *
 * @example Error state inside FormField
 * ```tsx
 * <FormField label="Username" htmlFor="user" status="error" message="Already taken.">
 *   <TextInput id="user" status="error" />
 * </FormField>
 * ```
 */
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
