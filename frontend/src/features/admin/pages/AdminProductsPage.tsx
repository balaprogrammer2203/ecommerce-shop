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

import type { Product } from '../../catalog/types';
import {
  useAdminCategoriesQuery,
  useAdminProductsQuery,
  useCreateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUpdateAdminProductMutation,
  useUploadAdminProductImageMutation,
} from '../api/adminApi';
import type { AdminProductInput } from '../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' } | null;

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unexpected file reader result'));
        return;
      }
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const normalizeDiscountText = (raw: string) => {
  const v = raw.trim();
  if (!v) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  return String(n);
};

export const AdminProductsPage = () => {
  const { data: categories = [] } = useAdminCategoriesQuery({ active: 'true' });
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [featured, setFeatured] = useState<'any' | 'true' | 'false'>('any');
  const [trending, setTrending] = useState<'any' | 'true' | 'false'>('any');
  const [sort, setSort] = useState<
    'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  >('newest');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [keyword, categoryId, brand, minPrice, maxPrice, featured, trending, sort]);

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
    featured: featured === 'any' ? undefined : featured === 'true',
    trending: trending === 'any' ? undefined : trending === 'true',
    sort,
  });

  const products: Product[] = productsRes?.products ?? [];
  const total = productsRes?.total ?? 0;

  const [toast, setToast] = useState<ToastState>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProductId, setConfirmProductId] = useState<string | null>(null);

  const [createProduct, { isLoading: creating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateAdminProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteAdminProductMutation();
  const [uploadProductImage, { isLoading: uploadingImage }] = useUploadAdminProductImageMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formBrand, setFormBrand] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formWarranty, setFormWarranty] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageFileBusy, setImageFileBusy] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;
    if (!formCategoryId && categories.length) setFormCategoryId(categories[0]._id);
  }, [dialogOpen, formCategoryId, categories]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategoryId(categories[0]?._id ?? '');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormStock('0');
    setFormBrand('');
    setFormSku('');
    setFormWarranty('');
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setImages([]);
    setNewImageUrl('');
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p._id);
    setFormTitle(p.title || p.name || '');
    setFormDescription(p.description || '');
    const inferredCategoryId = p.categories && p.categories.length ? p.categories[0]._id : '';
    setFormCategoryId(inferredCategoryId || (categories[0]?._id ?? ''));
    const listPrice = p.originalPrice != null ? String(p.originalPrice) : String(p.price ?? 0);
    setFormPrice(listPrice);
    const sale = p.discountPrice ?? null;
    setFormDiscountPrice(sale != null ? String(sale) : '');
    const stockVal = p.stock ?? p.countInStock ?? 0;
    setFormStock(String(stockVal ?? 0));
    setFormBrand(p.brand ?? '');
    setFormSku(p.sku ?? '');
    setFormWarranty(p.warranty ?? '');
    setFormIsFeatured(Boolean(p.isFeatured));
    setFormIsTrending(Boolean(p.isTrending));
    const imgs = Array.isArray(p.images) ? p.images : [];
    setImages(imgs.length ? imgs : p.image ? [p.image] : []);
    setNewImageUrl('');
    setDialogOpen(true);
  };

  const canSubmit = useMemo(() => {
    const priceNum = Number(formPrice);
    if (!formTitle.trim() || !formDescription.trim()) return false;
    if (!formCategoryId) return false;
    if (Number.isNaN(priceNum) || priceNum <= 0) return false;
    const stockNum = Number(formStock);
    if (Number.isNaN(stockNum) || stockNum < 0) return false;
    const discountNum = formDiscountPrice.trim() === '' ? null : Number(formDiscountPrice.trim());
    if (discountNum != null && (Number.isNaN(discountNum) || discountNum < 0)) return false;
    return true;
  }, [formTitle, formDescription, formCategoryId, formPrice, formStock, formDiscountPrice]);

  const submit = async () => {
    const priceNum = Number(formPrice);
    const stockNum = Number(formStock);
    const discountNum = formDiscountPrice.trim() === '' ? null : Number(formDiscountPrice.trim());

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      categoryId: formCategoryId,
      price: priceNum,
      discountPrice: discountNum,
      stock: stockNum,
      brand: formBrand.trim() || undefined,
      sku: formSku.trim() || undefined,
      warranty: formWarranty.trim() || undefined,
      isFeatured: formIsFeatured,
      isTrending: formIsTrending,
      images,
    } satisfies AdminProductInput;

    try {
      if (editingId) {
        await updateProduct({ id: editingId, payload }).unwrap();
        setToast({ message: 'Product updated', severity: 'success' });
      } else {
        await createProduct(payload).unwrap();
        setToast({ message: 'Product created', severity: 'success' });
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to save product',
        severity: 'error',
      });
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setImageFileBusy(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await uploadProductImage({ imageBase64 }).unwrap();
      setImages((prev) => Array.from(new Set([...prev, res.imageUrl])));
      setToast({ message: 'Image uploaded', severity: 'success' });
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Image upload failed',
        severity: 'error',
      });
    } finally {
      setImageFileBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Typography variant="h6" fontWeight={600}>
          Products
        </Typography>
        <Button variant="contained" onClick={openCreate} disabled={creating}>
          Add product
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <TextField
            size="small"
            label="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
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
          />
          <TextField
            size="small"
            label="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <TextField
            size="small"
            label="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Featured</InputLabel>
            <Select
              label="Featured"
              value={featured}
              onChange={(e) => setFeatured(e.target.value as 'any' | 'true' | 'false')}
            >
              <MenuItem value="any">any</MenuItem>
              <MenuItem value="true">yes</MenuItem>
              <MenuItem value="false">no</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Trending</InputLabel>
            <Select
              label="Trending"
              value={trending}
              onChange={(e) => setTrending(e.target.value as 'any' | 'true' | 'false')}
            >
              <MenuItem value="any">any</MenuItem>
              <MenuItem value="true">yes</MenuItem>
              <MenuItem value="false">no</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort</InputLabel>
            <Select
              label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-asc">Price low</MenuItem>
              <MenuItem value="price-desc">Price high</MenuItem>
              <MenuItem value="name-asc">Name A-Z</MenuItem>
              <MenuItem value="name-desc">Name Z-A</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load products.</Typography>
        </Paper>
      ) : null}

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="center">Flags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isLoading ? [] : products).map((p) => {
              const stockVal = p.stock ?? p.countInStock ?? 0;
              const imgs = Array.isArray(p.images) ? p.images : [];
              const thumb = imgs[0] || p.image;
              return (
                <TableRow key={p._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      {thumb ? (
                        <Box
                          component="img"
                          src={thumb}
                          alt={p.title || p.name}
                          sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover' }}
                        />
                      ) : null}
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {p.title || p.name}
                        </Typography>
                        {p.slug ? (
                          <Typography variant="caption" color="text.secondary">
                            {p.slug}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell align="right">
                    ${p.price.toFixed(2)}
                    {p.originalPrice != null && p.originalPrice > p.price ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        MSRP ${p.originalPrice.toFixed(2)}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">{stockVal ?? 0}</TableCell>
                  <TableCell align="center">
                    {p.isFeatured ? 'Featured' : ''}
                    {p.isTrending ? (p.isFeatured ? ' + Trending' : 'Trending') : ''}
                    {!p.isFeatured && !p.isTrending ? '-' : null}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={deleting}
                      sx={{ ml: 1 }}
                      onClick={() => {
                        setConfirmProductId(p._id);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit product' : 'Create product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
              <TextField
                label="Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              multiline
              minRows={3}
            />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr 1fr' }}>
              <TextField
                label="List price (MSRP)"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
              />
              <TextField
                label="Discount price (sale)"
                value={formDiscountPrice}
                onChange={(e) => setFormDiscountPrice(normalizeDiscountText(e.target.value))}
                placeholder="Optional"
              />
              <TextField
                label="Stock"
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr 1fr' }}>
              <TextField
                label="Brand"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
              />
              <TextField label="SKU" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
              <TextField
                label="Warranty"
                value={formWarranty}
                onChange={(e) => setFormWarranty(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
              <FormControl>
                <InputLabel>Featured</InputLabel>
                <Select
                  label="Featured"
                  value={formIsFeatured ? 'true' : 'false'}
                  onChange={(e) => setFormIsFeatured(e.target.value === 'true')}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Trending</InputLabel>
                <Select
                  label="Trending"
                  value={formIsTrending ? 'true' : 'false'}
                  onChange={(e) => setFormIsTrending(e.target.value === 'true')}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Images
                </Typography>
                <Button component="label" size="small" disabled={imageFileBusy || uploadingImage}>
                  Upload
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUploadFile(file);
                      e.currentTarget.value = '';
                    }}
                  />
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Add image URL"
                  value={newImageUrl}
                  size="small"
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={!newImageUrl.trim()}
                  onClick={() => {
                    const url = newImageUrl.trim();
                    setImages((prev) => Array.from(new Set([...prev, url])));
                    setNewImageUrl('');
                  }}
                >
                  Add
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {images.length ? (
                  images.map((url, idx) => (
                    <Box key={`${url}-${idx}`} sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        sx={{
                          width: 90,
                          height: 70,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: '1px solid rgba(148,163,184,0.35)',
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeImage(idx)}
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                      >
                        x
                      </Button>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No images yet.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void submit()}
            disabled={!canSubmit || updating || creating}
          >
            {editingId ? (updating ? 'Saving...' : 'Save') : creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete product?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        description="This will permanently remove the product."
        onConfirm={() => {
          if (!confirmProductId) return;
          void deleteProduct(confirmProductId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Product deleted', severity: 'success' });
              setConfirmOpen(false);
              setConfirmProductId(null);
            })
            .catch((e) => {
              setToast({
                message: e instanceof Error ? e.message : 'Failed to delete product',
                severity: 'error',
              });
            })
            .finally(() => undefined);
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
