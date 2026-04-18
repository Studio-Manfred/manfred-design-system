import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const trackVariants = cva('relative w-full overflow-hidden bg-muted rounded-full', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const fillVariants = cva('h-full w-full flex-1 transition-transform duration-[250ms] ease-in-out rounded-[inherit]', {
  variants: {
    variant: {
      default: 'bg-[var(--color-text-secondary)]',
      brand: 'bg-[var(--color-bg-brand)]',
      success: 'bg-[var(--color-feedback-success-fg)]',
      warning: 'bg-[var(--color-feedback-warning-fg)]',
      error: 'bg-[var(--color-feedback-error-fg)]',
    },
    animated: {
      true: "bg-[image:repeating-linear-gradient(-45deg,transparent,transparent_8px,rgba(255,255,255,0.2)_8px,rgba(255,255,255,0.2)_16px)] bg-[length:200%_100%] animate-[stripes_1.2s_linear_infinite]",
      false: '',
    },
  },
  defaultVariants: {
    variant: 'brand',
    animated: false,
  },
});

export type ProgressBarVariant = NonNullable<VariantProps<typeof fillVariants>['variant']>;
export type ProgressBarSize = NonNullable<VariantProps<typeof trackVariants>['size']>;

export interface ProgressBarProps {
  value: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  variant = 'brand',
  size = 'md',
  label,
  showValue = false,
  animated = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center font-sans">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showValue && <span className="text-sm text-[var(--color-text-secondary)]">{clamped}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        value={clamped}
        aria-label={label ?? 'Progress'}
        className={cn(trackVariants({ size }))}
      >
        <ProgressPrimitive.Indicator
          className={cn(fillVariants({ variant, animated }))}
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
