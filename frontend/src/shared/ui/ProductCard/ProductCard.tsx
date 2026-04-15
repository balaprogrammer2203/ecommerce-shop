import { Link as RouterLink } from 'react-router-dom';

import type { Product } from '../../../features/catalog/types';
import { useProductWishlist } from '../../../features/wishlist/hooks/useProductWishlist';
import { cn } from '../../lib/cn';
import { IconFavoriteBorder, IconFavoriteFilled } from '../icons/storefront';
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

function StarRating({ value, compact }: { value: number; compact?: boolean }) {
  const rounded = Math.round(value);
  return (
    <div
      className={cn('flex gap-0.5 text-amber-500', compact ? 'text-sm' : 'text-base')}
      role="img"
      aria-label={`Rating ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? 'text-amber-500' : 'text-slate-200'}>
          ★
        </span>
      ))}
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  variant?: 'default' | 'compact';
  onAddToCart?: () => void;
  addToCartLoading?: boolean;
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
    <div
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white',
        'transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl',
      )}
    >
      <div className="relative overflow-hidden bg-slate-100">
        {discountLabel ? (
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-[2]">
            <Badge tone="sale" label={discountLabel} />
          </div>
        ) : null}

        {!hideWishlist ? (
          <button
            type="button"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
            onClick={handleWishlistClick}
            disabled={wishlistBusy}
            className={cn(
              'absolute right-2 top-2 z-[2] rounded-full bg-white/95 p-1.5 shadow-md transition-transform hover:scale-105 hover:bg-white',
              isWishlisted && 'text-red-600',
            )}
          >
            {isWishlisted ? (
              <IconFavoriteFilled size={isCompact ? 20 : 22} />
            ) : (
              <IconFavoriteBorder size={isCompact ? 20 : 22} className="text-slate-600" />
            )}
          </button>
        ) : null}

        <RouterLink
          to={productHref}
          className="product-card__media block text-inherit no-underline"
          style={{ height: imageHeight }}
          aria-label={`View ${displayName}`}
        >
          <img
            src={placeholder}
            alt={displayName}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </RouterLink>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-2 pt-3">
        <RouterLink
          to={productHref}
          className={cn(
            'line-clamp-2 min-h-[40px] font-bold text-slate-900 no-underline transition-colors hover:text-primary md:min-h-[48px]',
            isCompact ? 'text-sm leading-snug' : 'text-base leading-snug md:text-lg',
          )}
        >
          {displayName}
        </RouterLink>

        <div className="flex flex-wrap items-center gap-1.5">
          <StarRating value={rating} compact={isCompact} />
          <span className="text-xs text-slate-500">({reviewCount})</span>
        </div>

        {!isCompact ? (
          <p className="line-clamp-2 min-h-[40px] text-sm text-slate-600">{product.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-extrabold text-primary">${product.price.toFixed(2)}</span>
          {showStrikePrice && product.originalPrice != null ? (
            <span className="text-sm text-slate-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-0">
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
      </div>
    </div>
  );
};
