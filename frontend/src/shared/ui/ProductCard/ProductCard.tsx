import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Link,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import type { Product } from '../../../features/catalog/types';
import { useProductWishlist } from '../../../features/wishlist/hooks/useProductWishlist';
import { Badge } from '../system/Badge';
import { Button } from '../system/Button';

function getDiscountLabel(product: Product): string | null {
  const { price, originalPrice } = product;
  if (originalPrice != null && originalPrice > price) {
    const pct = Math.round((1 - price / originalPrice) * 100);
    return pct > 0 ? `${pct}% OFF` : null;
  }
  return null;
}

type ProductCardProps = {
  product: Product;
  /** Compact layout for carousels */
  variant?: 'default' | 'compact';
  onAddToCart?: () => void;
  addToCartLoading?: boolean;
  /** Hide wishlist control (e.g. admin previews) */
  hideWishlist?: boolean;
};

export const ProductCard = ({
  product,
  variant = 'default',
  onAddToCart,
  addToCartLoading,
  hideWishlist = false,
}: ProductCardProps) => {
  const isCompact = variant === 'compact';
  const imageHeight = isCompact ? 160 : 220;

  const {
    isWishlisted,
    toggle: toggleWishlist,
    isLoading: wishlistBusy,
  } = useProductWishlist(product._id);

  const displayName = product.title ?? product.name;

  const discountLabel = getDiscountLabel(product);
  const showStrikePrice = product.originalPrice != null && product.originalPrice > product.price;
  const rating = product.averageRating ?? 0;
  const reviewCount = product.numReviews ?? 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void (async () => {
      try {
        await toggleWishlist();
      } catch {
        // Toast can be added later
      }
    })();
  };

  const productHref = `/product/${product._id}`;
  const placeholder = product.image || 'https://placehold.co/400x300/CCCCCC/666666?text=Product';

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (t) => t.shadows[8],
          borderColor: 'primary.light',
          '& .product-card__media img': {
            transform: 'scale(1.06)',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'grey.100' }}>
        {discountLabel ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <Badge tone="sale" label={discountLabel} size="small" sx={{ fontWeight: 800 }} />
          </Box>
        ) : null}

        {!hideWishlist ? (
          <IconButton
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
            onClick={handleWishlistClick}
            disabled={wishlistBusy}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.06)' },
              transition: 'transform 0.2s ease, background-color 0.2s ease',
            }}
          >
            {isWishlisted ? (
              <FavoriteIcon fontSize={isCompact ? 'small' : 'medium'} color="error" />
            ) : (
              <FavoriteBorderIcon fontSize={isCompact ? 'small' : 'medium'} color="action" />
            )}
          </IconButton>
        ) : null}

        <Box
          component={RouterLink}
          to={productHref}
          className="product-card__media"
          aria-label={`View ${displayName}`}
          sx={{
            display: 'block',
            height: imageHeight,
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Box
            component="img"
            src={placeholder}
            alt={displayName}
            loading="lazy"
            referrerPolicy="no-referrer"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.4s ease',
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Link
          component={RouterLink}
          to={productHref}
          underline="hover"
          color="inherit"
          variant={isCompact ? 'subtitle1' : 'h6'}
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: isCompact ? 40 : 48,
          }}
        >
          {displayName}
        </Link>

        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
          <Rating
            name={`rating-${product._id}`}
            value={rating}
            precision={0.5}
            readOnly
            size={isCompact ? 'small' : 'medium'}
            sx={{ color: 'warning.main' }}
          />
          <Typography variant="caption" color="text.secondary" component="span">
            ({reviewCount})
          </Typography>
        </Stack>

        {!isCompact ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 40,
            }}
          >
            {product.description}
          </Typography>
        ) : null}

        <Stack
          direction="row"
          alignItems="baseline"
          spacing={1}
          flexWrap="wrap"
          sx={{ mt: 'auto' }}
        >
          <Typography variant="h6" fontWeight={800} color="primary.main" component="span">
            ${product.price.toFixed(2)}
          </Typography>
          {showStrikePrice && product.originalPrice != null ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
              component="span"
            >
              ${product.originalPrice.toFixed(2)}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
        {onAddToCart ? (
          <Button
            shopVariant="primary"
            size={isCompact ? 'small' : 'medium'}
            fullWidth
            loading={addToCartLoading}
            onClick={() => {
              void onAddToCart();
            }}
          >
            Add to cart
          </Button>
        ) : (
          <Button to={productHref} shopVariant="primary" size="medium" fullWidth>
            View product
          </Button>
        )}
        {onAddToCart ? (
          <Button to={productHref} shopVariant="ghost" size="small" fullWidth>
            View details
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
};
