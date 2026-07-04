import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Compound tabbed view built on `@radix-ui/react-tabs`.
 *
 * Two visual variants — `segmented` (pill switcher inside a bordered
 * track) and `underline` (classic tab strip) — and two sizes (`sm` /
 * `md`). Variant + size are set on the root `Tabs` and shared with
 * descendant `TabsList` / `TabsTrigger` via context, so triggers
 * follow the active style without per-call repetition.
 *
 * Accessibility: roving focus, arrow-key navigation, and the
 * `tab` / `tabpanel` / `tablist` roles all come from Radix.
 *
 * @example Segmented tabs (default)
 * ```tsx
 * <Tabs defaultValue="profile">
 *   <TabsList>
 *     <TabsTrigger value="profile">Profile</TabsTrigger>
 *     <TabsTrigger value="security">Security</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="profile">…</TabsContent>
 *   <TabsContent value="security">…</TabsContent>
 * </Tabs>
 * ```
 *
 * @example Underline variant for in-page sections
 * ```tsx
 * <Tabs variant="underline" defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="activity">Activity</TabsTrigger>
 *   </TabsList>
 *   …
 * </Tabs>
 * ```
 *
 * @example Overflow-safe strip at mobile width
 * ```tsx
 * <Tabs overflow="scroll" variant="underline" defaultValue="pages">
 *   <TabsList aria-label="Analytics view">
 *     <TabsTrigger value="pages">Pages</TabsTrigger>
 *     <TabsTrigger value="sources">Sources</TabsTrigger>
 *     <TabsTrigger value="countries">Countries</TabsTrigger>
 *     <TabsTrigger value="browsers">Browsers</TabsTrigger>
 *     <TabsTrigger value="os">OS</TabsTrigger>
 *     <TabsTrigger value="devices">Devices</TabsTrigger>
 *   </TabsList>
 *   …
 * </Tabs>
 * ```
 */

export type TabsVariant = 'segmented' | 'underline';
export type TabsSize = 'sm' | 'md';
export type TabsOverflow = 'visible' | 'scroll';

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
  overflow: TabsOverflow;
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'segmented',
  size: 'md',
  overflow: 'visible',
});

/**
 * Props for the {@link Tabs} root.
 *
 * Inherits `value`, `defaultValue`, `onValueChange`, `orientation`,
 * `dir`, `activationMode`, etc. from Radix `Tabs.Root`.
 */
export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  /** Visual style. `segmented` is a pill switcher; `underline` is a classic tab strip. Defaults to `segmented`. */
  variant?: TabsVariant;
  /** Size scale shared with descendant triggers. `sm` for dense UIs, `md` (default) otherwise. */
  size?: TabsSize;
  /**
   * How `TabsList` handles too-many-triggers-for-parent-width. `visible`
   * (default) keeps the historical behaviour — the list is `inline-flex`
   * and grows past the parent, which can push the viewport horizontally
   * on narrow screens. `scroll` caps the list at parent width, hides the
   * native scrollbar, and enables `scroll-snap` on each trigger for
   * a touch-friendly swipe. Use on any tabbed surface that can be
   * rendered at mobile width with more than ~4 short labels.
   */
  overflow?: TabsOverflow;
}

/**
 * Root of the tabbed view. Provides `variant`, `size`, and `overflow`
 * via context so `TabsList` and `TabsTrigger` style themselves to match.
 */
export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs(
  { variant = 'segmented', size = 'md', overflow = 'visible', children, ...props },
  ref,
) {
  const ctx = React.useMemo(
    () => ({ variant, size, overflow }),
    [variant, size, overflow],
  );
  return (
    <TabsContext.Provider value={ctx}>
      <TabsPrimitive.Root
        ref={ref}
        data-variant={variant}
        data-size={size}
        data-overflow={overflow}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      segmented: 'p-1 rounded-[var(--radius-md)] border border-border bg-background',
      underline: 'border-b border-border gap-4',
    },
    size: {
      sm: '',
      md: '',
    },
    overflow: {
      visible: '',
      // Cap the list at the parent's width, allow horizontal swipe,
      // hide the scrollbar chrome, and snap each trigger to the start
      // edge on release. Applied to the list itself so both variants'
      // borders (segmented's rounded track, underline's bottom rule)
      // continue to contain the scroll area.
      scroll:
        'max-w-full overflow-x-auto snap-x snap-mandatory ' +
        '[-ms-overflow-style:none] [scrollbar-width:none] ' +
        '[&::-webkit-scrollbar]:hidden [&>*]:snap-start',
    },
  },
  defaultVariants: {
    overflow: 'visible',
  },
});

/**
 * Container for {@link TabsTrigger}s. Picks up `variant` from context
 * to apply either the segmented track or the underline rule.
 */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  const { variant, size, overflow } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, size, overflow }), className)}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center font-medium whitespace-nowrap',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        segmented: [
          'rounded-[var(--radius-sm)] text-muted-foreground',
          'data-[state=active]:bg-foreground data-[state=active]:text-background',
          'hover:text-foreground data-[state=active]:hover:text-background',
        ].join(' '),
        underline: [
          '-mb-px border-b-2 border-transparent text-muted-foreground',
          'hover:text-foreground',
          'data-[state=active]:border-foreground data-[state=active]:text-foreground',
        ].join(' '),
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    compoundVariants: [
      { variant: 'segmented', size: 'sm', className: 'h-7 px-3' },
      { variant: 'segmented', size: 'md', className: 'h-8 px-4' },
      { variant: 'underline', size: 'sm', className: 'h-8 pb-1' },
      { variant: 'underline', size: 'md', className: 'h-10 pb-2' },
    ],
  },
);

/**
 * Single tab button. The `value` prop must match a {@link TabsContent}
 * `value`. Style flips between `segmented` and `underline` automatically
 * based on the parent {@link Tabs} root.
 */
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  const { variant, size } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

/**
 * Panel rendered when its `value` matches the active tab. Receives
 * `role="tabpanel"` and an `aria-labelledby` link to the trigger from
 * Radix.
 */
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
        className,
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

// Internal helper for tests to assert the variant cva covers the intended
// states. Not exported from the package barrel.
export const __tabsTriggerVariants = tabsTriggerVariants;

export type { VariantProps };
