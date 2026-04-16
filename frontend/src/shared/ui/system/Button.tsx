import { forwardRef, type MouseEventHandler, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../../lib/cn';

export type ShopButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ShopButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'disabled'
> & {
  shopVariant?: ShopButtonVariant;
  loading?: boolean;
  to?: string;
  /** Passed through when `to` is set (React Router `<Link />`). */
  state?: object;
  replace?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  startIcon?: ReactNode;
  className?: string;
};

const sizeCls: Record<NonNullable<ShopButtonProps['size']>, string> = {
  small: 'text-sm px-3 py-1.5 min-h-9 gap-1.5',
  medium: 'text-sm px-4 py-2 min-h-[42px] gap-2',
  large: 'text-base px-5 py-2.5 min-h-12 gap-2',
};

const variantCls: Record<ShopButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary/92 active:bg-primary/85 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-primary/20',
  secondary:
    'bg-white text-primary border-2 border-primary hover:bg-slate-50 active:bg-slate-100 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  ghost:
    'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/15 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 border border-red-700/30',
};

const Spinner = () => (
  <span
    className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    aria-hidden
  />
);

const baseCls =
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50';

export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ShopButtonProps>(
  function Button(
    {
      shopVariant = 'primary',
      loading = false,
      disabled,
      children,
      startIcon,
      className,
      to,
      state,
      replace,
      fullWidth,
      size = 'medium',
      type = 'button',
      onClick,
      ...rest
    },
    ref,
  ) {
    const content = (
      <>
        {loading ? <Spinner /> : startIcon}
        {children}
      </>
    );

    const cls = cn(
      baseCls,
      sizeCls[size],
      variantCls[shopVariant],
      fullWidth && 'w-full',
      className,
    );

    if (to) {
      const blocked = Boolean(disabled || loading);
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={to}
          state={state}
          replace={replace}
          className={cn(cls, blocked && 'pointer-events-none opacity-50')}
          aria-disabled={blocked}
          tabIndex={blocked ? -1 : undefined}
          onClick={
            blocked
              ? (e) => {
                  e.preventDefault();
                }
              : (onClick as MouseEventHandler<HTMLAnchorElement> | undefined)
          }
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={cls}
        disabled={disabled || loading}
        onClick={onClick}
        {...rest}
      >
        {content}
      </button>
    );
  },
);
