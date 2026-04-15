import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type ShopBadgeTone = 'sale' | 'new' | 'lowStock' | 'neutral' | 'success';

export type BadgeProps = {
  label: ReactNode;
  tone?: ShopBadgeTone;
  className?: string;
  size?: 'small' | 'medium';
};

const toneCls: Record<ShopBadgeTone, string> = {
  sale: 'bg-red-600 text-white',
  new: 'bg-primary text-white',
  lowStock: 'bg-amber-500 text-white',
  neutral: 'border border-slate-300 bg-white text-slate-700',
  success: 'bg-emerald-600 text-white',
};

export const Badge = ({ tone = 'neutral', label, size = 'small', className }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
        size === 'medium' && 'px-2 py-1 text-xs',
        toneCls[tone],
        className,
      )}
    >
      {label}
    </span>
  );
};
