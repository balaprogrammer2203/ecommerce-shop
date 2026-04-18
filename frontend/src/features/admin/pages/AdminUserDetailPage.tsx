import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAdminUserByIdQuery, useDeleteAdminUserMutation } from '../api/adminApi';
import type { AdminUserAddress } from '../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { UserFormDialog } from '../ui/UserFormDialog';

type ToastState = { message: string; severity: 'success' | 'error' | 'warning' } | null;

const DetailFieldRow = ({
  label,
  value,
  valueSx,
}: {
  label: string;
  value: string;
  valueSx?: SxProps<Theme>;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    spacing={{ xs: 0.25, sm: 0 }}
    sx={{ columnGap: { sm: 2 } }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        minWidth: 0,
        maxWidth: { xs: '100%', sm: '62%' },
        width: { xs: '100%', sm: 'auto' },
        textAlign: { xs: 'left', sm: 'right' },
        wordBreak: { xs: 'break-all', sm: 'break-word' },
        overflowWrap: 'anywhere',
        ...valueSx,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const initialsFrom = (nameOrEmail?: string) => {
  const raw = (nameOrEmail || '').trim();
  if (!raw) return 'U';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatAddress = (a?: AdminUserAddress) => {
  if (!a) return '—';
  const parts = [a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(
    (x) => typeof x === 'string' && x.trim(),
  ) as string[];
  return parts.length ? parts.join(', ') : '—';
};

const roleChipSx = (role: 'admin' | 'customer') =>
  role === 'admin'
    ? {
        color: 'rgb(107,33,168)',
        bgcolor: 'rgba(168,85,247,0.12)',
        border: '1px solid rgba(168,85,247,0.28)',
      }
    : {
        color: 'rgb(30,64,175)',
        bgcolor: 'rgba(59,130,246,0.12)',
        border: '1px solid rgba(59,130,246,0.25)',
      };

export const AdminUserDetailPage = () => {
  const navigate = useNavigate();
  const { userId = '' } = useParams();
  const { data: user, isLoading, isError } = useAdminUserByIdQuery(userId, { skip: !userId });
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();

  const [toast, setToast] = useState<ToastState>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const title = user?.name || 'User';
  const sessions = user?.activeSessionsCount ?? 0;

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ width: '100%', minWidth: 0 }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, width: '100%' }}>
          <Typography variant="h5" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userId ? `USR-${userId.slice(-4).toUpperCase()}` : ''}
            {user?.email ? ` · ${user.email}` : ''}
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          flexWrap={{ xs: 'wrap', md: 'nowrap' }}
          sx={{
            width: { xs: '100%', md: 'auto' },
            flexShrink: { md: 0 },
            '& > .MuiButton-root': {
              width: { xs: '100%', md: 'auto' },
              flexShrink: { md: 0 },
              whiteSpace: { md: 'nowrap' },
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/admin/users')}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setFormOpen(true)}
            disabled={!user}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => setDeleteOpen(true)}
            disabled={!user}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">Loading user…</Typography>
        </Paper>
      ) : null}
      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load user.</Typography>
        </Paper>
      ) : null}

      {user ? (
        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2.5,
              borderColor: 'rgba(229,231,235,1)',
              overflow: 'hidden',
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Role, security posture, and profile
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 1 }}>
              {user.profileImageUrl ? (
                <Avatar
                  src={user.profileImageUrl}
                  alt={title}
                  sx={{ width: { xs: 72, md: 88 }, height: { xs: 72, md: 88 } }}
                />
              ) : (
                <Avatar sx={{ width: { xs: 72, md: 88 }, height: { xs: 72, md: 88 }, fontSize: 24 }}>
                  {initialsFrom(user.name || user.email)}
                </Avatar>
              )}
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={user.role === 'admin' ? 'Admin' : 'Customer'}
                    sx={{ fontWeight: 700, ...roleChipSx(user.role) }}
                  />
                  <Chip
                    size="small"
                    label={user.twoFactorEnabled ? '2FA on' : '2FA off'}
                    color={user.twoFactorEnabled ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
                <DetailFieldRow label="User ID" value={user._id} />
                <DetailFieldRow label="Date of birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'} />
              </Stack>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)' }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Contact
            </Typography>
            <Stack spacing={1}>
              <DetailFieldRow label="Email" value={user.email} />
              <DetailFieldRow label="Phone" value={user.phone?.trim() ? user.phone : '—'} />
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)' }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Account activity
            </Typography>
            <Stack spacing={1}>
              <DetailFieldRow label="Created" value={formatDate(user.createdAt)} />
              <DetailFieldRow label="Last login" value={formatDate(user.lastLoginAt)} />
              <DetailFieldRow label="Active sessions" value={String(sessions)} />
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)' }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Address
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {formatAddress(user.address)}
            </Typography>
          </Paper>
        </Stack>
      ) : null}

      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={user ?? null}
        onToast={setToast}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete this user?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        description="This permanently removes the account and cannot be undone."
        onConfirm={() => {
          if (!userId) return;
          void deleteUser(userId)
            .unwrap()
            .then(() => {
              setToast({ message: 'User deleted', severity: 'success' });
              setDeleteOpen(false);
              navigate('/admin/users');
            })
            .catch((e) =>
              setToast({
                message: e instanceof Error ? e.message : 'Failed to delete',
                severity: 'error',
              }),
            );
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  );
};
