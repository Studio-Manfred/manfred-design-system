import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('font-sans m-0', {
  variants: {
    variant: {
      headline1: 'text-[3.5rem] font-extrabold leading-[1.1] tracking-[-0.02em]',
      headline2: 'text-[2.5rem] font-extrabold leading-[1.1] tracking-[-0.02em]',
      headline3: 'text-[2rem] font-extrabold leading-[1.3]',
      headline4: 'text-2xl font-extrabold leading-[1.3]',
      large: 'text-xl font-light leading-[1.5]',
      body: 'text-base font-normal leading-[1.7]',
      bodySmall: 'text-sm font-normal leading-[1.7]',
      label: 'text-sm font-semibold leading-[1.5]',
      caption: 'text-xs font-normal leading-[1.5]',
    },
    color: {
      default: 'text-foreground',
      inverse: 'text-[var(--color-text-inverse)]',
      brand: 'text-[var(--color-brand-primary)]',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
  },
});

export type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>['variant']>;
export type TypographyColor = NonNullable<VariantProps<typeof typographyVariants>['color']>;

type TypographyAs =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div' | 'label';

export interface TypographyProps {
  variant: TypographyVariant;
  as?: TypographyAs;
  color?: TypographyColor;
  children: React.ReactNode;
  className?: string;
}

const defaultElement: Record<TypographyVariant, TypographyAs> = {
  headline1: 'h1',
  headline2: 'h2',
  headline3: 'h3',
  headline4: 'h4',
  large:     'p',
  body:      'p',
  bodySmall: 'p',
  label:     'span',
  caption:   'span',
};

export function Typography({
  variant,
  as,
  color = 'default',
  children,
  className,
}: TypographyProps) {
  const Tag = as ?? defaultElement[variant];

  return (
    <Tag className={cn(typographyVariants({ variant, color }), className)}>
      {children}
    </Tag>
  );
}
