import {
  Alert,
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
  useAdminCategoryAttributesQuery,
  useCreateAdminCategoryAttributeMutation,
  useDeleteAdminCategoryAttributeMutation,
  useUpdateAdminCategoryAttributeMutation,
} from '../api/adminApi';
import type { AdminCategory, AdminCategoryAttribute } from '../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' } | null;

const parseValues = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);

export const AdminCategoryAttributesPage = () => {
  const { data: categories = [], isLoading: loadingCategories } = useAdminCategoriesQuery({
    active: 'true',
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    if (!selectedCategoryId && categories.length) setSelectedCategoryId(categories[0]._id);
  }, [categories, selectedCategoryId]);

  const {
    data: attributes = [],
    isLoading: loadingAttributes,
    isError: attributesError,
  } = useAdminCategoryAttributesQuery(
    { categoryId: selectedCategoryId || '' },
    { skip: !selectedCategoryId },
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attributes;
    return attributes.filter(
      (a) => a.key.toLowerCase().includes(q) || a.label.toLowerCase().includes(q),
    );
  }, [attributes, search]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => setPage(0), [selectedCategoryId, search]);

  const [toast, setToast] = useState<ToastState>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAttrId, setConfirmAttrId] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState<'deactivate' | 'delete'>('deactivate');

  const [createAttr, { isLoading: creating }] = useCreateAdminCategoryAttributeMutation();
  const [updateAttr, { isLoading: updating }] = useUpdateAdminCategoryAttributeMutation();
  const [deleteAttr, { isLoading: deleting }] = useDeleteAdminCategoryAttributeMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [keyValue, setKeyValue] = useState('');
  const [label, setLabel] = useState('');
  const [valuesText, setValuesText] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setKeyValue('');
    setLabel('');
    setValuesText('');
    setSortOrder(0);
    setIsActive(true);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (attr: AdminCategoryAttribute) => {
    setEditingId(attr._id);
    setKeyValue(attr.key);
    setLabel(attr.label);
    setValuesText(attr.values.join(', '));
    setSortOrder(attr.sortOrder ?? 0);
    setIsActive(attr.isActive);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!selectedCategoryId) return;
    const parsed = parseValues(valuesText);
    const createPayload = {
      categoryId: selectedCategoryId,
      label: label.trim(),
      key: keyValue.trim() || undefined,
      values: parsed,
      sortOrder,
      isActive,
    } satisfies Partial<
      Pick<
        AdminCategoryAttribute,
        'categoryId' | 'key' | 'label' | 'values' | 'sortOrder' | 'isActive'
      >
    >;

    try {
      if (editingId) {
        const updatePayload = {
          label: createPayload.label,
          key: createPayload.key,
          values: createPayload.values,
          sortOrder: createPayload.sortOrder,
          isActive: createPayload.isActive,
        };
        await updateAttr({ id: editingId, payload: updatePayload }).unwrap();
        setToast({ message: 'Attribute updated', severity: 'success' });
      } else {
        await createAttr(createPayload).unwrap();
        setToast({ message: 'Attribute created', severity: 'success' });
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to save attribute',
        severity: 'error',
      });
    }
  };

  const performConfirm = async () => {
    if (!confirmAttrId) return;
    try {
      if (confirmMode === 'deactivate') {
        await updateAttr({ id: confirmAttrId, payload: { isActive: false } }).unwrap();
        setToast({ message: 'Attribute deactivated', severity: 'success' });
      } else {
        await deleteAttr(confirmAttrId).unwrap();
        setToast({ message: 'Attribute deleted', severity: 'success' });
      }
      setConfirmOpen(false);
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to perform action',
        severity: 'error',
      });
    }
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c._id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Typography variant="h6" fontWeight={600}>
          Category Attributes
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={loadingCategories}
            >
              {categories.map((c: AdminCategory) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={openCreate}
            disabled={!selectedCategoryId || creating}
          >
            Add attribute
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedCategory
            ? `Managing attributes for: ${selectedCategory.name} (${selectedCategory.slug})`
            : 'Select a category.'}
        </Typography>
      </Paper>

      {attributesError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load attributes.</Typography>
        </Paper>
      ) : null}

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Values</TableCell>
              <TableCell align="right">Sort</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(loadingAttributes ? [] : paged).map((attr) => (
              <TableRow key={attr._id} hover>
                <TableCell>{attr.key}</TableCell>
                <TableCell>{attr.label}</TableCell>
                <TableCell sx={{ maxWidth: 420 }}>
                  <Typography variant="body2" noWrap>
                    {attr.values.slice(0, 4).join(', ')}
                    {attr.values.length > 4 ? '…' : ''}
                  </Typography>
                </TableCell>
                <TableCell align="right">{attr.sortOrder ?? 0}</TableCell>
                <TableCell align="center">{attr.isActive ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(attr)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={!attr.isActive || updating}
                    sx={{ ml: 1 }}
                    onClick={() => {
                      setConfirmMode('deactivate');
                      setConfirmAttrId(attr._id);
                      setConfirmOpen(true);
                    }}
                  >
                    Deactivate
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    disabled={deleting}
                    onClick={() => {
                      setConfirmMode('delete');
                      setConfirmAttrId(attr._id);
                      setConfirmOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loadingAttributes && paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No attributes found.
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
        <DialogTitle>{editingId ? 'Edit attribute' : 'Create attribute'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            <TextField
              label="Key (optional)"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              helperText="If empty, key will be generated from label."
            />
            <TextField
              label="Values (comma separated)"
              value={valuesText}
              onChange={(e) => setValuesText(e.target.value)}
              multiline
              minRows={2}
            />
            <TextField
              label="Sort order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
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
            onClick={() => void submit()}
            disabled={!label.trim() || creating || updating}
          >
            {editingId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmMode === 'deactivate' ? 'Deactivate attribute?' : 'Delete attribute?'}
        confirmColor="error"
        confirmLabel={confirmMode === 'deactivate' ? 'Deactivate' : 'Delete'}
        loading={deleting || updating}
        description={
          confirmMode === 'deactivate'
            ? 'Attribute will be hidden from filters and facets until re-enabled.'
            : 'Attribute will be permanently removed.'
        }
        onConfirm={() => void performConfirm()}
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
