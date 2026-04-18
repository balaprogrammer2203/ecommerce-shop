import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useAdminCategoriesQuery,
  useAdminCategoryByIdQuery,
  useDeleteAdminCategoryMutation,
} from '../api/adminApi';
import type { AdminCategory } from '../types';
import { CategoryFormDialog } from '../ui/CategoryFormDialog';
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

const parentLabel = (cat: AdminCategory) => {
  const p = cat.parentId;
  if (!p) return '—';
  if (typeof p === 'string') return p;
  return p.name || p.slug || '—';
};

export const AdminCategoryDetailPage = () => {
  const navigate = useNavigate();
  const { categoryId = '' } = useParams();
  const {
    data: category,
    isLoading,
    isError,
  } = useAdminCategoryByIdQuery(categoryId, {
    skip: !categoryId,
  });
  const { data: allCategories = [] } = useAdminCategoriesQuery({ active: 'all' });
  const [deleteCategory, { isLoading: deactivating }] = useDeleteAdminCategoryMutation();

  const [toast, setToast] = useState<ToastState>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

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
            {category ? category.name : 'Category'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {categoryId ? `CAT-${categoryId.slice(-4).toUpperCase()}` : ''}
            {category?.slug ? ` · /${category.slug}` : ''}
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
            onClick={() => navigate('/admin/categories')}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setFormOpen(true)}
            disabled={!category}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneRoundedIcon />}
            onClick={() =>
              navigate(
                categoryId
                  ? `/admin/category-attributes?categoryId=${encodeURIComponent(categoryId)}`
                  : '/admin/category-attributes',
              )
            }
            disabled={!categoryId}
          >
            Attributes
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => setDeactivateOpen(true)}
            disabled={!category?.isActive}
          >
            Deactivate
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">Loading category…</Typography>
        </Paper>
      ) : null}
      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load category.</Typography>
        </Paper>
      ) : null}

      {category ? (
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
              Core category fields and hierarchy
            </Typography>
            <Stack spacing={1}>
              <DetailFieldRow label="Name" value={category.name} />
              <DetailFieldRow label="Slug" value={category.slug || '—'} />
              <DetailFieldRow label="Path" value={category.path || '—'} />
              <DetailFieldRow label="Level" value={String(category.level ?? '—')} />
              <DetailFieldRow label="Parent" value={parentLabel(category)} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ columnGap: { sm: 2 } }}
              >
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  size="small"
                  label={category.isActive ? 'Active' : 'Inactive'}
                  color={category.isActive ? 'success' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <DetailFieldRow label="Sort order" value={String(category.sortOrder ?? 0)} />
              <Divider />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {category.description?.trim() ? category.description : '—'}
              </Typography>
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
              Media
            </Typography>
            {category.image ? (
              <Box
                component="img"
                src={category.image}
                alt={category.name}
                sx={{ maxWidth: '100%', maxHeight: 220, borderRadius: 1, objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No image URL set.
              </Typography>
            )}
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
              SEO
            </Typography>
            <Stack spacing={1}>
              <DetailFieldRow label="Meta title" value={category.metaTitle || '—'} />
              <Typography variant="body2" color="text.secondary">
                Meta description
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {category.metaDescription?.trim() ? category.metaDescription : '—'}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      ) : null}

      <CategoryFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={allCategories}
        editing={category ?? null}
        onToast={setToast}
      />

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Deactivate this category?"
        confirmLabel="Deactivate"
        confirmColor="error"
        loading={deactivating}
        description="Deactivating disables this category in storefront and admin menus."
        onConfirm={() => {
          if (!categoryId) return;
          void deleteCategory(categoryId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Category deactivated', severity: 'success' });
              setDeactivateOpen(false);
              navigate('/admin/categories');
            })
            .catch((e) =>
              setToast({
                message: e instanceof Error ? e.message : 'Failed to deactivate',
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
