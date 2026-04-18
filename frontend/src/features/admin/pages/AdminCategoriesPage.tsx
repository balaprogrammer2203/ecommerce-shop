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

import { useAdminCategoriesQuery, useDeleteAdminCategoryMutation } from '../api/adminApi';
import type { AdminCategory } from '../types';
import { CategoryFormDialog } from '../ui/CategoryFormDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' | 'warning' } | null;
type ActiveTabFilter = 'all' | 'true' | 'false';
type SortColumn = 'name' | 'slug' | 'parent' | 'path' | 'sort' | 'active';
type SortDirection = 'asc' | 'desc';

const columnOptions: Array<{ key: SortColumn; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'parent', label: 'Parent' },
  { key: 'path', label: 'Path' },
  { key: 'sort', label: 'Sort' },
  { key: 'active', label: 'Active' },
];

const getParentLabel = (cat: AdminCategory) => {
  const parent = cat.parentId;
  if (!parent) return '—';
  if (typeof parent === 'string') return parent;
  return parent.name || parent.slug || '—';
};

const initialsFrom = (name: string) => {
  const raw = name.trim();
  if (!raw) return 'CA';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
};

const compareStrings = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

export const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const { data: categories = [], isLoading, isError } = useAdminCategoriesQuery({ active: 'all' });
  const [deleteAdminCategory, { isLoading: deletingSingle }] = useDeleteAdminCategoryMutation();

  const [sortBy, setSortBy] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<SortDirection>('asc');
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<SortColumn, boolean>>({
    name: true,
    slug: true,
    parent: true,
    path: true,
    sort: true,
    active: true,
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTabFilter>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [toast, setToast] = useState<ToastState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState(false);
  const [singleDeactivateOpen, setSingleDeactivateOpen] = useState(false);
  const [singleDeactivateId, setSingleDeactivateId] = useState<string | null>(null);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [rowMenuCategoryId, setRowMenuCategoryId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const tabCounts = useMemo(() => {
    return {
      all: categories.length,
      true: categories.filter((c) => c.isActive).length,
      false: categories.filter((c) => !c.isActive).length,
    };
  }, [categories]);

  const sortedCategories = useMemo(() => {
    const list = [...categories];
    const dir = sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = compareStrings(a.name || '', b.name || '');
          break;
        case 'slug':
          cmp = compareStrings(a.slug || '', b.slug || '');
          break;
        case 'parent':
          cmp = compareStrings(getParentLabel(a), getParentLabel(b));
          break;
        case 'path':
          cmp = compareStrings(a.path || '', b.path || '');
          break;
        case 'sort':
          cmp = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          break;
        case 'active':
          cmp = Number(a.isActive) - Number(b.isActive);
          break;
        default:
          cmp = 0;
      }
      if (cmp !== 0) return cmp * dir;
      return compareStrings(a.name || '', b.name || '');
    });
    return list;
  }, [categories, sortBy, sortOrder]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedCategories.filter((c) => {
      const matchesTab =
        activeTab === 'all' ? true : activeTab === 'true' ? c.isActive : !c.isActive;
      if (!matchesTab) return false;
      if (!q) return true;
      const parent = getParentLabel(c);
      return (
        c.name.toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q) ||
        parent.toLowerCase().includes(q) ||
        (c.path || '').toLowerCase().includes(q)
      );
    });
  }, [sortedCategories, search, activeTab]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((c) => c._id === id)));
  }, [filtered]);

  useEffect(() => {
    setPage(0);
  }, [search, activeTab]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortOrder('asc');
  };

  const toggleColumnVisibility = (column: SortColumn) => {
    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
    if (visibleColumns[column] && visibleCount <= 1) return;
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;

  const openRowMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setRowMenuAnchorEl(e.currentTarget);
    setRowMenuCategoryId(id);
  };
  const closeRowMenu = () => {
    setRowMenuAnchorEl(null);
    setRowMenuCategoryId(null);
  };

  const viewCategory = (id: string) => {
    navigate(`/admin/categories/${id}`);
    closeRowMenu();
  };

  const openEdit = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setFormOpen(true);
    closeRowMenu();
  };

  const openCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isAllPagedSelected = paged.length > 0 && paged.every((c) => selectedIds.includes(c._id));
  const isSomePagedSelected = paged.some((c) => selectedIds.includes(c._id)) && !isAllPagedSelected;

  const toggleSelectAllPaged = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !paged.some((c) => c._id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const merged = new Set(prev);
      paged.forEach((c) => merged.add(c._id));
      return Array.from(merged);
    });
  };

  const exportRows = useMemo(() => {
    if (selectedIds.length > 0) return filtered.filter((c) => selectedIds.includes(c._id));
    return filtered;
  }, [filtered, selectedIds]);

  const exportToCsv = () => {
    if (exportRows.length === 0) {
      setToast({ message: 'No rows to export', severity: 'error' });
      return;
    }
    const headers = ['Name', 'Slug', 'Parent', 'Path', 'Level', 'Sort', 'Active', 'Image'];
    const escape = (v: string | number | boolean) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = exportRows.map((c) => [
      c.name,
      c.slug,
      getParentLabel(c),
      c.path || '',
      c.level ?? '',
      c.sortOrder ?? 0,
      c.isActive ? 'Yes' : 'No',
      c.image || '',
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => escape(cell)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({
      message:
        selectedIds.length > 0
          ? `Exported ${exportRows.length} selected categor${exportRows.length === 1 ? 'y' : 'ies'}`
          : `Exported ${exportRows.length} categor${exportRows.length === 1 ? 'y' : 'ies'}`,
      severity: 'success',
    });
  };

  const runBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => deleteAdminCategory(id).unwrap()),
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.length - ok;
      setBulkDeactivateOpen(false);
      setSelectedIds([]);
      if (fail === 0) {
        setToast({
          message: `Deactivated ${ok} categor${ok === 1 ? 'y' : 'ies'}`,
          severity: 'success',
        });
      } else {
        setToast({
          message: `Deactivated ${ok}; ${fail} failed`,
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
          Categories
        </Typography>
        <Button
          variant="contained"
          onClick={openCreate}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          New category
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Manage catalog hierarchy, visibility, and storefront navigation.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v as ActiveTabFilter)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ minHeight: 44, '& .MuiTabScrollButton-root': { width: { xs: 28, sm: 40 } } }}
      >
        <Tab value="all" label={`All (${tabCounts.all})`} />
        <Tab value="true" label={`Active (${tabCounts.true})`} />
        <Tab value="false" label={`Inactive (${tabCounts.false})`} />
      </Tabs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.25}
      >
        <Typography variant="h6" fontWeight={600}>
          Categories
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
              onClick={() => setBulkDeactivateOpen(true)}
              startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
            >
              Deactivate ({selectedIds.length})
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
            label="Search name / slug / parent / path"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: { sm: '1 1 220px' }, minWidth: { sm: 180 }, maxWidth: { sm: 400 } }}
          />
          <FormControl
            size="small"
            fullWidth
            sx={{ minWidth: { sm: 200 }, flex: { sm: '0 1 220px' } }}
          >
            <InputLabel>Visibility</InputLabel>
            <Select
              label="Visibility"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as ActiveTabFilter)}
            >
              <MenuItem value="all">all ({tabCounts.all})</MenuItem>
              <MenuItem value="true">active ({tabCounts.true})</MenuItem>
              <MenuItem value="false">inactive ({tabCounts.false})</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load categories.</Typography>
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
                  {visibleColumns.name ? (
                    <TableCell sortDirection={sortBy === 'name' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.slug ? (
                    <TableCell sortDirection={sortBy === 'slug' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'slug'}
                        direction={sortBy === 'slug' ? sortOrder : 'asc'}
                        onClick={() => handleSort('slug')}
                      >
                        Slug
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.parent ? (
                    <TableCell sortDirection={sortBy === 'parent' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'parent'}
                        direction={sortBy === 'parent' ? sortOrder : 'asc'}
                        onClick={() => handleSort('parent')}
                      >
                        Parent
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.path ? (
                    <TableCell sortDirection={sortBy === 'path' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'path'}
                        direction={sortBy === 'path' ? sortOrder : 'asc'}
                        onClick={() => handleSort('path')}
                      >
                        Path
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.sort ? (
                    <TableCell align="right" sortDirection={sortBy === 'sort' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'sort'}
                        direction={sortBy === 'sort' ? sortOrder : 'asc'}
                        onClick={() => handleSort('sort')}
                      >
                        Sort
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.active ? (
                    <TableCell
                      align="center"
                      sortDirection={sortBy === 'active' ? sortOrder : false}
                    >
                      <TableSortLabel
                        active={sortBy === 'active'}
                        direction={sortBy === 'active' ? sortOrder : 'asc'}
                        onClick={() => handleSort('active')}
                      >
                        Active
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(isLoading ? [] : paged).map((cat) => (
                  <TableRow
                    key={cat._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => viewCategory(cat._id)}
                  >
                    <TableCell
                      padding="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.includes(cat._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRowSelection(cat._id);
                        }}
                      />
                    </TableCell>
                    {visibleColumns.name ? (
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          {cat.image ? (
                            <Avatar
                              src={cat.image}
                              alt={cat.name}
                              variant="rounded"
                              sx={{ width: 32, height: 32 }}
                            />
                          ) : (
                            <Avatar variant="rounded" sx={{ width: 32, height: 32, fontSize: 12 }}>
                              {initialsFrom(cat.name)}
                            </Avatar>
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {cat.name}
                            </Typography>
                            {cat.path ? (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {cat.path}
                              </Typography>
                            ) : null}
                          </Box>
                        </Stack>
                      </TableCell>
                    ) : null}
                    {visibleColumns.slug ? (
                      <TableCell sx={{ maxWidth: 160 }}>
                        <Typography variant="body2" noWrap title={cat.slug}>
                          {cat.slug}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {visibleColumns.parent ? (
                      <TableCell sx={{ maxWidth: 140 }}>
                        <Typography variant="body2" noWrap>
                          {getParentLabel(cat)}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {visibleColumns.path ? (
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap title={cat.path}>
                          {cat.path || '—'}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {visibleColumns.sort ? (
                      <TableCell align="right">{cat.sortOrder ?? 0}</TableCell>
                    ) : null}
                    {visibleColumns.active ? (
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={cat.isActive ? 'Yes' : 'No'}
                          color={cat.isActive ? 'success' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => openRowMenu(e, cat._id)}
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
                        No categories found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {(isLoading ? [] : paged).map((cat) => (
              <Paper
                key={cat._id}
                variant="outlined"
                onClick={() => viewCategory(cat._id)}
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
                      checked={selectedIds.includes(cat._id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRowSelection(cat._id);
                      }}
                      sx={{ p: 0.5, ml: -0.5 }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      onClick={(e) => openRowMenu(e, cat._id)}
                      sx={{ minWidth: 40, px: 0.5 }}
                      aria-label="Row actions"
                    >
                      <MoreHorizRoundedIcon fontSize="small" />
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    {cat.image ? (
                      <Avatar
                        src={cat.image}
                        alt={cat.name}
                        variant="rounded"
                        sx={{ width: 36, height: 36 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 36, height: 36, fontSize: 12 }}>
                        {initialsFrom(cat.name)}
                      </Avatar>
                    )}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                        {cat.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ wordBreak: 'break-all' }}
                      >
                        {cat.slug}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      Parent
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ textAlign: 'right', wordBreak: 'break-word' }}
                    >
                      {getParentLabel(cat)}
                    </Typography>
                  </Stack>
                  {cat.path ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {cat.path}
                    </Typography>
                  ) : null}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                      size="small"
                      label={cat.isActive ? 'Active' : 'Inactive'}
                      color={cat.isActive ? 'success' : 'default'}
                    />
                    <Typography variant="body2" fontWeight={700}>
                      Sort {cat.sortOrder ?? 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {!isLoading && filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No categories found.
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
            if (rowMenuCategoryId) viewCategory(rowMenuCategoryId);
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            const c = categories.find((x) => x._id === rowMenuCategoryId);
            if (c) openEdit(c);
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          disabled={
            !rowMenuCategoryId || !categories.find((x) => x._id === rowMenuCategoryId)?.isActive
          }
          onClick={() => {
            if (!rowMenuCategoryId) return;
            setSingleDeactivateId(rowMenuCategoryId);
            setSingleDeactivateOpen(true);
            closeRowMenu();
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Deactivate
        </MenuItem>
      </Menu>

      <CategoryFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
        }}
        categories={categories}
        editing={editingCategory}
        onToast={setToast}
      />

      <ConfirmDialog
        open={singleDeactivateOpen}
        onClose={() => {
          setSingleDeactivateOpen(false);
          setSingleDeactivateId(null);
        }}
        title="Deactivate category?"
        confirmLabel="Deactivate"
        confirmColor="error"
        loading={deletingSingle}
        description="Deactivating disables this category in storefront and admin menus."
        onConfirm={() => {
          if (!singleDeactivateId) return;
          void deleteAdminCategory(singleDeactivateId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Category deactivated', severity: 'success' });
              setSelectedIds((prev) => prev.filter((id) => id !== singleDeactivateId));
              setSingleDeactivateOpen(false);
              setSingleDeactivateId(null);
            })
            .catch((e) =>
              setToast({
                message: e instanceof Error ? e.message : 'Failed to deactivate',
                severity: 'error',
              }),
            );
        }}
      />

      <ConfirmDialog
        open={bulkDeactivateOpen}
        onClose={() => !bulkDeleting && setBulkDeactivateOpen(false)}
        title={`Deactivate ${selectedIds.length} selected?`}
        confirmLabel={`Deactivate (${selectedIds.length})`}
        confirmColor="error"
        loading={bulkDeleting}
        description="Only active categories will be deactivated; failures are reported in the toast."
        onConfirm={() => void runBulkDeactivate()}
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
