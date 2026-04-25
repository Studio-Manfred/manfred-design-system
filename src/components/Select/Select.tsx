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
 * Select — token-styled, accessible Radix Select with a Trigger that mirrors
 * TextInput visuals via `inputLikeVariants`. The Trigger element itself acts
 * as the wrapper that receives the input-like classes.
 */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

export type SelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: InputLikeSize;
  status?: InputLikeStatus;
  fullWidth?: boolean;
  leadingIcon?: IconName;
}

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
