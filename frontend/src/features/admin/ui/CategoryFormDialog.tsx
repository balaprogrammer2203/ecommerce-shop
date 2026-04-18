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
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useCreateAdminCategoryMutation, useUpdateAdminCategoryMutation } from '../api/adminApi';
import type { AdminCategory } from '../types';

type ToastHandler = (t: { message: string; severity: 'success' | 'error' | 'warning' }) => void;

type CategoryFormDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Categories for parent dropdown (typically active=all list). */
  categories: AdminCategory[];
  /** When set, dialog is in edit mode. */
  editing: AdminCategory | null;
  onToast: ToastHandler;
};

export const CategoryFormDialog = ({
  open,
  onClose,
  categories,
  editing,
  onToast,
}: CategoryFormDialogProps) => {
  const [createAdminCategory, { isLoading: creating }] = useCreateAdminCategoryMutation();
  const [updateAdminCategory, { isLoading: updating }] = useUpdateAdminCategoryMutation();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState<string>('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name || '');
      setSlug(editing.slug || '');
      setDescription(editing.description || '');
      setSortOrder(editing.sortOrder ?? 0);
      setIsActive(Boolean(editing.isActive));
      setImage(editing.image || '');
      if (editing.parentId && typeof editing.parentId !== 'string') {
        setParentId(editing.parentId._id || '');
      } else {
        setParentId((editing.parentId as string | null) || '');
      }
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setSortOrder(0);
      setIsActive(true);
      setParentId('');
      setImage('');
    }
  }, [open, editing]);

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
      if (editing) {
        await updateAdminCategory({
          id: editing._id,
          payload: payloadBase,
        }).unwrap();
        onToast({ message: 'Category updated', severity: 'success' });
      } else {
        await createAdminCategory(payloadBase).unwrap();
        onToast({ message: 'Category created', severity: 'success' });
      }
      onClose();
    } catch (e) {
      onToast({
        message: e instanceof Error ? e.message : 'Failed to save category',
        severity: 'error',
      });
    }
  };

  const saving = creating || updating;

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Edit category' : 'Create category'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
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
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}
          >
            <TextField
              label="Sort order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
            <TextField label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Parent category</InputLabel>
            <Select
              label="Parent category"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <MenuItem value="">(root)</MenuItem>
              {categories
                .filter((c) => !editing || c._id !== editing._id)
                .map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
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
        <Button onClick={() => onClose()} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void onSubmit()}
          disabled={!name.trim() || saving}
        >
          {editing ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
