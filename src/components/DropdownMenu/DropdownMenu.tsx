import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/Popover';
import { Separator, type SeparatorProps } from '@/components/Separator';

/**
 * Compound actions menu (STU-1012), extracted from the AppHeader user menu
 * (STU-1001) so both share one implementation.
 *
 * Composes the DS `Popover` (positioning, portal, outside-click + Escape
 * dismissal, focus return to the trigger) and layers the WAI-ARIA
 * menu-button pattern on top: an `aria-haspopup="menu"` trigger with
 * `aria-expanded`, a `role="menu"` list of `role="menuitem"`s with roving
 * focus (Arrow / Home / End with wrap, disabled items skipped), typeahead,
 * and Tab closes.
 */

type FocusTarget = 'first' | 'last';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  /** Which item to focus when the panel opens (set by the trigger's arrow keys). */
  focusTarget: React.MutableRefObject<FocusTarget>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu(part: string): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error(`<${part}> must be used within <DropdownMenu>.`);
  return ctx;
}

function enabledItems(menu: HTMLElement | null): HTMLElement[] {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
  );
}

function focusAt(menu: HTMLElement | null, index: number): void {
  const list = enabledItems(menu);
  if (list.length === 0) return;
  const i = ((index % list.length) + list.length) % list.length;
  list[i].focus();
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

/** Props for {@link DropdownMenu}. */
export interface DropdownMenuProps {
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes (trigger, item select, Escape, Tab, outside click). */
  onOpenChange?: (open: boolean) => void;
  /** A `DropdownMenuTrigger` and a `DropdownMenuContent`. */
  children?: React.ReactNode;
}

/**
 * Root of an actions menu behind a trigger (STU-1012).
 *
 * Compose `DropdownMenu` + `DropdownMenuTrigger` + `DropdownMenuContent`,
 * with `DropdownMenuItem`s, optional `DropdownMenuLabel`s and
 * `DropdownMenuSeparator`s inside the content.
 *
 * Keyboard: Enter / Space / ArrowDown on the trigger open the menu and focus
 * the first item (ArrowUp focuses the last); arrows, Home and End move
 * (wrapping, skipping disabled items); typing jumps to the next item that
 * starts with the typed characters; Enter / Space select; Escape and Tab
 * close and return focus to the trigger.
 *
 * @example "…" actions on a list item
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="ghost" size="sm" aria-label="Board actions for Markus">…</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent align="end">
 *     <DropdownMenuItem onSelect={rename}>Rename</DropdownMenuItem>
 *     <DropdownMenuItem onSelect={archive}>Archive</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive" onSelect={remove}>Delete board</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
function DropdownMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: DropdownMenuProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const triggerId = React.useId();
  const focusTarget = React.useRef<FocusTarget>('first');
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const value = React.useMemo(
    () => ({ open, setOpen, triggerId, focusTarget, menuRef }),
    [open, setOpen, triggerId],
  );
  return (
    <DropdownMenuContext.Provider value={value}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </DropdownMenuContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

/** Props for {@link DropdownMenuTrigger}. Extends native `<button>` attributes. */
export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Render the single child element as the trigger (e.g. a DS `Button` or an
   * icon button) instead of a plain `<button>`. Give an icon-only trigger an
   * `aria-label` — it also names the menu.
   */
  asChild?: boolean;
}

/**
 * The element that opens the menu. Gets `aria-haspopup="menu"`,
 * `aria-expanded` and the id that names the menu.
 */
const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ onKeyDown, ...props }, ref) {
    const ctx = useDropdownMenu('DropdownMenuTrigger');
    return (
      <PopoverTrigger
        ref={ref}
        {...props}
        id={ctx.triggerId}
        aria-haspopup="menu"
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          ctx.focusTarget.current = e.key === 'ArrowDown' ? 'first' : 'last';
          if (ctx.open) {
            focusAt(ctx.menuRef.current, ctx.focusTarget.current === 'first' ? 0 : -1);
          } else {
            ctx.setOpen(true);
          }
        }}
      />
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Panel + list (internal building blocks; Content = Panel + List)            */
/* -------------------------------------------------------------------------- */

