import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useUpdateAdminUserMutation } from '../api/adminApi';
import type { AdminUser } from '../types';

type ToastHandler = (t: { message: string; severity: 'success' | 'error' | 'warning' }) => void;

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  editing: AdminUser | null;
  onToast: ToastHandler;
};

export const UserFormDialog = ({ open, onClose, editing, onToast }: UserFormDialogProps) => {
  const [updateUser, { isLoading: updating }] = useUpdateAdminUserMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [phone, setPhone] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (!open || !editing) return;
    setName(editing.name || '');
    setEmail(editing.email || '');
    setRole(editing.role);
    setPhone(editing.phone || '');
    setTwoFactorEnabled(Boolean(editing.twoFactorEnabled));
  }, [open, editing]);

  const onSubmit = async () => {
    if (!editing) return;
    const n = name.trim();
    const em = email.trim().toLowerCase();
    if (!n || !em) {
      onToast({ message: 'Name and email are required', severity: 'warning' });
      return;
    }
    try {
      await updateUser({
        id: editing._id,
        payload: {
          name: n,
          email: em,
          role,
          phone: phone.trim(),
          twoFactorEnabled,
        },
      }).unwrap();
      onToast({ message: 'User updated', severity: 'success' });
      onClose();
    } catch (e) {
      onToast({
        message: e instanceof Error ? e.message : 'Failed to update user',
        severity: 'error',
      });
    }
  };

  return (
    <Dialog open={open && Boolean(editing)} onClose={() => !updating && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Edit user{editing ? `: ${editing.name}` : ''}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <FormControl fullWidth size="small">
            <InputLabel id="user-form-role">Role</InputLabel>
            <Select
              labelId="user-form-role"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Two-factor authentication enabled"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={updating}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void onSubmit()} disabled={updating}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
