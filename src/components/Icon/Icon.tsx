import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { iconPaths } from './iconPaths';

export type IconName =
  | 'check'
  | 'x'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'info'
  | 'warning'
  | 'alert-circle'
  | 'check-circle'
  | 'x-circle'
  | 'eye'
  | 'eye-off'
  | 'plus'
  | 'minus'
  | 'arrow-left'
  | 'arrow-right'
  | 'bell'
  | 'external-link'
  | 'loader'
  | 'calendar';

const iconVariants = cva('inline-block shrink-0', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type IconSize = NonNullable<VariantProps<typeof iconVariants>['size']>;

export interface IconProps {
  name: IconName;
  size?: IconSize;
  label?: string;
  className?: string;
}

export function Icon({ name, size = 'md', label, className }: IconProps) {
  const path = iconPaths[name];

  return (
    <svg
      className={cn(iconVariants({ size }), className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {path && <path d={path} />}
    </svg>
  );
}
