import { TextField, type TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export type InputProps = TextFieldProps & {
  /** Shown when `error` is true; maps to `helperText` if you only pass this */
  errorMessage?: string;
};

/**
 * Form field — thin wrapper around MUI `TextField` with defaults for storefront forms.
 */
export const Input = forwardRef<HTMLDivElement, InputProps>(function Input(
  {
    fullWidth = true,
    size = 'medium',
    variant = 'outlined',
    error,
    errorMessage,
    helperText,
    ...rest
  },
  ref,
) {
  const hasError = Boolean(error);
  const resolvedHelper = hasError && errorMessage != null ? errorMessage : helperText;

  return (
    <TextField
      ref={ref}
      fullWidth={fullWidth}
      size={size}
      variant={variant}
      error={hasError}
      helperText={resolvedHelper}
      {...rest}
    />
  );
});
