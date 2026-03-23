import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export type ShopButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ShopButtonProps = Omit<MuiButtonProps, 'variant' | 'color'> & {
  /** Semantic style preset for storefront actions */
  shopVariant?: ShopButtonVariant;
  /** Shows spinner and disables interaction */
  loading?: boolean;
  /** In-app route: renders as `react-router` `Link` (client navigation) */
  to?: string;
};

const variantStyles: Record<ShopButtonVariant, Pick<MuiButtonProps, 'variant' | 'color'>> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'primary' },
  danger: { variant: 'contained', color: 'error' },
};

/**
 * Storefront button — wraps MUI `Button` with presets for cart, checkout, and admin flows.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ShopButtonProps>(
  function Button(
    {
      shopVariant = 'primary',
      loading = false,
      disabled,
      children,
      startIcon,
      sx,
      to,
      component,
      ...rest
    },
    ref,
  ) {
    const preset = variantStyles[shopVariant];
    const useRouter = Boolean(to) && component === undefined;

    return (
      <MuiButton
        ref={ref}
        component={useRouter ? RouterLink : (component ?? 'button')}
        {...(useRouter ? { to } : {})}
        {...preset}
        disabled={disabled || loading}
        startIcon={
          loading ? <CircularProgress color="inherit" size={16} thickness={5} /> : startIcon
        }
        sx={{ position: 'relative', ...sx }}
        {...rest}
      >
        {children}
      </MuiButton>
    );
  },
);
