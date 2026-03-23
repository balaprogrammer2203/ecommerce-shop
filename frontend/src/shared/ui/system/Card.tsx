import {
  Box,
  Card as MuiCard,
  CardActions,
  CardContent,
  type CardProps as MuiCardProps,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export type ShopCardProps = MuiCardProps & {
  /** Card heading (product name, section title) */
  title?: ReactNode;
  /** Subtitle or meta (SKU, category) */
  subtitle?: ReactNode;
  /** Main body — if omitted, `children` render inside `CardContent` */
  children?: ReactNode;
  /** Footer row: actions, price + CTA */
  footer?: ReactNode;
  /** Inner padding multiplier (theme spacing) */
  contentPadding?: number;
};

/**
 * Product / summary card with optional title, subtitle, and footer slot.
 */
export const Card = ({
  title,
  subtitle,
  children,
  footer,
  contentPadding = 2,
  elevation = 0,
  variant = 'outlined',
  sx,
  ...rest
}: ShopCardProps) => {
  return (
    <MuiCard elevation={elevation} variant={variant} sx={{ borderRadius: 2, ...sx }} {...rest}>
      {(title != null || subtitle != null) && (
        <CardContent
          sx={{
            pb: title || subtitle ? 1 : contentPadding,
            pt: contentPadding,
            px: contentPadding,
          }}
        >
          <Stack spacing={0.5}>
            {title != null ? (
              <Typography component="div" variant="h6" fontWeight={700}>
                {title}
              </Typography>
            ) : null}
            {subtitle != null ? (
              <Typography component="div" variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      )}

      {title != null || subtitle != null ? (
        children != null ? (
          <>
            <Divider sx={{ mx: contentPadding }} />
            <CardContent sx={{ py: contentPadding, px: contentPadding }}>{children}</CardContent>
          </>
        ) : null
      ) : (
        <CardContent sx={{ py: contentPadding, px: contentPadding }}>{children}</CardContent>
      )}

      {footer != null ? (
        <>
          <Divider />
          <CardActions sx={{ px: contentPadding, py: 1.5, justifyContent: 'flex-end' }}>
            <Box width="100%">{footer}</Box>
          </CardActions>
        </>
      ) : null}
    </MuiCard>
  );
};
