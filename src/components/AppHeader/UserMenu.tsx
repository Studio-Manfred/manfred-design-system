import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';
import { Icon, type IconName } from '@/components/Icon';
import { Separator } from '@/components/Separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPanel,
  DropdownMenuList,
} from '@/components/DropdownMenu/DropdownMenu';

/**
 * Internal to AppHeader (STU-1001) — not exported from the barrel. The
 * public surface is `AppHeaderUser.menuItems` / `menuLabel` / `themeInMenu`.
 *
 * Built on the DS `DropdownMenu` (STU-1012), which was extracted from this
 * file: it owns the menu-button pattern (trigger ARIA, roving focus,
 * typeahead, Tab/Escape close, focus return). This file only maps
 * `UserMenuEntry`s onto `DropdownMenuItem`s and adds the name/email header
 * outside the `role="menu"` element via the internal Panel/List split.
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

function MenuEntry({ item }: { item: UserMenuEntry }): React.ReactElement {
  const icon = item.icon ? <Icon name={item.icon} size="sm" aria-hidden /> : null;
  const shared = {
    onSelect: (e: Event) => {
      item.onSelect?.();
      if (item.keepOpen) e.preventDefault();
    },
    ...(item.active ? { 'aria-current': 'page' as const } : {}),
  };
  if (item.href != null) {
    // asChild items render their child as-is, so the link carries the icon.
    return (
      <DropdownMenuItem {...shared} asChild>
        <a href={item.href}>
          {icon}
          <span className="truncate">{item.label}</span>
        </a>
      </DropdownMenuItem>
    );
  }
  return (
    <DropdownMenuItem {...shared} icon={icon}>
      {item.label}
    </DropdownMenuItem>
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={triggerLabel}
        className={cn(
          'inline-flex rounded-full overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-border',
          'motion-safe:transition-shadow',
        )}
      >
        <Avatar alt={triggerLabel} src={avatarUrl} name={initialsSource} size="sm" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuPanel align="end" className="w-64">
        {name || email ? (
          <>
            {/* The header sits outside role="menu", which may only own menuitems/separators. */}
            <div className="flex flex-col px-2 py-2 min-w-0 leading-tight">
              {name ? <span className="text-sm font-medium truncate">{name}</span> : null}
              {email ? (
                <span className="text-xs text-muted-foreground truncate">{email}</span>
              ) : null}
            </div>
            <Separator decorative className="my-1" />
          </>
        ) : null}
        <DropdownMenuList>
          {items.map((item) => (
            <MenuEntry key={item.label} item={item} />
          ))}
          {footerItems.length > 0 ? (
            <>
              {items.length > 0 ? <DropdownMenuSeparator /> : null}
              {footerItems.map((item) => (
                <MenuEntry key={item.label} item={item} />
              ))}
            </>
          ) : null}
        </DropdownMenuList>
      </DropdownMenuPanel>
    </DropdownMenu>
  );
}
