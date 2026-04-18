import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('inline-flex items-center justify-center text-[var(--color-brand-primary)]', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-10 h-10',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>['size']>;

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;

  return (
    <span className={cn(spinnerVariants({ size }), className)} role="status">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeOpacity="0.2"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
          strokeLinecap="round"
          className="origin-center animate-spin"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
