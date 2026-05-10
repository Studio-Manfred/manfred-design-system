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

/**
 * Props for the {@link Kbd} component.
 *
 * Inherits every native HTML attribute via `React.HTMLAttributes`
 * (e.g. `className`, `title`, `aria-hidden`) except `children` —
 * the visible chips are derived from `keys` so the rendering stays
 * consistent across usages.
 */
export interface KbdProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof kbdVariants> {
  /**
   * Sequence of keys to render. Each entry becomes its own `<kbd>`
   * chip with the separator between, e.g. `['⌘', 'K']` →
   * `⌘ + K`. Required.
   */
  keys: string[];
  /**
   * Visual separator rendered between keys. Defaults to `+`. Pass
   * `''` for no separator (chord visualisation), or any node — e.g.
   * a custom arrow icon — for fancier shortcuts.
   */
  separator?: React.ReactNode;
}

/**
 * Keyboard-shortcut hint. Renders each entry in `keys` as its own
 * `<kbd>` chip joined by `separator`. Used in command-palette
 * triggers, menu-item shortcuts, and help text.
 *
 * Accessibility:
 * - The wrapper is `aria-hidden="true"` by default — keyboard hints
 *   are decorative when the surrounding control already announces
 *   its action. Set `aria-hidden={false}` when the shortcut is the
 *   only way the user discovers the keystroke (e.g. help-page copy).
 * - The separator is always `aria-hidden`, so screen readers don't
 *   read the literal `+` between keys.
 *
 * @example Command-palette shortcut, decorative
 * ```tsx
 * <SearchBar trailing={<Kbd keys={['⌘', 'K']} />} />
 * ```
 *
 * @example Help-page copy, announced
 * ```tsx
 * <p>Press <Kbd keys={['⌘', 'K']} aria-hidden={false} /> to search.</p>
 * ```
 */
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
