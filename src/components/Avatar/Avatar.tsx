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

/**
 * Props for the {@link Avatar} component.
 *
 * Inherits standard `<span>` attributes (e.g. `id`, `data-*`,
 * `onClick`) via `React.HTMLAttributes`, except `role` and `aria-label`
 * which the component sets internally.
 */
export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role' | 'aria-label'>,
    VariantProps<typeof avatarVariants> {
  /**
   * Required accessible name. Avatar represents identity, not decoration —
   * pass the person or account name (e.g. "Jens Wedin", "Account: Acme Co.").
   * Read aloud as the avatar's label by assistive tech.
   */
  alt: string;
  /**
   * Optional image URL. If missing or it fails to load, falls back to
   * initials derived from `name` / `alt` or the explicit `initials` prop.
   */
  src?: string;
  /**
   * Source string for initial derivation when no image is shown. Defaults
   * to `alt`. Use this when the displayed initials should differ from the
   * accessible name (e.g. derive from "Acme Co." while labelling as
   * "Account: Acme Co.").
   */
  name?: string;
  /**
   * Override the derived initials with an explicit string. Use sparingly —
   * the default derivation handles most cases.
   */
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

/**
 * Compact identity badge — a person or account represented by an image
 * with an initials fallback.
 *
 * Three sizes (`sm` 28px, `md` 36px, `lg` 48px) and two variants
 * (`neutral` for most cases, `brand` for the user's own account /
 * primary identity slot).
 *
 * Accessibility:
 * - Renders as a `<span role="img">` with `aria-label={alt}`. The image
 *   itself is `aria-hidden` because the wrapping `role="img"` already
 *   carries the accessible name.
 * - Initials are decorative; never communicate meaning through them
 *   alone.
 *
 * @example Image with initials fallback
 * ```tsx
 * <Avatar alt="Jens Wedin" src="/me.jpg" name="Jens Wedin" />
 * ```
 *
 * @example Initials only
 * ```tsx
 * <Avatar alt="Acme Co." name="Acme Co." variant="brand" />
 * ```
 */
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
