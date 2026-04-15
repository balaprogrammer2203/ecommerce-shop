import { forwardRef, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

const fieldCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-slate-100 disabled:text-slate-500';

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: ReactNode;
  fullWidth?: boolean;
  multiline?: boolean;
  minRows?: number;
  inputClassName?: string;
};

export const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(function Input(
  {
    fullWidth = true,
    error,
    errorMessage,
    helperText,
    label,
    id,
    className,
    inputClassName,
    multiline,
    minRows = 3,
    ...rest
  },
  ref,
) {
  const hasError = Boolean(error);
  const resolvedHelper = hasError && errorMessage != null ? errorMessage : helperText;
  const inputId = id ?? (label ? `field-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={cn(fullWidth ? 'w-full' : '', className)}>
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-800">
          {label}
        </label>
      ) : null}
      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={inputId}
          rows={minRows}
          className={cn(
            fieldCls,
            'min-h-[80px] resize-y',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            inputClassName,
          )}
          aria-invalid={hasError}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={inputId}
          className={cn(
            fieldCls,
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            inputClassName,
          )}
          aria-invalid={hasError}
          {...rest}
        />
      )}
      {resolvedHelper != null ? (
        <p className={cn('mt-1 text-sm', hasError ? 'text-red-600' : 'text-slate-500')}>
          {resolvedHelper}
        </p>
      ) : null}
    </div>
  );
});
