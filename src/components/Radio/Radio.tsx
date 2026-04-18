import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: React.ReactNode;
  error?: boolean;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, error, id, disabled, ...props }, ref) => {
  const control = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      disabled={disabled}
      className={cn(
        'shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] bg-background',
        'border-[var(--color-border-strong)]',
        'data-[state=checked]:border-[var(--color-bg-brand)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        'disabled:cursor-not-allowed',
        error && 'border-[var(--color-feedback-error-fg)]',
        !label && className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-[var(--color-bg-brand)]" />
    </RadioGroupPrimitive.Item>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {control}
      <span className="font-sans text-base text-foreground leading-[1.5]">{label}</span>
    </label>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
