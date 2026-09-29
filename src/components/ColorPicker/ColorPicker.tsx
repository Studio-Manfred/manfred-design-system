import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';
import { TextInput } from '../TextInput';

/**
 * Default palette shipped when the consumer omits `palette`. Eight
 * brand-adjacent hexes chosen to cover the common whiteboard-stroke
 * scenarios (black/white plus six saturated hues).
 */
export const DEFAULT_COLOR_PICKER_PALETTE: readonly string[] = Object.freeze([
  '#1e1e24', // almost-black
  '#ffffff', // white
  '#2c28ec', // business-blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#efd6d3', // human-pink
  '#e6dcc8', // beige
]);

/** Swatch size scale. Matches other DS controls (`sm` / `md` / `lg`). */
export type ColorPickerSize = 'sm' | 'md' | 'lg';

const SWATCH_PIXELS: Record<ColorPickerSize, number> = {
  sm: 20,
  md: 28,
  lg: 36,
};

/**
 * Case-insensitive 3- or 6-digit hex, prefixed with `#`.
 * Kept in module scope so both the component and the exported type
 * declaration share the exact literal.
 */
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Props for the {@link ColorPicker} component.
 */
export interface ColorPickerProps {
  /**
   * Currently-selected colour as a 3- or 6-digit hex (with the `#`).
   * Controlled — pair with `onChange`. When `value` doesn't match any
   * palette entry (case-insensitive), no swatch is highlighted; if
   * `allowCustom` is set the hex input mirrors the value.
   */
  value: string;
  /**
   * Fires with the newly-selected hex when the user picks a swatch or
   * commits a valid custom hex. The value's original casing is
   * preserved — palette clicks yield the palette entry as-authored,
   * custom entries yield exactly what the user typed.
   */
  onChange: (colour: string) => void;
  /**
   * Ordered list of hex swatches. Defaults to
   * {@link DEFAULT_COLOR_PICKER_PALETTE} (eight entries).
   */
  palette?: readonly string[];
  /**
   * Render a secondary text input where the user can type any hex.
   * Commits on blur or on `Enter`. Invalid hex sets
   * `aria-invalid="true"` and the error border; `onChange` is only
   * fired on a valid value.
   */
  allowCustom?: boolean;
  /**
   * Accessible name for the radiogroup, exposed as `aria-label`.
   * Defaults to `"Colour"`. Superseded by `aria-labelledby`.
   */
  label?: string;
  /**
   * Swatch pixel size. `sm` = 20px, `md` = 28px (default), `lg` = 36px.
   */
  size?: ColorPickerSize;
  /** Disable interaction and dim the entire control. */
  disabled?: boolean;
  /**
   * Form-serialisation name. Passed through to the underlying Radix
   * `RadioGroup.Root`, which renders a hidden `<input>` when set.
   */
  name?: string;
  /** DOM id — applied to the radiogroup wrapper. */
  id?: string;
  /** Additional class names for the outer flex column. */
  className?: string;
  /**
   * Skip `label`, use an existing element as the accessible name.
   * Set when the picker sits inside a `FormField` or below a heading.
   */
  'aria-labelledby'?: string;
  /**
   * Describes the radiogroup — typically the id of an error or hint
   * element rendered nearby.
   */
  'aria-describedby'?: string;
}

