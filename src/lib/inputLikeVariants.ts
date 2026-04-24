import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared CVA for TextInput-styled wrappers.
 *
 * Used by TextInput (wrapping a real <input>) and DatePicker (wrapping a
 * <button> trigger) so both stay visually locked with no drift.
 *
 * If you change the border, padding, or radius here, TextInput and
 * DatePicker both pick it up automatically.
 */
export const inputLikeVariants = cva(
  [
    'relative inline-flex items-center bg-background border-[1.5px] border-input rounded-[var(--radius-md)]',
    'transition-[border-color,box-shadow] duration-150 ease-in-out',
    'focus-within:border-[var(--color-border-focus)] focus-within:shadow-[var(--shadow-focus)]',
    'has-[:disabled]:bg-muted has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed',
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

export type InputLikeSize = NonNullable<VariantProps<typeof inputLikeVariants>['size']>;
export type InputLikeStatus = NonNullable<VariantProps<typeof inputLikeVariants>['status']>;
