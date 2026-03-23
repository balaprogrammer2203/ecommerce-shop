import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import type { ReactNode } from 'react';

export type ModalProps = Omit<DialogProps, 'open'> & {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Primary / secondary actions row */
  footer?: ReactNode;
  showCloseButton?: boolean;
  children: ReactNode;
};

/**
 * Accessible dialog for confirmations, quick product view, or auth prompts.
 */
export const Modal = ({
  open,
  onClose,
  title,
  footer,
  children,
  showCloseButton = true,
  maxWidth = 'sm',
  fullWidth = true,
  ...rest
}: ModalProps) => {
  const showHeader = title != null || showCloseButton;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} {...rest}>
      {showHeader ? (
        <DialogTitle sx={{ pr: showCloseButton ? 6 : 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box component="span" sx={{ flex: 1, pr: showCloseButton ? 2 : 0 }}>
              {title}
            </Box>
            {showCloseButton ? (
              <IconButton
                aria-label="Close dialog"
                onClick={onClose}
                size="small"
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </Stack>
        </DialogTitle>
      ) : null}

      <DialogContent dividers={showHeader}>{children}</DialogContent>

      {footer != null ? <DialogActions sx={{ px: 3, py: 2 }}>{footer}</DialogActions> : null}
    </Dialog>
  );
};