/**
 * Accessible palette-based colour picker.
 *
 * Rendered as a horizontal `role="radiogroup"` of round swatches
 * (each `role="radio"`), optionally followed by a hex text input when
 * `allowCustom` is set. Radix's `RadioGroup` manages roving tab-index,
 * arrow-key navigation, and `aria-checked`; only one swatch is in the
 * tab sequence at a time, and focus wraps at the group boundaries.
 *
 * Accessibility:
 * - Arrow keys move focus AND select. `Space` and `Enter` re-select
 *   (Radix renders each item as a `<button role="radio">`, so button
 *   activation semantics apply on top of the WAI-ARIA radiogroup
 *   pattern).
 * - `Tab` steps out of the group. When `allowCustom` is set, the next
 *   Tab stop is the hex input.
 * - Each swatch is named by its hex value (`aria-label`) so screen
 *   readers announce "Blue / #2c28ec" as-is — colour names would
 *   drift from the value the caller receives.
 * - Popover-style compact usage is composition-driven: wrap this
 *   picker inside the DS `Popover` and Radix's built-in `Escape`
 *   handling closes the trigger. The picker itself does not own a
 *   popover.
 *
 * @example Controlled inline usage
 * ```tsx
 * const [colour, setColour] = useState('#2c28ec');
 * <ColorPicker value={colour} onChange={setColour} label="Stroke colour" />
 * ```
 *
 * @example With custom hex entry
 * ```tsx
 * <ColorPicker
 *   value={colour}
 *   onChange={setColour}
 *   allowCustom
 *   label="Stroke colour"
 * />
 * ```
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      onChange,
      palette = DEFAULT_COLOR_PICKER_PALETTE,
      allowCustom = false,
      label = 'Colour',
      size = 'md',
      disabled = false,
      name,
      id,
      className,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
    },
    ref,
  ) => {
    const px = SWATCH_PIXELS[size];

    // Match palette entries case-insensitively but preserve authored casing
    // when firing onChange (so callers see #FFFFFF if they wrote #FFFFFF).
    const matchingPaletteEntry = React.useMemo(
      () => palette.find((c) => c.toLowerCase() === value.toLowerCase()),
      [palette, value],
    );

    // Local draft for the optional hex input. Syncs back to `value`
    // whenever the parent re-controls it.
    const [hexDraft, setHexDraft] = React.useState(value);
    const [hexError, setHexError] = React.useState(false);

    React.useEffect(() => {
      setHexDraft(value);
      setHexError(false);
    }, [value]);

    const commitHexDraft = React.useCallback(() => {
      if (HEX_RE.test(hexDraft)) {
        setHexError(false);
        if (hexDraft.toLowerCase() !== value.toLowerCase()) {
          onChange(hexDraft);
        }
      } else {
        setHexError(true);
      }
    }, [hexDraft, onChange, value]);

    const hexInputId = allowCustom && id ? `${id}-hex` : undefined;

    return (
      <div ref={ref} className={cn('inline-flex flex-col gap-3', className)}>
        <RadioGroupPrimitive.Root
          value={matchingPaletteEntry ?? ''}
          onValueChange={(next) => {
            if (next) onChange(next);
          }}
          disabled={disabled}
          name={name}
          id={id}
          aria-label={ariaLabelledBy ? undefined : label}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          orientation="horizontal"
          loop
          className="flex flex-wrap gap-2"
        >
          {palette.map((colour) => {
            const light = isColourLight(colour);
            return (
              <RadioGroupPrimitive.Item
                key={colour}
                value={colour}
                aria-label={colour}
                disabled={disabled}
                style={{
                  backgroundColor: colour,
                  width: px,
                  height: px,
                }}
                className={cn(
                  'relative shrink-0 rounded-full transition-shadow',
                  'border border-[var(--color-border-strong)]',
                  'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
                  'hover:border-[var(--color-border-focus)]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  // Selected: ring around the swatch so the tick colour never
                  // has to fight the swatch itself for contrast.
                  'data-[state=checked]:ring-2 data-[state=checked]:ring-offset-2',
                  'data-[state=checked]:ring-[var(--color-border-focus)]',
                )}
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full">
                  <span
                    aria-hidden
                    style={{ backgroundColor: light ? '#1e1e24' : '#ffffff' }}
                    className="block w-1.5 h-1.5 rounded-full"
                  />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
            );
          })}
        </RadioGroupPrimitive.Root>
        {allowCustom && (
          <div className="flex items-center gap-2">
            <label
              htmlFor={hexInputId}
              className="font-sans text-sm text-[var(--color-text-secondary)]"
            >
              Custom hex
            </label>
            <TextInput
              id={hexInputId}
              size="sm"
              value={hexDraft}
              onChange={(e) => {
                setHexDraft(e.currentTarget.value);
                if (hexError) setHexError(false);
              }}
              onBlur={commitHexDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitHexDraft();
                }
              }}
              pattern="^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
              placeholder="#000000"
              disabled={disabled}
              status={hexError ? 'error' : undefined}
              aria-label="Custom colour hex"
              maxLength={7}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    );
  },
);
ColorPicker.displayName = 'ColorPicker';

/**
 * Rec. 709 luma > 0.6 — heuristic for "should the check-dot render dark".
 * Tolerates 3- and 6-digit hex; anything else falls back to "not light".
 */
function isColourLight(hex: string): boolean {
  const normalised = hex.replace('#', '');
  const expanded =
    normalised.length === 3
      ? normalised
          .split('')
          .map((c) => c + c)
          .join('')
      : normalised;
  if (expanded.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(expanded)) return false;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma > 0.6;
}
