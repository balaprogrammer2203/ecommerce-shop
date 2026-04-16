import {
  Button,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
} from '../api/adminApi';

export const AdminUsersPage = () => {
  const { data: users = [], isLoading, isError } = useAdminUsersQuery();
  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        Users
      </Typography>
      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load users.</Typography>
        </Paper>
      ) : null}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isLoading ? [] : users).map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <Select
                    value={user.role}
                    size="small"
                    onChange={(e) => {
                      setBusyId(user._id);
                      void updateUser({
                        id: user._id,
                        payload: { role: e.target.value as 'customer' | 'admin' },
                      }).finally(() => setBusyId(null));
                    }}
                    disabled={busyId === user._id}
                  >
                    <MenuItem value="customer">customer</MenuItem>
                    <MenuItem value="admin">admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color="error"
                    disabled={busyId === user._id}
                    onClick={() => {
                      setBusyId(user._id);
                      void deleteUser(user._id).finally(() => setBusyId(null));
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};
