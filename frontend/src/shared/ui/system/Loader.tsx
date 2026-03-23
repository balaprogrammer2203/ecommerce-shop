import {
  Box,
  CircularProgress,
  type CircularProgressProps,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export type PageLoaderProps = {
  /** Optional status under the spinner */
  message?: ReactNode;
  /** Covers viewport center vs inline block */
  fullViewport?: boolean;
  /** MUI CircularProgress props */
  progressProps?: CircularProgressProps;
};

/**
 * Full-page or section blocking loader (checkout, account).
 */
export const PageLoader = ({ message, fullViewport = true, progressProps }: PageLoaderProps) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        minHeight: fullViewport ? '40vh' : 120,
        py: 4,
      }}
    >
      <CircularProgress size={40} thickness={4} {...progressProps} />
      {message != null ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      ) : null}
    </Stack>
  );
};

export type InlineLoaderProps = CircularProgressProps & {
  label?: ReactNode;
};

/**
 * Inline spinner for buttons rows or table cells.
 */
export const InlineLoader = ({ label, size = 24, ...rest }: InlineLoaderProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <CircularProgress size={size} thickness={4} {...rest} />
      {label != null ? (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      ) : null}
    </Stack>
  );
};

export type ProductCardSkeletonProps = {
  /** Image area height */
  imageHeight?: number;
};

/**
 * Placeholder while product grid data loads.
 */
export const ProductCardSkeleton = ({ imageHeight = 160 }: ProductCardSkeletonProps) => {
  return (
    <Box>
      <Skeleton variant="rectangular" height={imageHeight} sx={{ borderRadius: 1 }} />
      <Stack spacing={1} sx={{ mt: 1.5 }}>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="50%" />
      </Stack>
    </Box>
  );
};
