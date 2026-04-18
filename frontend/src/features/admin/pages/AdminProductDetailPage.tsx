import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Box,
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

import type { Product } from '../../catalog/types';
import {
  useAdminCategoriesQuery,
  useAdminProductByIdQuery,
  useDeleteAdminProductMutation,
} from '../api/adminApi';
import { ProductFormDialog } from '../ui/ProductFormDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';

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

const primaryImage = (p: Product) => {
  const imgs = Array.isArray(p.images) ? p.images : [];
  return imgs[0] || p.image;
};

export const AdminProductDetailPage = () => {
  const navigate = useNavigate();
  const { productId = '' } = useParams();
  const { data: product, isLoading, isError } = useAdminProductByIdQuery(productId, {
    skip: !productId,
  });
  const { data: categories = [] } = useAdminCategoriesQuery({ active: 'all' });
  const [deleteProduct, { isLoading: deleting }] = useDeleteAdminProductMutation();

  const [toast, setToast] = useState<ToastState>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const title = product?.title || product?.name || 'Product';
  const stockVal = product ? product.stock ?? product.countInStock ?? 0 : 0;

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
            {productId ? `PRD-${productId.slice(-4).toUpperCase()}` : ''}
            {product?.slug ? ` · ${product.slug}` : ''}
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
            onClick={() => navigate('/admin/products')}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setFormOpen(true)}
            disabled={!product}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => setDeleteOpen(true)}
            disabled={!product}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">Loading product…</Typography>
        </Paper>
      ) : null}
      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load product.</Typography>
        </Paper>
      ) : null}

      {product ? (
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
              Pricing, inventory, and merchandising flags
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
              {primaryImage(product) ? (
                <Box
                  component="img"
                  src={primaryImage(product)}
                  alt={title}
                  sx={{ width: { xs: '100%', md: 160 }, maxHeight: 160, objectFit: 'contain', borderRadius: 1 }}
                />
              ) : null}
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                <DetailFieldRow label="Category" value={product.category || '—'} />
                <DetailFieldRow label="Price" value={`$${Number(product.price).toFixed(2)}`} />
                <DetailFieldRow
                  label="List / MSRP"
                  value={
                    product.originalPrice != null ? `$${Number(product.originalPrice).toFixed(2)}` : '—'
                  }
                />
                <DetailFieldRow
                  label="Sale price"
                  value={
                    product.discountPrice != null ? `$${Number(product.discountPrice).toFixed(2)}` : '—'
                  }
                />
                <DetailFieldRow label="Stock" value={String(stockVal)} />
                <DetailFieldRow label="Brand" value={product.brand || '—'} />
                <DetailFieldRow label="SKU" value={product.sku || '—'} />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    Flags
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {product.isFeatured ? <Chip size="small" label="Featured" color="primary" /> : null}
                    {product.isTrending ? <Chip size="small" label="Trending" color="secondary" /> : null}
                    {!product.isFeatured && !product.isTrending ? (
                      <Typography variant="body2">—</Typography>
                    ) : null}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Paper>

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
              Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {product.description || '—'}
            </Typography>
          </Paper>

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
              Images
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(Array.isArray(product.images) && product.images.length
                ? product.images
                : product.image
                  ? [product.image]
                  : []
              ).map((url, idx) => (
                <Box
                  key={`${url}-${idx}`}
                  component="img"
                  src={url}
                  alt=""
                  sx={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 1 }}
                />
              ))}
              {!product.images?.length && !product.image ? (
                <Typography variant="body2" color="text.secondary">
                  No images
                </Typography>
              ) : null}
            </Stack>
          </Paper>

          {product.warranty ? (
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, overflow: 'hidden' }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Warranty
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {product.warranty}
              </Typography>
            </Paper>
          ) : null}
        </Stack>
      ) : null}

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        editing={product ?? null}
        onToast={setToast}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this product?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        description="This permanently removes the product from the catalog."
        onConfirm={() => {
          if (!productId) return;
          void deleteProduct(productId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Product deleted', severity: 'success' });
              setDeleteOpen(false);
              navigate('/admin/products');
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
