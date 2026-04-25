import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  [
    'inline-flex items-center justify-center shrink-0',
    'rounded-full overflow-hidden',
    'select-none font-semibold leading-none',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-7 w-7 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-12 w-12 text-base',
      },
      variant: {
        neutral: 'bg-secondary text-foreground',
        brand:
          'bg-[var(--color-interactive-brand-bg)] text-[var(--color-interactive-brand-fg)]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'neutral',
    },
  },
);

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;
export type AvatarVariant = NonNullable<VariantProps<typeof avatarVariants>['variant']>;

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role' | 'aria-label'>,
    VariantProps<typeof avatarVariants> {
  /** Required accessible name. Avatar is identity, not decorative. */
  alt: string;
  /** Optional image source. Falls back to initials if missing or fails to load. */
  src?: string;
  /** Source for initials when no image. Defaults to `alt`. */
  name?: string;
  /** Explicit initials override (skips derivation). */
  initials?: string;
}

/**
 * Derive up to 2 initial characters from a name.
 * - "Jens Wedin" → "JW"
 * - "Jens Aron Wedin" → "JA" (first two words)
 * - "M" → "M"
 * - "" → ""
 */
function deriveInitials(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { alt, src, name, initials, size = 'md', variant = 'neutral', className, ...rest },
  ref,
) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = !!src && !imageFailed;
  const fallback = initials ?? deriveInitials(name ?? alt);

  return (
    <span
      ref={ref}
      role="img"
      aria-label={alt}
      className={cn(avatarVariants({ size, variant }), className)}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </span>
  );
});

Avatar.displayName = 'Avatar';
