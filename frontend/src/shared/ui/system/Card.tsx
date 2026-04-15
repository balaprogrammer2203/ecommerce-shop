import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type ShopCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  contentPaddingClass?: string;
};

export const Card = ({
  title,
  subtitle,
  children,
  footer,
  contentPaddingClass = 'p-4',
  className,
  ...rest
}: ShopCardProps) => {
  const hasHeader = title != null || subtitle != null;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm',
        className,
      )}
      {...rest}
    >
      {hasHeader ? (
        <div className={cn(contentPaddingClass, 'pb-2 pt-4')}>
          <div className="flex flex-col gap-0.5">
            {title != null ? <div className="text-lg font-bold text-slate-900">{title}</div> : null}
            {subtitle != null ? <div className="text-sm text-slate-600">{subtitle}</div> : null}
          </div>
        </div>
      ) : null}

      {hasHeader && children != null ? (
        <>
          <div className="mx-4 border-t border-slate-100" />
          <div className={cn(contentPaddingClass, 'py-4')}>{children}</div>
        </>
      ) : (
        <div className={cn(contentPaddingClass)}>{children}</div>
      )}

      {footer != null ? (
        <>
          <div className="border-t border-slate-100" />
          <div className={cn(contentPaddingClass, 'flex justify-end py-3')}>{footer}</div>
        </>
      ) : null}
    </div>
  );
};
