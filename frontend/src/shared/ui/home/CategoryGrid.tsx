import { Box, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { SHOP_CATEGORIES, type ShopCategoryDefinition } from '../../lib/shopCategories';

export type CategoryTile = Pick<ShopCategoryDefinition, 'slug' | 'title' | 'image'>;

type CategoryGridProps = {
  title?: string;
  /** Defaults to the full storefront category set (8 tiles). */
  items?: CategoryTile[];
};

export const CategoryGrid = ({
  title = 'Shop by category',
  items = SHOP_CATEGORIES.map(({ slug, title: t, image }) => ({ slug, title: t, image })),
}: CategoryGridProps) => {
  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          {items.map(({ slug, title: label, image }) => (
            <Box
              key={slug}
              component={RouterLink}
              to={`/category/${slug}`}
              aria-label={`Browse ${label}`}
              sx={{
                position: 'relative',
                display: 'block',
                borderRadius: 2,
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'common.white',
                aspectRatio: '1 / 1',
                maxHeight: { xs: 200, sm: 220, md: 240 },
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: 6,
                  borderColor: 'primary.light',
                  '& .category-grid__media': {
                    transform: 'scale(1.08)',
                  },
                  '& .category-grid__overlay': {
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)',
                  },
                },
                '&:focus-visible': {
                  outline: (t) => `3px solid ${t.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Box
                className="category-grid__media"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.45s ease',
                }}
              />
              <Box
                className="category-grid__overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)',
                  transition: 'background 0.3s ease',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  sx={{
                    textShadow: '0 2px 12px rgba(0,0,0,0.45)',
                    lineHeight: 1.25,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
