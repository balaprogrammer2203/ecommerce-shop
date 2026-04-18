import {
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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import type { Product } from '../../catalog/types';
import {
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useUploadAdminProductImageMutation,
} from '../api/adminApi';
import type { AdminCategory, AdminProductInput } from '../types';

type ToastHandler = (t: { message: string; severity: 'success' | 'error' | 'warning' }) => void;

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

type ProductFormDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: AdminCategory[];
  editing: Product | null;
  onToast: ToastHandler;
};

export const ProductFormDialog = ({ open, onClose, categories, editing, onToast }: ProductFormDialogProps) => {
  const [createProduct, { isLoading: creating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateAdminProductMutation();
  const [uploadProductImage, { isLoading: uploadingImage }] = useUploadAdminProductImageMutation();

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
    if (!open) return;
    if (editing) {
      setFormTitle(editing.title || editing.name || '');
      setFormDescription(editing.description || '');
      const inferredCategoryId =
        editing.categories && editing.categories.length ? editing.categories[0]._id : '';
      setFormCategoryId(inferredCategoryId || (categories[0]?._id ?? ''));
      const listPrice =
        editing.originalPrice != null ? String(editing.originalPrice) : String(editing.price ?? 0);
      setFormPrice(listPrice);
      const sale = editing.discountPrice ?? null;
      setFormDiscountPrice(sale != null ? String(sale) : '');
      const stockVal = editing.stock ?? editing.countInStock ?? 0;
      setFormStock(String(stockVal ?? 0));
      setFormBrand(editing.brand ?? '');
      setFormSku(editing.sku ?? '');
      setFormWarranty(editing.warranty ?? '');
      setFormIsFeatured(Boolean(editing.isFeatured));
      setFormIsTrending(Boolean(editing.isTrending));
      const imgs = Array.isArray(editing.images) ? editing.images : [];
      setImages(imgs.length ? imgs : editing.image ? [editing.image] : []);
      setNewImageUrl('');
    } else {
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
    }
  }, [open, editing, categories]);

  useEffect(() => {
    if (!open) return;
    if (!formCategoryId && categories.length) setFormCategoryId(categories[0]._id);
  }, [open, formCategoryId, categories]);

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
      if (editing) {
        await updateProduct({ id: editing._id, payload }).unwrap();
        onToast({ message: 'Product updated', severity: 'success' });
      } else {
        await createProduct(payload).unwrap();
        onToast({ message: 'Product created', severity: 'success' });
      }
      onClose();
    } catch (e) {
      onToast({
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
      onToast({ message: 'Image uploaded', severity: 'success' });
    } catch (e) {
      onToast({
        message: e instanceof Error ? e.message : 'Image upload failed',
        severity: 'error',
      });
    } finally {
      setImageFileBusy(false);
    }
  };

  const saving = creating || updating;

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="md">
      <DialogTitle>{editing ? 'Edit product' : 'Create product'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
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
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            }}
          >
            <TextField label="List price (MSRP)" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
            <TextField
              label="Discount price (sale)"
              value={formDiscountPrice}
              onChange={(e) => setFormDiscountPrice(normalizeDiscountText(e.target.value))}
              placeholder="Optional"
            />
            <TextField label="Stock" type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            }}
          >
            <TextField label="Brand" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} />
            <TextField label="SKU" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
            <TextField label="Warranty" value={formWarranty} onChange={(e) => setFormWarranty(e.target.value)} />
          </Box>
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <TextField
                label="Add image URL"
                value={newImageUrl}
                size="small"
                fullWidth
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
                sx={{ flexShrink: 0 }}
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
        <Button onClick={() => onClose()} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void submit()} disabled={!canSubmit || saving}>
          {editing ? (updating ? 'Saving…' : 'Save') : creating ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
