import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Container, IconButton, Stack, Typography } from '@mui/material';
import { useRef } from 'react';

import type { Product } from '../../../features/catalog/types';
import { ProductCard } from '../ProductCard';

type TrendingCarouselProps = {
  title?: string;
  products: Product[];
  onAddToCart: (productId: string) => void;
  addingProductId?: string | null;
};

export const TrendingCarousel = ({
  title = 'Trending now',
  products,
  onAddToCart,
  addingProductId,
}: TrendingCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        bgcolor: 'background.default',
        borderBlock: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              aria-label="Scroll trending left"
              onClick={() => scrollBy(-320)}
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Scroll trending right"
              onClick={() => scrollBy(320)}
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={scrollerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 1,
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'action.disabled',
              borderRadius: 3,
            },
          }}
        >
          {products.map((product) => (
            <Box
              key={product._id}
              sx={{
                flex: '0 0 auto',
                width: { xs: 'min(280px, 85vw)', sm: 260 },
                scrollSnapAlign: 'start',
              }}
            >
              <ProductCard
                product={product}
                variant="compact"
                onAddToCart={() => onAddToCart(product._id)}
                addToCartLoading={addingProductId === product._id}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
