import { useCallback, useMemo, useState } from 'react';

import {
  CategoryGrid,
  FeaturedProductsSection,
  HeroBanner,
  NewsletterSection,
  OfferBanners,
  TestimonialsSection,
  TrendingCarousel,
} from '../../../shared/ui/home';
import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { useListProductsQuery } from '../api/catalogApi';

export const HomePage = () => {
  const { data, isLoading } = useListProductsQuery({ limit: 16 });
  const [addToCart] = useAddItemToCartMutation();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const products = useMemo(() => data?.products ?? [], [data]);

  const featured = useMemo(() => products.slice(0, 8), [products]);
  const trending = useMemo(
    () => [...products].slice(0, Math.min(10, products.length)).reverse(),
    [products],
  );

  const handleAddToCart = useCallback(
    (productId: string) => {
      void (async () => {
        setAddingProductId(productId);
        try {
          await addToCart({ productId, qty: 1 }).unwrap();
        } catch {
          // Snackbar can be added later
        } finally {
          setAddingProductId(null);
        }
      })();
    },
    [addToCart],
  );

  return (
    <>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProductsSection
        products={featured}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        addingProductId={addingProductId}
      />
      <OfferBanners />
      <TrendingCarousel
        products={trending}
        onAddToCart={handleAddToCart}
        addingProductId={addingProductId}
      />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
};
