import { Box, Container, Typography } from '@mui/material';

import type { Product } from '../../../features/catalog/types';
import { ProductCard } from '../ProductCard';
import { PageLoader } from '../system/Loader';

type FeaturedProductsSectionProps = {
  title?: string;
  products: Product[];
  isLoading: boolean;
  onAddToCart: (productId: string) => void;
  addingProductId?: string | null;
};

export const FeaturedProductsSection = ({
  title = 'Featured for you',
  products,
  isLoading,
  onAddToCart,
  addingProductId,
}: FeaturedProductsSectionProps) => {
  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
          {title}
        </Typography>
        {isLoading ? (
          <PageLoader message="Loading products…" fullViewport={false} />
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
                onAddToCart={() => onAddToCart(product._id)}
                addToCartLoading={addingProductId === product._id}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};
