import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';

import { getEnvConfig } from '../../../config';
import { ProductCard } from '../../../shared/ui/ProductCard';
import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { useListProductsQuery } from '../api/catalogApi';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { apiBaseUrl } = getEnvConfig();

  const { data, isLoading, isError } = useListProductsQuery(
    slug ? { limit: 60, categorySlug: slug } : { limit: 60 },
  );

  const [addToCart] = useAddItemToCartMutation();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const products = useMemo(() => data?.products ?? [], [data?.products]);

  const [categoryTitle, setCategoryTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setCategoryTitle(slug);

    let mounted = true;
    fetch(`${apiBaseUrl}/categories/${encodeURIComponent(slug)}`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load category (${r.status})`);
        return (await r.json()) as { name?: string };
      })
      .then((cat) => {
        if (!mounted) return;
        setCategoryTitle(cat.name ?? slug);
      })
      .catch(() => {
        if (!mounted) return;
        setCategoryTitle(slug);
      });

    return () => {
      mounted = false;
    };
  }, [apiBaseUrl, slug]);

  const handleAddToCart = useCallback(
    (productId: string) => {
      void (async () => {
        setAddingProductId(productId);
        try {
          await addToCart({ productId, qty: 1 }).unwrap();
        } catch {
          // UI stays minimal; errors can be surfaced later.
        } finally {
          setAddingProductId(null);
        }
      })();
    },
    [addToCart],
  );

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
        <Link component={RouterLink} to="/" underline="hover" color="inherit" variant="body2">
          Home
        </Link>
        <Typography color="text.primary" variant="body2" fontWeight={600}>
          {categoryTitle ?? ''}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 1 }}>
        {categoryTitle ?? ''}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {products.length} product{products.length === 1 ? '' : 's'} in this category
      </Typography>

      {isLoading || !categoryTitle ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <Typography color="error">Could not load products. Try again later.</Typography>
      ) : products.length === 0 ? (
        <Box
          sx={{
            py: 6,
            px: 2,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Typography color="text.secondary">
            No products in this category yet.{' '}
            <Link component={RouterLink} to="/" underline="hover">
              Continue shopping
            </Link>
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() => handleAddToCart(product._id)}
              addToCartLoading={addingProductId === product._id}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};