/** Props for {@link DropdownMenuContent}. */
export interface DropdownMenuContentProps {
  /** Alignment against the trigger. `"start"` by default; use `"end"` for a "…" button at the right edge. */
  align?: 'start' | 'center' | 'end';
  /** Preferred side of the trigger. `"bottom"` by default; flips when there is no room. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Distance from the trigger in px. Defaults to `4`. */
  sideOffset?: number;
  /** Extra classes for the floating panel. */
  className?: string;
  /** `DropdownMenuItem`s, `DropdownMenuLabel`s and `DropdownMenuSeparator`s. */
  children?: React.ReactNode;
}

/**
 * Internal: the floating panel. Focuses the first (or last) enabled item on
 * open. Not exported from the barrel — AppHeader's user menu uses it to put
 * a name/email header outside the `role="menu"` element.
 */
export function DropdownMenuPanel({
  align = 'start',
  side,
  sideOffset = 4,
  className,
  children,
}: DropdownMenuContentProps): React.ReactElement {
  const ctx = useDropdownMenu('DropdownMenuContent');
  return (
    <PopoverContent
      align={align}
      side={side}
      sideOffset={sideOffset}
      // A plain container: role="menu" sits on the list inside it.
      role={undefined}
      className={cn('w-auto min-w-48 p-1', className)}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        focusAt(ctx.menuRef.current, ctx.focusTarget.current === 'first' ? 0 : -1);
        ctx.focusTarget.current = 'first';
      }}
    >
      {children}
    </PopoverContent>
  );
}

const TYPEAHEAD_RESET_MS = 500;

/**
 * Internal: the `role="menu"` element with roving focus, typeahead and
 * Tab-to-close. Named by the trigger.
 */
export function DropdownMenuList({ children }: { children?: React.ReactNode }): React.ReactElement {
  const ctx = useDropdownMenu('DropdownMenuContent');
  const buffer = React.useRef('');
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const typeahead = (key: string) => {
    buffer.current += key.toLowerCase();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      buffer.current = '';
    }, TYPEAHEAD_RESET_MS);

    const list = enabledItems(ctx.menuRef.current);
    const current = list.indexOf(document.activeElement as HTMLElement);
    const typed = buffer.current;
    // Repeating one character cycles through items starting with it.
    const repeat = typed.split('').every((c) => c === typed[0]);
    const search = repeat ? typed[0] : typed;
    const start = repeat ? current + 1 : Math.max(current, 0);
    for (let n = 0; n < list.length; n++) {
      const item = list[(start + n) % list.length];
      if ((item.textContent ?? '').trim().toLowerCase().startsWith(search)) {
        item.focus();
        return;
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = enabledItems(ctx.menuRef.current);
    const current = list.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusAt(ctx.menuRef.current, current + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusAt(ctx.menuRef.current, current < 0 ? -1 : current - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAt(ctx.menuRef.current, 0);
        break;
      case 'End':
        e.preventDefault();
        focusAt(ctx.menuRef.current, -1);
        break;
      case 'Tab':
        // Menu-button pattern: Tab closes the menu. Focus returns to the
        // trigger (Popover's close auto-focus) rather than jumping to the
        // end of <body>, where the portalled panel lives.
        e.preventDefault();
        ctx.setOpen(false);
        break;
      default:
        if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          typeahead(e.key);
        }
        break;
    }
  };

  return (
    <div
      ref={ctx.menuRef}
      role="menu"
      aria-labelledby={ctx.triggerId}
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
      className="flex flex-col"
    >
      {children}
    </div>
  );
}

/**
 * The floating menu panel, portalled to `body` on the popover surface
 * tokens. It is the `role="menu"` element, named by the trigger.
 */
function DropdownMenuContent({ children, ...props }: DropdownMenuContentProps): React.ReactElement {
  return (
    <DropdownMenuPanel {...props}>
      <DropdownMenuList>{children}</DropdownMenuList>
    </DropdownMenuPanel>
  );
}

