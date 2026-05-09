import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { inputLikeVariants } from '@/lib/inputLikeVariants';

/**
 * Per-size overrides applied on top of `inputLikeVariants`:
 *
 * - replaces the fixed `h-X` from `inputLikeVariants` with `h-auto min-h-X`
 *   so the wrapper grows with the multi-line content / `rows` attribute.
 * - flips `items-center` to `items-stretch` so the inner <textarea> fills
 *   the wrapper vertically instead of being centered on a single line.
 */
const textareaWrapperOverride = cva('h-auto items-stretch', {
  variants: {
    size: {
      sm: 'min-h-16',
      md: 'min-h-20',
      lg: 'min-h-24',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const textareaVariants = cva(
  [
    'flex-1 min-w-0 w-full bg-transparent border-0 outline-none font-sans text-foreground',
    'placeholder:text-muted-foreground disabled:cursor-not-allowed',
    'resize-y',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-sm px-3 py-2',
        md: 'text-base px-4 py-2.5',
        lg: 'text-lg px-4 py-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export type TextareaSize = NonNullable<VariantProps<typeof inputLikeVariants>['size']>;
export type TextareaStatus = NonNullable<VariantProps<typeof inputLikeVariants>['status']>;

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: TextareaSize;
  status?: TextareaStatus;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      status = 'default',
      fullWidth = false,
      rows = 3,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          inputLikeVariants({ size, status, fullWidth }),
          textareaWrapperOverride({ size }),
          className,
        )}
      >
        <textarea
          ref={ref}
          rows={rows}
          className={cn(textareaVariants({ size }))}
          disabled={disabled}
          aria-invalid={status === 'error' ? true : undefined}
          {...rest}
        />
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
