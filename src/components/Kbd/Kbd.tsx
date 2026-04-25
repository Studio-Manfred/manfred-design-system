import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const kbdVariants = cva(
  [
    'inline-flex items-center font-mono leading-none whitespace-nowrap',
    'text-muted-foreground select-none',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'gap-0.5 text-[0.6875rem]',
        md: 'gap-1 text-xs',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

const kbdKeyVariants = cva(
  [
    'inline-flex items-center justify-center font-mono',
    'bg-secondary text-muted-foreground',
    'border border-border rounded-[var(--radius-sm)]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'min-w-[1.25rem] h-5 px-1 text-[0.6875rem]',
        md: 'min-w-[1.5rem] h-6 px-1.5 text-xs',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

export type KbdSize = NonNullable<VariantProps<typeof kbdVariants>['size']>;

export interface KbdProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof kbdVariants> {
  /** Sequence of keys to render. Each entry becomes its own `<kbd>` chip. */
  keys: string[];
  /** Visual separator rendered between keys. Defaults to `+`. */
  separator?: React.ReactNode;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  {
    keys,
    size = 'sm',
    separator = '+',
    className,
    'aria-hidden': ariaHidden = true,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden={ariaHidden}
      className={cn(kbdVariants({ size }), className)}
      {...rest}
    >
      {keys.map((key, i) => (
        <React.Fragment key={`${key}-${i}`}>
          {i > 0 && (
            <span aria-hidden="true" className="px-0.5">
              {separator}
            </span>
          )}
          <kbd className={cn(kbdKeyVariants({ size }))}>{key}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
});

Kbd.displayName = 'Kbd';
