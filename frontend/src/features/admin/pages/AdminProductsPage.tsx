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
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Product } from '../../catalog/types';
import {
  useAdminCategoriesQuery,
  useAdminProductsQuery,
  useDeleteAdminProductMutation,
} from '../api/adminApi';
import { ProductFormDialog } from '../ui/ProductFormDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' | 'warning' } | null;
type ListScope = 'all' | 'featured' | 'trending';
type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

type VisibleCols = 'product' | 'category' | 'brand' | 'price' | 'stock' | 'flags';

const columnOptions: Array<{ key: VisibleCols; label: string }> = [
  { key: 'product', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'brand', label: 'Brand' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'flags', label: 'Flags' },
];

const initialsFrom = (name: string) => {
  const raw = name.trim();
  if (!raw) return 'PR';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
};

export const AdminProductsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [listScope, setListScope] = useState<ListScope>('all');
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<VisibleCols, boolean>>({
    product: true,
    category: true,
    brand: true,
    price: true,
    stock: true,
    flags: true,
  });

  const [toast, setToast] = useState<ToastState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [rowMenuProductId, setRowMenuProductId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: categories = [] } = useAdminCategoriesQuery({ active: 'all' });
  const [deleteProduct, { isLoading: deletingSingle }] = useDeleteAdminProductMutation();

  const featuredParam = listScope === 'featured' ? true : undefined;
  const trendingParam = listScope === 'trending' ? true : undefined;

  useEffect(() => {
    setPage(0);
  }, [keyword, categoryId, brand, minPrice, maxPrice, sort, listScope, rowsPerPage]);

  const {
    data: productsRes,
    isLoading,
    isError,
  } = useAdminProductsQuery({
    page: page + 1,
    limit: rowsPerPage,
    keyword: keyword.trim() || undefined,
    categoryId: categoryId || undefined,
    minPrice: minPrice.trim() ? Number(minPrice) : undefined,
    maxPrice: maxPrice.trim() ? Number(maxPrice) : undefined,
    brand: brand.trim() || undefined,
    featured: featuredParam,
    trending: trendingParam,
    sort,
  });

  const products: Product[] = productsRes?.products ?? [];
  const total = productsRes?.total ?? 0;

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => products.some((p) => p._id === id)));
  }, [products]);

  const toggleColumnVisibility = (column: VisibleCols) => {
    const n = Object.values(visibleColumns).filter(Boolean).length;
    if (visibleColumns[column] && n <= 1) return;
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;

  const exportRows = useMemo(() => {
    if (selectedIds.length > 0) return products.filter((p) => selectedIds.includes(p._id));
    return products;
  }, [products, selectedIds]);

  const exportToCsv = () => {
    if (exportRows.length === 0) {
      setToast({ message: 'No rows to export', severity: 'error' });
      return;
    }
    const headers = ['Title', 'Slug', 'Category', 'Brand', 'Price', 'Stock', 'Featured', 'Trending'];
    const esc = (v: string | number | boolean) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = exportRows.map((p) => {
      const stockVal = p.stock ?? p.countInStock ?? 0;
      return [
        p.title || p.name,
        p.slug || '',
        p.category || '',
        p.brand || '',
        p.price,
        stockVal,
        p.isFeatured ? 'Yes' : 'No',
        p.isTrending ? 'Yes' : 'No',
      ];
    });
    const csv = [headers, ...rows].map((line) => line.map((cell) => esc(cell)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({
      message:
        selectedIds.length > 0
          ? `Exported ${exportRows.length} selected product(s)`
          : `Exported ${exportRows.length} product(s) on this page`,
      severity: 'success',
    });
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormOpen(true);
  };

  const viewProduct = (id: string) => {
    navigate(`/admin/products/${id}`);
    closeRowMenu();
  };

  const openRowMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setRowMenuAnchorEl(e.currentTarget);
    setRowMenuProductId(id);
  };

  const closeRowMenu = () => {
    setRowMenuAnchorEl(null);
    setRowMenuProductId(null);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isAllSelected = products.length > 0 && products.every((p) => selectedIds.includes(p._id));
  const isSomeSelected = products.some((p) => selectedIds.includes(p._id)) && !isAllSelected;

  const toggleSelectAllPage = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !products.some((p) => p._id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const s = new Set(prev);
      products.forEach((p) => s.add(p._id));
      return Array.from(s);
    });
  };

  const runBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(selectedIds.map((id) => deleteProduct(id).unwrap()));
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.length - ok;
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      if (fail === 0) {
        setToast({ message: `Deleted ${ok} product(s)`, severity: 'success' });
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

  const thumb = (p: Product) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    return imgs[0] || p.image;
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
          Products
        </Typography>
        <Button variant="contained" onClick={openCreate} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          New product
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Search, filter, and manage catalog products. Pagination is server-backed; bulk actions apply to the current page.
      </Typography>

      <Tabs
        value={listScope}
        onChange={(_e, v) => setListScope(v as ListScope)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ minHeight: 44, '& .MuiTabScrollButton-root': { width: { xs: 28, sm: 40 } } }}
      >
        <Tab value="all" label="All" />
        <Tab value="featured" label="Featured" />
        <Tab value="trending" label="Trending" />
      </Tabs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.25}
      >
        <Typography variant="h6" fontWeight={600}>
          Products
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
          <Button size="small" variant="outlined" onClick={(e) => setColumnsAnchorEl(e.currentTarget)}>
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
            <Button size="small" onClick={() => setSelectedIds([])} startIcon={<CloseRoundedIcon fontSize="small" />}>
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
            label="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ flex: { sm: '1 1 200px' }, minWidth: { sm: 160 }, maxWidth: { sm: 360 } }}
          />
          <FormControl size="small" fullWidth sx={{ minWidth: { sm: 220 }, flex: { sm: '0 1 260px' } }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <MenuItem value="">all</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            sx={{ minWidth: { sm: 140 }, flex: { sm: '0 1 160px' } }}
          />
          <TextField
            size="small"
            label="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            sx={{ width: { xs: '100%', sm: 110 } }}
          />
          <TextField
            size="small"
            label="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            sx={{ width: { xs: '100%', sm: 110 } }}
          />
          <FormControl size="small" fullWidth sx={{ minWidth: { sm: 160 }, flex: { sm: '0 1 200px' } }}>
            <InputLabel>Sort</InputLabel>
            <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-asc">Price low</MenuItem>
              <MenuItem value="price-desc">Price high</MenuItem>
              <MenuItem value="name-asc">Name A–Z</MenuItem>
              <MenuItem value="name-desc">Name Z–A</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load products.</Typography>
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
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={(e) => toggleSelectAllPage(e.target.checked)}
                      inputProps={{ 'aria-label': 'Select all on page' }}
                    />
                  </TableCell>
                  {visibleColumns.product ? <TableCell>Product</TableCell> : null}
                  {visibleColumns.category ? <TableCell>Category</TableCell> : null}
                  {visibleColumns.brand ? <TableCell>Brand</TableCell> : null}
                  {visibleColumns.price ? <TableCell align="right">Price</TableCell> : null}
                  {visibleColumns.stock ? <TableCell align="right">Stock</TableCell> : null}
                  {visibleColumns.flags ? <TableCell align="center">Flags</TableCell> : null}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(isLoading ? [] : products).map((p) => {
                  const stockVal = p.stock ?? p.countInStock ?? 0;
                  const t = thumb(p);
                  return (
                    <TableRow key={p._id} hover sx={{ cursor: 'pointer' }} onClick={() => viewProduct(p._id)}>
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Checkbox
                          checked={selectedIds.includes(p._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRowSelection(p._id);
                          }}
                        />
                      </TableCell>
                      {visibleColumns.product ? (
                        <TableCell>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            {t ? (
                              <Avatar src={t} variant="rounded" sx={{ width: 36, height: 36 }} />
                            ) : (
                              <Avatar variant="rounded" sx={{ width: 36, height: 36, fontSize: 12 }}>
                                {initialsFrom(p.title || p.name)}
                              </Avatar>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {p.title || p.name}
                              </Typography>
                              {p.slug ? (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {p.slug}
                                </Typography>
                              ) : null}
                            </Box>
                          </Stack>
                        </TableCell>
                      ) : null}
                      {visibleColumns.category ? (
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="body2" noWrap>
                            {p.category}
                          </Typography>
                        </TableCell>
                      ) : null}
                      {visibleColumns.brand ? (
                        <TableCell sx={{ maxWidth: 120 }}>
                          <Typography variant="body2" noWrap>
                            {p.brand || '—'}
                          </Typography>
                        </TableCell>
                      ) : null}
                      {visibleColumns.price ? (
                        <TableCell align="right">
                          ${p.price.toFixed(2)}
                          {p.originalPrice != null && p.originalPrice > p.price ? (
                            <Typography variant="caption" color="text.secondary" display="block">
                              MSRP ${p.originalPrice.toFixed(2)}
                            </Typography>
                          ) : null}
                        </TableCell>
                      ) : null}
                      {visibleColumns.stock ? <TableCell align="right">{stockVal}</TableCell> : null}
                      {visibleColumns.flags ? (
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" useFlexGap>
                            {p.isFeatured ? <Chip size="small" label="Featured" /> : null}
                            {p.isTrending ? <Chip size="small" label="Trending" variant="outlined" /> : null}
                            {!p.isFeatured && !p.isTrending ? (
                              <Typography variant="caption" color="text.secondary">
                                —
                              </Typography>
                            ) : null}
                          </Stack>
                        </TableCell>
                      ) : null}
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="text"
                          onClick={(e) => openRowMenu(e, p._id)}
                          sx={{ minWidth: 32, px: 0.5 }}
                        >
                          <MoreHorizRoundedIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount + 2}>
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No products found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {(isLoading ? [] : products).map((p) => {
              const stockVal = p.stock ?? p.countInStock ?? 0;
              const t = thumb(p);
              return (
                <Paper
                  key={p._id}
                  variant="outlined"
                  onClick={() => viewProduct(p._id)}
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(p._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRowSelection(p._id);
                        }}
                        sx={{ p: 0.5, ml: -0.5 }}
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => openRowMenu(e, p._id)}
                        sx={{ minWidth: 40, px: 0.5 }}
                        aria-label="Row actions"
                      >
                        <MoreHorizRoundedIcon fontSize="small" />
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      {t ? (
                        <Avatar src={t} variant="rounded" sx={{ width: 40, height: 40 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 40, fontSize: 12 }}>
                          {initialsFrom(p.title || p.name)}
                        </Avatar>
                      )}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                          {p.title || p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          {p.slug || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: 'right', wordBreak: 'break-word' }}>
                        {p.category}
                      </Typography>
                    </Stack>
                    {visibleColumns.brand ? (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Brand
                        </Typography>
                        <Typography variant="caption">{p.brand || '—'}</Typography>
                      </Stack>
                    ) : null}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>
                        ${p.price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Stock {stockVal}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {p.isFeatured ? <Chip size="small" label="Featured" /> : null}
                      {p.isTrending ? <Chip size="small" label="Trending" variant="outlined" /> : null}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
            {!isLoading && products.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No products found.
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
            Page {page + 1} of {Math.max(1, Math.ceil(total / rowsPerPage) || 1)} · {total} total
          </Typography>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_e, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
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
          paper: { sx: { minWidth: 170, border: '1px solid rgba(229,231,235,1)', borderRadius: 2 } },
        }}
      >
        <MenuItem
          onClick={() => {
            if (rowMenuProductId) viewProduct(rowMenuProductId);
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            const p = products.find((x) => x._id === rowMenuProductId);
            if (p) openEdit(p);
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (!rowMenuProductId) return;
            setSingleDeleteId(rowMenuProductId);
            setSingleDeleteOpen(true);
            closeRowMenu();
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <ProductFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        categories={categories}
        editing={editingProduct}
        onToast={setToast}
      />

      <ConfirmDialog
        open={singleDeleteOpen}
        onClose={() => {
          setSingleDeleteOpen(false);
          setSingleDeleteId(null);
        }}
        title="Delete this product?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deletingSingle}
        description="This permanently removes the product."
        onConfirm={() => {
          if (!singleDeleteId) return;
          void deleteProduct(singleDeleteId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Product deleted', severity: 'success' });
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
        description="Deletes run in parallel; failures are summarized in the toast."
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
