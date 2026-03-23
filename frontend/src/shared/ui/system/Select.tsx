import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  type SelectProps as MuiSelectProps,
} from '@mui/material';
import { forwardRef, type ReactNode } from 'react';

export type SelectOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectProps = Omit<MuiSelectProps, 'label' | 'children'> & {
  label: string;
  options: SelectOption[];
  error?: boolean;
  helperText?: ReactNode;
  /** MUI FormControl surface style */
  formVariant?: 'standard' | 'outlined' | 'filled';
};

/**
 * Single-select for filters, country, sort order.
 */
export const Select = forwardRef<HTMLSelectElement | null, SelectProps>(function Select(
  {
    label,
    options,
    error,
    helperText,
    fullWidth = true,
    size = 'medium',
    formVariant = 'outlined',
    id,
    ...rest
  },
  ref,
) {
  const labelId = id != null ? `${id}-label` : undefined;

  return (
    <FormControl fullWidth={fullWidth} size={size} error={error} variant={formVariant}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect ref={ref} labelId={labelId} label={label} id={id} {...rest}>
        {options.map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText != null ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
});
