import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** One chip in a {@link FilterChips} row. */
export interface FilterChipItem {
  /** Value reported by `onValueChange` when this chip is selected. Unique within the row. */
  value: string;
  /** Visible label. */
  label: React.ReactNode;
  /**
   * Optional count shown muted after the label ("Onboarding 3"). It is part
   * of the chip's accessible name ("Onboarding, 3"). `0` is shown; omit the
   * field to show no count.
   */
  count?: number;
  /** Disable this chip. Disabled chips are skipped by the arrow keys. */
  disabled?: boolean;
}

/** Chip height + text size. */
export type FilterChipsSize = 'sm' | 'md';

/**
 * Props for {@link FilterChips}. Inherits the Radix `RadioGroup.Root` props
 * (`value` / `defaultValue` / `onValueChange`, `disabled`, `name`,
 * `required`, `loop`, `dir`, `className`, …) except `children` and
 * `orientation` — chips are generated from `items` and wrap, so both arrow
 * axes move between them.
 */
export interface FilterChipsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    'children' | 'orientation'
  > {
  /** The chips, in display order. */
  items: FilterChipItem[];
  /**
   * Accessible name of the group (required), e.g. `"Filter boards by type"`.
   * Not rendered visibly — put a visible heading next to the chips if the
   * purpose isn't clear from context.
   */
  label: string;
  /** Chip size. `md` (32px) by default; `sm` is 28px. Both clear the 24px WCAG 2.2 target size. */
  size?: FilterChipsSize;
}

const chipVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap font-sans cursor-pointer',
    'motion-safe:transition-[background-color,color,border-color] duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Unselected: outlined pill.
    'data-[state=unchecked]:bg-transparent data-[state=unchecked]:text-foreground data-[state=unchecked]:border-border data-[state=unchecked]:font-medium',
    '[&[data-state=unchecked]:hover:not(:disabled)]:bg-[var(--color-interactive-outline-bg-hover)]',
    '[&[data-state=unchecked]:hover:not(:disabled)]:border-[var(--color-interactive-outline-border-hover)]',
    // Selected: filled + heavier label, so the state isn't carried by colour alone.
    'data-[state=checked]:bg-[var(--color-interactive-primary-bg)] data-[state=checked]:text-[var(--color-interactive-primary-fg)]',
    'data-[state=checked]:border-[var(--color-interactive-primary-bg)] data-[state=checked]:font-semibold',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-8 px-3 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/**
 * Single-select filter chips with optional counts (STU-1011).
 *
 * A wrapping row of pill-shaped chips; exactly one is selected. Use it to
 * filter a list by one category — "All 7 · Onboarding 3 · Sales 1". The
 * selected chip is filled, the others are outlined; counts sit muted after
 * the label.
 *
 * Built on `@radix-ui/react-radio-group`, following the DS `RadioGroup`
 * precedent:
 * - `role="radiogroup"` named by `label`; each chip is a `role="radio"`
 *   with `aria-checked`.
 * - One tab stop (the selected chip). Arrow keys (both axes, wrapping) move
 *   **and select**, like native radios; disabled chips are skipped. Space
 *   and Enter select the focused chip.
 * - The count is part of the accessible name: "Onboarding, 3".
 * - Selection is shown by fill **and** font weight, not colour alone.
 *
 * @example Uncontrolled
 * ```tsx
 * <FilterChips
 *   label="Filter boards by type"
 *   defaultValue="all"
 *   items={[
 *     { value: 'all', label: 'All', count: 7 },
 *     { value: 'onboarding', label: 'Onboarding', count: 3 },
 *   ]}
 * />
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [type, setType] = useState('all');
 * <FilterChips label="Filter boards by type" items={items} value={type} onValueChange={setType} />
 * ```
 */
const FilterChips = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  FilterChipsProps
>(function FilterChips({ items, label, size = 'md', className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {items.map((item) => (
        <RadioGroupPrimitive.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={cn('group', chipVariants({ size }))}
          onKeyDown={(e) => {
            // Radix radios ignore Enter (native radio behaviour). Filter
            // chips read as buttons, so Enter selects too.
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
        >
          <span>{item.label}</span>
          {item.count != null ? (
            <>
              {/* "Onboarding, 3" for AT; the flex gap does the visual spacing. */}
              <span className="sr-only">,</span>{' '}
              <span
                className={cn(
                  'font-normal tabular-nums',
                  'group-data-[state=unchecked]:text-muted-foreground',
                  'group-data-[state=checked]:opacity-80',
                )}
              >
                {item.count}
              </span>
            </>
          ) : null}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
});
FilterChips.displayName = 'FilterChips';

export { FilterChips };
