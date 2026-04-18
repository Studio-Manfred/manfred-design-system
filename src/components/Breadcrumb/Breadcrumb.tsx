import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash';
  className?: string;
}

export function Breadcrumb({ items, separator = 'chevron', className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="text-muted-foreground flex items-center" aria-hidden="true">
                  {separator === 'chevron' ? (
                    <Icon name="chevron-right" size="xs" />
                  ) : (
                    <span className="text-muted-foreground">/</span>
                  )}
                </li>
              )}
              <li className="flex items-center">
                {isLast ? (
                  <span className="font-semibold text-foreground" aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
