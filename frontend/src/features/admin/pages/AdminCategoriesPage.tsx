import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import {
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
} from '../api/adminApi';
import type { AdminCategory } from '../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' } | null;

const getParentLabel = (cat: AdminCategory) => {
  const parent = cat.parentId;
  if (!parent) return '-';
  if (typeof parent === 'string') return parent;
  return parent.name || parent.slug || '-';
};

export const AdminCategoriesPage = () => {
  const [active, setActive] = useState<'all' | 'true' | 'false'>('all');
  const { data: categories = [], isLoading, isError } = useAdminCategoriesQuery({ active });
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [toast, setToast] = useState<ToastState>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const parent = getParentLabel(c);
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        parent.toLowerCase().includes(q)
      );
    });
  }, [categories, search]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [active, search]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const [createAdminCategory, { isLoading: creating }] = useCreateAdminCategoryMutation();
  const [updateAdminCategory, { isLoading: updating }] = useUpdateAdminCategoryMutation();
  const [deleteAdminCategory, { isLoading: deactivating }] = useDeleteAdminCategoryMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState<string>('');
  const [image, setImage] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder(0);
    setIsActive(true);
    setParentId('');
    setImage('');
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditingId(cat._id);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder ?? 0);
    setIsActive(Boolean(cat.isActive));
    setImage(cat.image || '');
    if (cat.parentId && typeof cat.parentId !== 'string') {
      setParentId(cat.parentId._id || '');
    } else {
      setParentId((cat.parentId as string | null) || '');
    }
    setDialogOpen(true);
  };

  const onSubmit = async () => {
    const payloadBase = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      sortOrder,
      isActive,
      image: image.trim() || undefined,
      parentId: parentId ? parentId : '',
    };

    try {
      if (editingId) {
        await updateAdminCategory({
          id: editingId,
          payload: payloadBase,
        }).unwrap();
        setToast({ message: 'Category updated', severity: 'success' });
      } else {
        await createAdminCategory(payloadBase).unwrap();
        setToast({ message: 'Category created', severity: 'success' });
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to save category',
        severity: 'error',
      });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Typography variant="h6" fontWeight={600}>
          Categories
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Active</InputLabel>
            <Select
              label="Active"
              value={active}
              onChange={(e) => setActive(e.target.value as 'all' | 'true' | 'false')}
            >
              <MenuItem value="all">all</MenuItem>
              <MenuItem value="true">active</MenuItem>
              <MenuItem value="false">inactive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={openCreate} disabled={creating}>
            Add category
          </Button>
        </Stack>
      </Stack>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load categories.</Typography>
        </Paper>
      ) : null}

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell align="right">Sort</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isLoading ? [] : paged).map((cat) => (
              <TableRow key={cat._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    {cat.image ? (
                      <Box
                        component="img"
                        src={cat.image}
                        alt={cat.name}
                        sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover' }}
                      />
                    ) : null}
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {cat.name}
                      </Typography>
                      {cat.path ? (
                        <Typography variant="caption" color="text.secondary">
                          {cat.path}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>{getParentLabel(cat)}</TableCell>
                <TableCell align="right">{cat.sortOrder ?? 0}</TableCell>
                <TableCell align="center">{cat.isActive ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(cat)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={!cat.isActive || deactivating}
                    sx={{ ml: 1 }}
                    onClick={() => {
                      setDeactivateId(cat._id);
                      setConfirmOpen(true);
                    }}
                  >
                    Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No categories found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_e, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit category' : 'Create category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText="Optional. If empty, slug will be generated from name."
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={3}
            />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
              <TextField
                label="Sort order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
              <TextField
                label="Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Parent category</InputLabel>
              <Select
                label="Parent category"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <MenuItem value="">(root)</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Active</InputLabel>
              <Select
                label="Active"
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
              >
                <MenuItem value="true">active</MenuItem>
                <MenuItem value="false">inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void onSubmit()}
            disabled={!name.trim() || updating || creating}
          >
            {editingId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Deactivate category?"
        confirmLabel="Deactivate"
        confirmColor="error"
        loading={deactivating}
        description="Deactivating disables this category in storefront and admin menus."
        onConfirm={() => {
          if (!deactivateId) return;
          void deleteAdminCategory(deactivateId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Category deactivated', severity: 'success' });
              setConfirmOpen(false);
            })
            .catch((e) => {
              setToast({
                message: e instanceof Error ? e.message : 'Failed to deactivate category',
                severity: 'error',
              });
            });
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
