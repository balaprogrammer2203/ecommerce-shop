import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAdminUsersQuery, useDeleteAdminUserMutation } from '../api/adminApi';
import type { AdminUser } from '../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { UserFormDialog } from '../ui/UserFormDialog';

type ToastState = { message: string; severity: 'success' | 'error' | 'warning' } | null;
type RoleTab = 'all' | 'admin' | 'customer';
type TwoFaFilter = 'all' | 'on' | 'off';
type SortColumn = 'name' | 'email' | 'role' | 'created' | 'sessions' | 'twofa';
type SortDirection = 'asc' | 'desc';
type VisibleCols = 'user' | 'email' | 'phone' | 'role' | 'twofa' | 'sessions' | 'created';

const columnOptions: Array<{ key: VisibleCols; label: string }> = [
  { key: 'user', label: 'User' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role' },
  { key: 'twofa', label: '2FA' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'created', label: 'Created' },
];

const compareStrings = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

const initialsFrom = (name: string) => {
  const raw = name.trim();
  if (!raw) return 'U';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
};

const formatDateShort = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
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

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const { data: users = [], isLoading, isError } = useAdminUsersQuery();
  const [deleteUser, { isLoading: deletingSingle }] = useDeleteAdminUserMutation();

  const [roleTab, setRoleTab] = useState<RoleTab>('all');
  const [twoFaFilter, setTwoFaFilter] = useState<TwoFaFilter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortColumn>('created');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<VisibleCols, boolean>>({
    user: true,
    email: true,
    phone: true,
    role: true,
    twofa: true,
    sessions: true,
    created: true,
  });

  const [toast, setToast] = useState<ToastState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [rowMenuUserId, setRowMenuUserId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const tabCounts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === 'admin').length,
      customer: users.filter((u) => u.role === 'customer').length,
    };
  }, [users]);

  const sortedUsers = useMemo(() => {
    const list = [...users];
    const dir = sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = compareStrings(a.name || '', b.name || '');
          break;
        case 'email':
          cmp = compareStrings(a.email || '', b.email || '');
          break;
        case 'role':
          cmp = compareStrings(a.role, b.role);
          break;
        case 'created':
          cmp =
            (new Date(a.createdAt || 0).getTime() || 0) - (new Date(b.createdAt || 0).getTime() || 0);
          break;
        case 'sessions':
          cmp = (a.activeSessionsCount ?? 0) - (b.activeSessionsCount ?? 0);
          break;
        case 'twofa':
          cmp = Number(Boolean(a.twoFactorEnabled)) - Number(Boolean(b.twoFactorEnabled));
          break;
        default:
          cmp = 0;
      }
      if (cmp !== 0) return cmp * dir;
      return compareStrings(a.name || '', b.name || '');
    });
    return list;
  }, [users, sortBy, sortOrder]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedUsers.filter((u) => {
      if (roleTab === 'admin' && u.role !== 'admin') return false;
      if (roleTab === 'customer' && u.role !== 'customer') return false;
      if (twoFaFilter === 'on' && !u.twoFactorEnabled) return false;
      if (twoFaFilter === 'off' && u.twoFactorEnabled) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    });
  }, [sortedUsers, search, roleTab, twoFaFilter]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((u) => u._id === id)));
  }, [filtered]);

  useEffect(() => {
    setPage(0);
  }, [search, roleTab, twoFaFilter]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortOrder(column === 'created' ? 'desc' : 'asc');
  };

  const toggleColumnVisibility = (column: VisibleCols) => {
    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
    if (visibleColumns[column] && visibleCount <= 1) return;
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;

  const openRowMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setRowMenuAnchorEl(e.currentTarget);
    setRowMenuUserId(id);
  };
  const closeRowMenu = () => {
    setRowMenuAnchorEl(null);
    setRowMenuUserId(null);
  };

  const viewUser = (id: string) => {
    navigate(`/admin/users/${id}`);
    closeRowMenu();
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFormOpen(true);
    closeRowMenu();
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isAllPagedSelected = paged.length > 0 && paged.every((u) => selectedIds.includes(u._id));
  const isSomePagedSelected = paged.some((u) => selectedIds.includes(u._id)) && !isAllPagedSelected;

  const toggleSelectAllPaged = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !paged.some((u) => u._id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const merged = new Set(prev);
      paged.forEach((u) => merged.add(u._id));
      return Array.from(merged);
    });
  };

  const exportRows = useMemo(() => {
    if (selectedIds.length > 0) return filtered.filter((u) => selectedIds.includes(u._id));
    return filtered;
  }, [filtered, selectedIds]);

  const exportToCsv = () => {
    if (exportRows.length === 0) {
      setToast({ message: 'No rows to export', severity: 'error' });
      return;
    }
    const headers = ['Name', 'Email', 'Phone', 'Role', '2FA', 'Sessions', 'Created'];
    const esc = (v: string | number | boolean) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = exportRows.map((u) => [
      u.name,
      u.email,
      u.phone || '',
      u.role,
      u.twoFactorEnabled ? 'Yes' : 'No',
      u.activeSessionsCount ?? 0,
      u.createdAt || '',
    ]);
    const csv = [headers, ...rows].map((line) => line.map((cell) => esc(cell)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({
      message:
        selectedIds.length > 0
          ? `Exported ${exportRows.length} selected user(s)`
          : `Exported ${exportRows.length} user(s)`,
      severity: 'success',
    });
  };

  const runBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(selectedIds.map((id) => deleteUser(id).unwrap()));
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.length - ok;
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      if (fail === 0) {
        setToast({
          message: `Deleted ${ok} user${ok === 1 ? '' : 's'}`,
          severity: 'success',
        });
      } else {
        setToast({
          message: `Deleted ${ok}; ${fail} failed`,
          severity: fail === results.length ? 'error' : 'warning',
        });
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
      >
        <Typography variant="h5" fontWeight={700}>
          Users
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Review accounts, roles, and security. Deleting a user cannot be undone.
      </Typography>

      <Tabs
        value={roleTab}
        onChange={(_e, v) => setRoleTab(v as RoleTab)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ minHeight: 44, '& .MuiTabScrollButton-root': { width: { xs: 28, sm: 40 } } }}
      >
        <Tab value="all" label={`All (${tabCounts.all})`} />
        <Tab value="admin" label={`Admins (${tabCounts.admin})`} />
        <Tab value="customer" label={`Customers (${tabCounts.customer})`} />
      </Tabs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.25}
      >
        <Typography variant="h6" fontWeight={600}>
          Directory
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
        >
          <Menu
            anchorEl={columnsAnchorEl}
            open={Boolean(columnsAnchorEl)}
            onClose={() => setColumnsAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: { minWidth: 230, border: '1px solid rgba(229,231,235,1)', borderRadius: 2 },
              },
            }}
          >
            <MenuItem disabled sx={{ opacity: 1, fontWeight: 700, fontSize: 13 }}>
              Toggle columns
            </MenuItem>
            {columnOptions.map((col) => (
              <MenuItem key={col.key} onClick={() => toggleColumnVisibility(col.key)}>
                <Checkbox checked={visibleColumns[col.key]} size="small" sx={{ mr: 1 }} />
                {col.label}
              </MenuItem>
            ))}
          </Menu>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => setColumnsAnchorEl(e.currentTarget)}
          >
            Columns
          </Button>
          <Button size="small" variant="outlined" onClick={exportToCsv}>
            Export
          </Button>
        </Stack>
      </Stack>

      {selectedIds.length > 0 ? (
        <Paper
          variant="outlined"
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 2,
            borderColor: 'rgba(229,231,235,1)',
            bgcolor: '#F8FAFC',
            width: 'fit-content',
            maxWidth: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="body2" fontWeight={600}>
              {selectedIds.length} selected
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => setBulkDeleteOpen(true)}
              startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
            >
              Delete ({selectedIds.length})
            </Button>
            <Button
              size="small"
              onClick={() => setSelectedIds([])}
              startIcon={<CloseRoundedIcon fontSize="small" />}
            >
              Clear
            </Button>
          </Stack>
        </Paper>
      ) : null}

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <TextField
            size="small"
            fullWidth
            label="Search name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: { sm: '1 1 220px' }, minWidth: { sm: 180 }, maxWidth: { sm: 400 } }}
          />
          <FormControl
            size="small"
            fullWidth
            sx={{ minWidth: { sm: 180 }, flex: { sm: '0 1 200px' } }}
          >
            <InputLabel>2FA</InputLabel>
            <Select
              label="2FA"
              value={twoFaFilter}
              onChange={(e) => setTwoFaFilter(e.target.value as TwoFaFilter)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="on">Enabled</MenuItem>
              <MenuItem value="off">Disabled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load users.</Typography>
        </Paper>
      ) : null}

      <Paper sx={{ overflowX: 'auto', border: '1px solid rgba(229,231,235,1)' }}>
        {mdUp ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllPagedSelected}
                      indeterminate={isSomePagedSelected}
                      onChange={(e) => toggleSelectAllPaged(e.target.checked)}
                      inputProps={{ 'aria-label': 'Select all on page' }}
                    />
                  </TableCell>
                  {visibleColumns.user ? (
                    <TableCell sortDirection={sortBy === 'name' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        User
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.email ? (
                    <TableCell sortDirection={sortBy === 'email' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'email'}
                        direction={sortBy === 'email' ? sortOrder : 'asc'}
                        onClick={() => handleSort('email')}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.phone ? <TableCell>Phone</TableCell> : null}
                  {visibleColumns.role ? (
                    <TableCell sortDirection={sortBy === 'role' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'role'}
                        direction={sortBy === 'role' ? sortOrder : 'asc'}
                        onClick={() => handleSort('role')}
                      >
                        Role
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.twofa ? (
                    <TableCell align="center" sortDirection={sortBy === 'twofa' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'twofa'}
                        direction={sortBy === 'twofa' ? sortOrder : 'asc'}
                        onClick={() => handleSort('twofa')}
                      >
                        2FA
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.sessions ? (
                    <TableCell align="right" sortDirection={sortBy === 'sessions' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'sessions'}
                        direction={sortBy === 'sessions' ? sortOrder : 'asc'}
                        onClick={() => handleSort('sessions')}
                      >
                        Sessions
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.created ? (
                    <TableCell sortDirection={sortBy === 'created' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'created'}
                        direction={sortBy === 'created' ? sortOrder : 'asc'}
                        onClick={() => handleSort('created')}
                      >
                        Created
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(isLoading ? [] : paged).map((u) => (
                  <TableRow
                    key={u._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => viewUser(u._id)}
                  >
                    <TableCell
                      padding="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.includes(u._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRowSelection(u._id);
                        }}
                      />
                    </TableCell>
                    {visibleColumns.user ? (
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          {u.profileImageUrl ? (
                            <Avatar src={u.profileImageUrl} alt={u.name} sx={{ width: 32, height: 32 }} />
                          ) : (
                            <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                              {initialsFrom(u.name || u.email)}
                            </Avatar>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {u.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {u._id.slice(-6)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                    ) : null}
                    {visibleColumns.email ? (
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap title={u.email}>
                          {u.email}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {visibleColumns.phone ? (
                      <TableCell sx={{ maxWidth: 120 }}>
                        <Typography variant="body2" noWrap>
                          {u.phone?.trim() ? u.phone : '—'}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {visibleColumns.role ? (
                      <TableCell>
                        <Chip
                          size="small"
                          label={u.role === 'admin' ? 'Admin' : 'Customer'}
                          sx={{ fontWeight: 700, ...roleChipSx(u.role) }}
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.twofa ? (
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={u.twoFactorEnabled ? 'On' : 'Off'}
                          color={u.twoFactorEnabled ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.sessions ? (
                      <TableCell align="right">{u.activeSessionsCount ?? 0}</TableCell>
                    ) : null}
                    {visibleColumns.created ? (
                      <TableCell>{formatDateShort(u.createdAt)}</TableCell>
                    ) : null}
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => openRowMenu(e, u._id)}
                        sx={{ minWidth: 32, px: 0.5 }}
                      >
                        <MoreHorizRoundedIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount + 2}>
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {(isLoading ? [] : paged).map((u) => (
              <Paper
                key={u._id}
                variant="outlined"
                onClick={() => viewUser(u._id)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  borderColor: 'rgba(229,231,235,1)',
                  cursor: 'pointer',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(u._id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRowSelection(u._id);
                      }}
                      sx={{ p: 0.5, ml: -0.5 }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      onClick={(e) => openRowMenu(e, u._id)}
                      sx={{ minWidth: 40, px: 0.5 }}
                      aria-label="Row actions"
                    >
                      <MoreHorizRoundedIcon fontSize="small" />
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    {u.profileImageUrl ? (
                      <Avatar src={u.profileImageUrl} alt={u.name} sx={{ width: 36, height: 36 }} />
                    ) : (
                      <Avatar sx={{ width: 36, height: 36, fontSize: 12 }}>
                        {initialsFrom(u.name || u.email)}
                      </Avatar>
                    )}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                        {u.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ wordBreak: 'break-all' }}
                      >
                        {u.email}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      size="small"
                      label={u.role === 'admin' ? 'Admin' : 'Customer'}
                      sx={{ fontWeight: 700, ...roleChipSx(u.role) }}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      2FA
                    </Typography>
                    <Chip
                      size="small"
                      label={u.twoFactorEnabled ? 'On' : 'Off'}
                      color={u.twoFactorEnabled ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Sessions
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {u.activeSessionsCount ?? 0}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Created {formatDateShort(u.createdAt)}
                  </Typography>
                </Stack>
              </Paper>
            ))}
            {!isLoading && filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No users found.
              </Typography>
            ) : null}
          </Stack>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
          gap={1}
          sx={{ px: { xs: 1, sm: 2 }, pb: 1, pt: 0.5 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: { xs: 'center', sm: 'left' }, py: { xs: 0.5, sm: 0 } }}
          >
            Showing {filtered.length ? page * rowsPerPage + 1 : 0}-
            {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length}
          </Typography>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_e, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              overflow: 'hidden',
              border: 0,
              '& .MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' },
                gap: 0.5,
                minHeight: { xs: 56, sm: 48 },
                px: { xs: 0, sm: 1 },
              },
              '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
            }}
          />
        </Stack>
      </Paper>

      <Menu
        anchorEl={rowMenuAnchorEl}
        open={Boolean(rowMenuAnchorEl)}
        onClose={closeRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 170, border: '1px solid rgba(229,231,235,1)', borderRadius: 2 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (rowMenuUserId) viewUser(rowMenuUserId);
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            const u = users.find((x) => x._id === rowMenuUserId);
            if (u) openEdit(u);
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (!rowMenuUserId) return;
            setSingleDeleteId(rowMenuUserId);
            setSingleDeleteOpen(true);
            closeRowMenu();
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <UserFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        editing={editingUser}
        onToast={setToast}
      />

      <ConfirmDialog
        open={singleDeleteOpen}
        onClose={() => {
          setSingleDeleteOpen(false);
          setSingleDeleteId(null);
        }}
        title="Delete user?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deletingSingle}
        description="This permanently removes the account."
        onConfirm={() => {
          if (!singleDeleteId) return;
          void deleteUser(singleDeleteId)
            .unwrap()
            .then(() => {
              setToast({ message: 'User deleted', severity: 'success' });
              setSelectedIds((prev) => prev.filter((id) => id !== singleDeleteId));
              setSingleDeleteOpen(false);
              setSingleDeleteId(null);
            })
            .catch((e) =>
              setToast({
                message: e instanceof Error ? e.message : 'Failed to delete',
                severity: 'error',
              }),
            );
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => !bulkDeleting && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} selected?`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmColor="error"
        loading={bulkDeleting}
        description="Each selected user will be removed permanently. Failures are summarized in the toast."
        onConfirm={() => void runBulkDelete()}
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
