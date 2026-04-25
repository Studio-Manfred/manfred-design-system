import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Tabs — token-styled wrapper around `@radix-ui/react-tabs`. Two visual
 * variants ("segmented" pill switcher, "underline" classic tabs) + two sizes
 * (sm / md). Variant + size are set on the root `Tabs` and consumed by
 * descendant `TabsList` / `TabsTrigger` via context so the trigger can react
 * to the active style without each caller re-passing the props.
 */

export type TabsVariant = 'segmented' | 'underline';
export type TabsSize = 'sm' | 'md';

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'segmented',
  size: 'md',
});

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant;
  size?: TabsSize;
}

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs({ variant = 'segmented', size = 'md', children, ...props }, ref) {
  const ctx = React.useMemo(() => ({ variant, size }), [variant, size]);
  return (
    <TabsContext.Provider value={ctx}>
      <TabsPrimitive.Root ref={ref} data-variant={variant} data-size={size} {...props}>
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
  },
});

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  const { variant, size } = React.useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, size }), className)}
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
