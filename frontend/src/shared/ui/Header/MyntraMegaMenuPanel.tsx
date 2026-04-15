import { Link as RouterLink } from 'react-router-dom';

import type { MyntraNavItem, NavBadge } from './myntraNavConfig';
import { cn } from '../../lib/cn';

const badgeLabel = (b: NavBadge): string => {
  if (b === 'new') return 'New';
  if (b === 'trending') return 'Trending';
  return 'Sale';
};

const badgeCls = (b: NavBadge): string => {
  if (b === 'sale') return 'bg-red-600 text-white';
  if (b === 'trending') return 'bg-amber-500 text-white';
  return 'bg-emerald-600 text-white';
};

type MyntraMegaMenuPanelProps = {
  item: MyntraNavItem;
  panelId: string;
  onNavigate: () => void;
};

export const MyntraMegaMenuPanel = ({ item, panelId, onNavigate }: MyntraMegaMenuPanelProps) => {
  return (
    <div
      id={panelId}
      role="region"
      aria-label={`${item.label} categories`}
      className="mx-auto max-w-screen-lg px-4 py-6 md:px-6"
    >
      <div
        className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        style={{ columnGap: '1.25rem', rowGap: '1.25rem' }}
      >
        {item.columns.map((col) => (
          <div key={col.title}>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-900">
              {col.title.toUpperCase()}
            </p>
            <div className="flex flex-col gap-1.5">
              {col.links.map((link) => (
                <div key={`${col.title}-${link.label}`} className="flex items-center gap-1.5">
                  <RouterLink
                    to={link.href}
                    onClick={onNavigate}
                    className="text-[13px] text-slate-600 transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {link.label}
                  </RouterLink>
                  {link.badge ? (
                    <span
                      className={cn(
                        'inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-extrabold uppercase',
                        badgeCls(link.badge),
                      )}
                    >
                      {badgeLabel(link.badge)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