/* -------------------------------------------------------------------------- */
/* Item                                                                       */
/* -------------------------------------------------------------------------- */

/** Visual style of a {@link DropdownMenuItem}. */
export type DropdownMenuItemVariant = 'default' | 'destructive';

/**
 * Props for {@link DropdownMenuItem}. Extends native `<button>` attributes
 * except the DOM `onSelect`, which is replaced by the menu's `onSelect`.
 */
export interface DropdownMenuItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  /**
   * Called when the item is chosen (click, Enter, Space). The menu then
   * closes and focus returns to the trigger — call `event.preventDefault()`
   * to keep it open (e.g. a toggle).
   */
  onSelect?: (event: Event) => void;
  /** Disable the item: `aria-disabled`, dimmed, skipped by the keyboard, `onSelect` not called. */
  disabled?: boolean;
  /**
   * `"destructive"` colours the item with the error tokens. Colour is not
   * the only signal — the label must say what happens ("Delete board").
   */
  variant?: DropdownMenuItemVariant;
  /** Leading icon (e.g. a DS `<Icon>`). Decorative: hidden from assistive tech. */
  icon?: React.ReactNode;
  /**
   * Render the single child as the item — e.g. an `<a href>` or a router
   * `<Link>` for a navigation item. Space activates links too. The child is
   * rendered as-is, so `icon` is ignored — put the icon inside the child.
   */
  asChild?: boolean;
}

const itemClasses = cn(
  'flex w-full items-center gap-2 px-2 py-2 text-sm text-left rounded-[var(--radius-sm)] cursor-pointer select-none',
  'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
  'focus:outline-none focus:bg-accent focus:text-accent-foreground',
  'focus-visible:ring-2 focus-visible:ring-ring',
  'aria-[current=page]:font-semibold',
  'data-[variant=destructive]:text-[var(--color-feedback-error-fg)]',
  'data-[variant=destructive]:hover:bg-[var(--color-feedback-error-bg)] data-[variant=destructive]:hover:text-[var(--color-feedback-error-fg)]',
  'data-[variant=destructive]:focus:bg-[var(--color-feedback-error-bg)] data-[variant=destructive]:focus:text-[var(--color-feedback-error-fg)]',
  'aria-disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none',
);

/** One action in the menu. A `role="menuitem"` `<button>` by default. */
const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    {
      onSelect,
      disabled = false,
      variant = 'default',
      icon,
      asChild = false,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const ctx = useDropdownMenu('DropdownMenuItem');
    const Comp: React.ElementType = asChild ? Slot : 'button';
    const content = asChild ? (
      children
    ) : (
      <>
        {icon ? (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {icon}
          </span>
        ) : null}
        <span className="truncate">{children}</span>
      </>
    );
    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: 'button' as const })}
        {...props}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-variant={variant}
        className={cn(itemClasses, className)}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (disabled) {
            e.preventDefault();
            return;
          }
          const event = new CustomEvent('dropdownmenu.select', { cancelable: true });
          onSelect?.(event);
          if (!event.defaultPrevented) ctx.setOpen(false);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(e);
          // Links don't activate on Space natively; menuitems must.
          if (e.key === ' ' && e.currentTarget.tagName !== 'BUTTON') {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
      >
        {content}
      </Comp>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* Separator + Label                                                          */
/* -------------------------------------------------------------------------- */

/** Props for {@link DropdownMenuSeparator}. Same as the DS `Separator`, minus `orientation`. */
export type DropdownMenuSeparatorProps = Omit<SeparatorProps, 'orientation'>;

/** A `role="separator"` rule between groups of items. */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <Separator ref={ref} className={cn('my-1', className)} {...props} />;
});

/** Props for {@link DropdownMenuLabel}. Native `<div>` attributes. */
export type DropdownMenuLabelProps = React.HTMLAttributes<HTMLDivElement>;

/** A small, muted, non-interactive heading for a group of items (e.g. the board name). */
const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground truncate', className)}
        {...props}
      />
    );
  },
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
