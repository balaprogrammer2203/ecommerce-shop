import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type PageLoaderProps = {
  message?: ReactNode;
  fullViewport?: boolean;
  className?: string;
};

export const PageLoader = ({ message, fullViewport = true, className }: PageLoaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10',
        fullViewport ? 'min-h-[40vh]' : 'min-h-[120px]',
        className,
      )}
    >
      <span
        className="inline-block size-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent"
        aria-hidden
      />
      {message != null ? (
        <p className="max-w-xs text-center text-sm text-slate-600">{message}</p>
      ) : null}
    </div>
  );
};

export type InlineLoaderProps = {
  label?: ReactNode;
  size?: number;
};

export const InlineLoader = ({ label, size = 24 }: InlineLoaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block animate-spin rounded-full border-2 border-primary border-t-transparent"
        style={{ width: size, height: size }}
        aria-hidden
      />
      {label != null ? <span className="text-sm text-slate-600">{label}</span> : null}
    </div>
  );
};

export type ProductCardSkeletonProps = {
  imageHeight?: number;
};

export const ProductCardSkeleton = ({ imageHeight = 160 }: ProductCardSkeletonProps) => {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg bg-slate-200" style={{ height: imageHeight }} />
      <div className="mt-3 flex flex-col gap-2">
        <div className="h-7 w-[70%] rounded bg-slate-200" />
        <div className="h-4 w-2/5 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  );
};
