import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import {
  inputLikeVariants,
  type InputLikeSize,
  type InputLikeStatus,
} from '@/lib/inputLikeVariants';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

/**
 * Compound, token-styled select built on `@radix-ui/react-select`.
 *
 * `Select` is the controlled root; `SelectTrigger` mirrors `TextInput`
 * visuals via `inputLikeVariants` so the closed state lines up with
 * other form controls. Open the panel via `SelectContent`, group with
 * `SelectGroup` + `SelectLabel`, and render options via `SelectItem`.
 *
 * Accessibility: keyboard interaction, type-ahead, focus-trap, and
 * announcements are handled by Radix; the visual layer only adds the
 * shared focus ring (`--ring`) and `aria-invalid` propagation.
 *
 * @example Single select with a placeholder
 * ```tsx
 * <Select onValueChange={setRole}>
 *   <SelectTrigger><SelectValue placeholder="Pick a role" /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="owner">Owner</SelectItem>
 *     <SelectItem value="editor">Editor</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 *
 * @example Grouped options with a leading icon
 * ```tsx
 * <Select>
 *   <SelectTrigger leadingIcon="user"><SelectValue placeholder="Assignee" /></SelectTrigger>
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectLabel>Team</SelectLabel>
 *       <SelectItem value="ana">Ana</SelectItem>
 *       <SelectItem value="ben">Ben</SelectItem>
 *     </SelectGroup>
 *   </SelectContent>
 * </Select>
 * ```
 */

/** Root of the select. Re-export of Radix `Select.Root`. Wire `value`/`onValueChange` here. */
const Select = SelectPrimitive.Root;
/** Logical group of items inside the panel. Pair with {@link SelectLabel} for screen readers. */
const SelectGroup = SelectPrimitive.Group;
/** Renders the currently selected item's text inside the trigger. Accepts `placeholder`. */
const SelectValue = SelectPrimitive.Value;

export type SelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;

/**
 * Props for {@link SelectTrigger}. Extends Radix `Select.Trigger` with the
 * shared input-like styling controls used by `TextInput`.
 */
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  /** Size scale shared with other input-like controls. Defaults to `md`. */
  size?: InputLikeSize;
  /** Validation status; `error` flips `aria-invalid` and the danger border. */
  status?: InputLikeStatus;
  /** Stretch the trigger to fill the available container width. */
  fullWidth?: boolean;
  /** Optional leading icon name from the Manfred icon set, rendered inside the trigger. */
  leadingIcon?: IconName;
}

/**
 * Token-styled trigger button for {@link Select}. Mirrors `TextInput`
 * via `inputLikeVariants` so disabled, focus, and error states match
 * across the form system.
 */

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    {
      className,
      size = 'md',
      status = 'default',
      fullWidth = false,
      leadingIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const iconSize = size === 'lg' ? 'md' : 'sm';
    const isError = status === 'error';

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        aria-invalid={isError ? true : props['aria-invalid']}
        data-status={status}
        className={cn(
          inputLikeVariants({ size, status, fullWidth }),
          // Trigger acts as the input wrapper. Inner row layout:
          'flex items-center gap-2 px-3 outline-none text-left',
          'font-sans text-foreground',
          'data-[placeholder]:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:outline-none',
          // Inner text size matches TextInput per size step.
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          className,
        )}
        {...props}
      >
        {leadingIcon && (
          <span
            className="flex items-center pointer-events-none text-muted-foreground"
            aria-hidden="true"
          >
            <Icon name={leadingIcon} size={iconSize} />
          </span>
        )}
        <span className="flex-1 min-w-0 truncate">{children}</span>
        <SelectPrimitive.Icon asChild>
          <span className="flex items-center text-muted-foreground" aria-hidden="true">
            <Icon name="chevron-down" size={iconSize} />
          </span>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/**
 * Auto-scroll affordance shown at the top of the open list when items
 * overflow upward. Re-export of Radix `Select.ScrollUpButton`.
 */
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-muted-foreground',
      className,
    )}
    {...props}
  >
    <Icon name="chevron-up" size="sm" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

/**
 * Auto-scroll affordance shown at the bottom of the open list when
 * items overflow downward. Re-export of Radix `Select.ScrollDownButton`.
 */
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-muted-foreground',
      className,
    )}
    {...props}
  >
    <Icon name="chevron-down" size="sm" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

/**
 * Floating panel that holds the option list. Portalled by Radix and
 * styled with the popover tokens; defaults to `position="popper"` so
 * it anchors to the trigger.
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={sideOffset}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden',
        'bg-popover text-popover-foreground',
        'border border-border rounded-[var(--radius-md)] shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className,
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'max-h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

/**
 * Non-selectable header for a {@link SelectGroup}. Rendered as a small
 * muted caption above the group's items.
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

/**
 * Selectable option inside the panel. Uses `value` as the submitted
 * value and renders `children` as the label. Shows a check icon when
 * selected and supports `disabled`.
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-default outline-none',
      'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
      'data-[highlighted]:bg-secondary data-[highlighted]:text-secondary-foreground',
      className,
    )}
    {...props}
  >
    <span className="flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Icon name="check" size="xs" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/**
 * Hairline divider between groups inside the panel. Use sparingly —
 * usually a {@link SelectLabel} carries the section break instead.
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
