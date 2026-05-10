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

/**
 * Props for the {@link Textarea} component.
 *
 * Inherits every native `<textarea>` attribute (`value`, `defaultValue`,
 * `rows`, `placeholder`, `onChange`, `name`, `required`, etc.) via
 * `React.TextareaHTMLAttributes`, except for `size` which is replaced
 * by the design-token-driven scale.
 */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Size scale shared with `TextInput` and `Select`. Defaults to `md`. */
  size?: TextareaSize;
  /** Validation status; `error` flips `aria-invalid` and the danger border. */
  status?: TextareaStatus;
  /** Stretch the textarea to fill the available container width. */
  fullWidth?: boolean;
}

/**
 * Multi-line text input that mirrors `TextInput` visuals via the shared
 * `inputLikeVariants`.
 *
 * Same three-step size scale (`sm` / `md` / `lg`), same focus / disabled /
 * error treatments, but the wrapper grows with content and the inner
 * `<textarea>` is vertically resizeable by default. Use `rows` to set
 * the initial height; the user can drag-resize past it.
 *
 * Accessibility:
 * - `status="error"` sets `aria-invalid="true"`. Pair with `FormField`
 *   for an associated error message.
 * - The native `<textarea>` keeps its keyboard / IME / autocomplete
 *   behaviour intact.
 *
 * @example Default with a placeholder and 4 starting rows
 * ```tsx
 * <Textarea rows={4} placeholder="Tell us what changed…" />
 * ```
 *
 * @example Error state inside a FormField
 * ```tsx
 * <FormField label="Bio" htmlFor="bio" status="error" message="Required field.">
 *   <Textarea id="bio" status="error" />
 * </FormField>
 * ```
 */
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
