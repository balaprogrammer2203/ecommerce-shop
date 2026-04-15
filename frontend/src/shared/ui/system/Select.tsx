import { forwardRef, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type SelectOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'size'
> & {
  label: string;
  options: SelectOption[];
  error?: boolean;
  helperText?: ReactNode;
  fullWidth?: boolean;
  id?: string;
};

const wrapCls = 'block';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, helperText, fullWidth = true, className, id, ...rest },
  ref,
) {
  const selectId = id ?? `select-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={cn(wrapCls, fullWidth && 'w-full', className)}>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-slate-100',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
        )}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText != null ? (
        <p className={cn('mt-1 text-sm', error ? 'text-red-600' : 'text-slate-500')}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
