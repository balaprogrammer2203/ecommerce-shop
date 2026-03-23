import { Chip, type ChipProps } from '@mui/material';
import type { ReactNode } from 'react';

export type ShopBadgeTone = 'sale' | 'new' | 'lowStock' | 'neutral' | 'success';

export type BadgeProps = Omit<ChipProps, 'color' | 'label'> & {
  /** Visible text */
  label: ReactNode;
  tone?: ShopBadgeTone;
};

const toneColor: Record<ShopBadgeTone, ChipProps['color']> = {
  sale: 'error',
  new: 'primary',
  lowStock: 'warning',
  neutral: 'default',
  success: 'success',
};

/**
 * Compact label for product tiles (Sale, New, Only 2 left).
 */
export const Badge = ({ tone = 'neutral', size = 'small', sx, ...rest }: BadgeProps) => {
  return (
    <Chip
      size={size}
      color={toneColor[tone]}
      variant={tone === 'neutral' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 600, ...sx }}
      {...rest}
    />
  );
};
