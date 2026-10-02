import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';
import { Icon, type IconName } from '@/components/Icon';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/Popover';
import { Separator } from '@/components/Separator';

/**
 * Internal to AppHeader (STU-1001) — not exported from the barrel. The
 * public surface is `AppHeaderUser.menuItems` / `menuLabel` / `themeInMenu`.
 *
 * Composes the DS `Popover` (positioning, outside-click + Escape dismissal,
 * focus return) and layers the WAI-ARIA menu-button pattern on top:
 * `aria-haspopup="menu"` trigger, `role="menu"` list of `role="menuitem"`s
 * with roving focus (Arrow/Home/End, wrap), Tab closes.
 */

export interface UserMenuEntry {
  label: string;
  onSelect?: () => void;
  href?: string;
  icon?: IconName;
  active?: boolean;
  /** Keep the menu open after activation (used by the theme item). */
  keepOpen?: boolean;
}

export interface UserMenuProps {
  triggerLabel: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  initialsSource: string;
  active?: boolean;
  items: UserMenuEntry[];
  /** Rendered after a separator, e.g. sign-out. */
  footerItems: UserMenuEntry[];
}

const itemCls = cn(
  'flex w-full items-center gap-2 px-2 py-2 text-sm text-left rounded-[var(--radius-sm)]',
  'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
  'focus:outline-none focus-visible:bg-accent focus-visible:text-accent-foreground',
  'focus-visible:ring-2 focus-visible:ring-ring',
  'aria-[current=page]:font-semibold',
);

type FocusTarget = 'first' | 'last';

function MenuItem({
  item,
  onActivate,
}: {
  item: UserMenuEntry;
  onActivate: (item: UserMenuEntry) => void;
}): React.ReactElement {
  const content = (
    <>
      {item.icon ? <Icon name={item.icon} size="sm" aria-hidden /> : null}
      <span className="truncate">{item.label}</span>
    </>
  );
  const common = {
    role: 'menuitem' as const,
    tabIndex: -1,
    className: itemCls,
    ...(item.active ? { 'aria-current': 'page' as const } : {}),
  };
  if (item.href != null) {
    return (
      <a
        {...common}
        href={item.href}
        onClick={() => onActivate(item)}
        onKeyDown={(e) => {
          // Links don't activate on Space natively; menuitems must.
          if (e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <button {...common} type="button" onClick={() => onActivate(item)}>
      {content}
    </button>
  );
}

export function UserMenu({
  triggerLabel,
  name,
  email,
  avatarUrl,
  initialsSource,
  active,
  items,
  footerItems,
}: UserMenuProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const focusTarget = React.useRef<FocusTarget>('first');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerId = React.useId();

  const getItems = (): HTMLElement[] =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const focusAt = (index: number) => {
    const list = getItems();
    if (list.length === 0) return;
    const i = ((index % list.length) + list.length) % list.length;
    list[i].focus();
  };

  const onActivate = (item: UserMenuEntry) => {
    item.onSelect?.();
    if (!item.keepOpen) setOpen(false);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusTarget.current = e.key === 'ArrowDown' ? 'first' : 'last';
      if (open) {
        focusAt(focusTarget.current === 'first' ? 0 : -1);
      } else {
        setOpen(true);
      }
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = getItems();
    const current = list.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusAt(current + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusAt(current < 0 ? -1 : current - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAt(0);
        break;
      case 'End':
        e.preventDefault();
        focusAt(-1);
        break;
      case 'Tab':
        // Menu-button pattern: Tab closes the menu. Focus returns to the
        // trigger (Popover's close auto-focus) rather than jumping to the
        // end of <body>, where the portalled panel lives.
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={triggerId}
          type="button"
          aria-haspopup="menu"
          aria-label={triggerLabel}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            'inline-flex rounded-full overflow-hidden',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-border',
            'motion-safe:transition-shadow',
          )}
        >
          <Avatar alt={triggerLabel} src={avatarUrl} name={initialsSource} size="sm" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // The panel is a plain container: the header sits outside the
        // role="menu" element, which may only own menuitems/separators.
        role={undefined}
        className="w-64 p-1"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          focusAt(focusTarget.current === 'first' ? 0 : -1);
          focusTarget.current = 'first';
        }}
      >
        {name || email ? (
          <>
            <div className="flex flex-col px-2 py-2 min-w-0 leading-tight">
              {name ? <span className="text-sm font-medium truncate">{name}</span> : null}
              {email ? (
                <span className="text-xs text-muted-foreground truncate">{email}</span>
              ) : null}
            </div>
            <Separator decorative className="my-1" />
          </>
        ) : null}
        <div
          ref={menuRef}
          role="menu"
          aria-labelledby={triggerId}
          aria-orientation="vertical"
          onKeyDown={onMenuKeyDown}
          className="flex flex-col"
        >
          {items.map((item) => (
            <MenuItem key={item.label} item={item} onActivate={onActivate} />
          ))}
          {footerItems.length > 0 ? (
            <>
              {items.length > 0 ? <Separator className="my-1" /> : null}
              {footerItems.map((item) => (
                <MenuItem key={item.label} item={item} onActivate={onActivate} />
              ))}
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
