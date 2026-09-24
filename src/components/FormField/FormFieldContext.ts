import * as React from 'react';

/**
 * Ids + state a {@link FormField} shares with the DS control it wraps
 * (STU-888). Controls read it through {@link useFormFieldControl} or
 * {@link useFormFieldGroup}, so consumers never pass ids by hand.
 */
export interface FormFieldContextValue {
  /** Id for a single control; the label's `htmlFor` points here. */
  controlId: string;
  /** Id of the rendered label element. */
  labelId: string;
  /** Id of the message element, or undefined when no message renders. */
  messageId: string | undefined;
  /** True when the field's `status` is `error`. */
  invalid: boolean;
  /**
   * Group controls (e.g. `RadioGroup`) call this on mount so the field
   * renders its label as a plain element referenced by
   * `aria-labelledby` instead of a `<label for>` that points at nothing.
   * Returns the unregister function.
   */
  registerGroup: () => () => void;
}

export const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

/** Joins id lists for `aria-describedby`/`aria-labelledby`, dropping empties. */
export function mergeIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined || undefined;
}

interface ControlInput {
  id?: string;
  describedBy?: string;
  /** The control's own validity; `undefined` means "defer to the field". */
  invalid?: boolean;
}

/**
 * Wiring for a single control (input, textarea, checkbox, switch,
 * select trigger, date picker). Explicit props win: a passed `id` is
 * kept, a passed `aria-describedby` is merged ahead of the message, and
 * an explicit validity (`status` / `error`) overrides the field's.
 * Outside a FormField it returns the inputs unchanged.
 */
export function useFormFieldControl({ id, describedBy, invalid }: ControlInput) {
  const field = React.useContext(FormFieldContext);
  return {
    id: id ?? field?.controlId,
    describedBy: mergeIds(describedBy, field?.messageId),
    invalid: invalid ?? field?.invalid ?? false,
    labelId: field?.labelId,
  };
}

interface GroupInput {
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
}

/**
 * Wiring for a group control (`role="radiogroup"` etc.). Names the group
 * by the field label via `aria-labelledby` (an explicit one wins) and
 * describes it by the message.
 */
export function useFormFieldGroup({ labelledBy, describedBy, invalid }: GroupInput) {
  const field = React.useContext(FormFieldContext);
  const register = field?.registerGroup;
  React.useLayoutEffect(() => register?.(), [register]);
  return {
    labelledBy: labelledBy ?? field?.labelId,
    describedBy: mergeIds(describedBy, field?.messageId),
    invalid: invalid ?? field?.invalid ?? false,
  };
}
