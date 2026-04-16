import { useCallback, useMemo, useState } from 'react';

import { useAppDispatch } from '../../../app/hooks';
import {
  CategoryGrid,
  FeaturedProductsSection,
  HeroBanner,
  NewsletterSection,
  OfferBanners,
  TestimonialsSection,
  TrendingCarousel,
} from '../../../shared/ui/home';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { addItem } from '../../cart/slices/cartSlice';
import { useHomeProductsQuery } from '../api/catalogApi';

export const HomePage = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { data: homeData, isLoading: homeLoading } = useHomeProductsQuery({
    featuredLimit: 8,
    trendingLimit: 10,
  });
  const [addToCart] = useAddItemToCartMutation();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');

  const featured = useMemo(() => homeData?.featured ?? [], [homeData?.featured]);
  const trending = useMemo(() => homeData?.trending ?? [], [homeData?.trending]);

  const handleAddToCart = useCallback(
    (productId: string) => {
      void (async () => {
        if (!isAuthenticated) {
          const product = [...featured, ...trending].find((item) => item._id === productId);
          if (!product) return;
          dispatch(
            addItem({
              id: product._id,
              name: product.title ?? product.name,
              price: product.price,
              quantity: 1,
              image: product.images?.[0] || product.image || '',
            }),
          );
          setStatusTone('success');
          setStatusMessage('Added to cart');
          window.setTimeout(() => {
            setStatusMessage(null);
          }, 1800);
          return;
        }

        setAddingProductId(productId);
        try {
          await addToCart({ productId, qty: 1 }).unwrap();
          setStatusTone('success');
          setStatusMessage('Added to cart');
        } catch {
          setStatusTone('error');
          setStatusMessage('Could not add to cart. Please try again.');
        } finally {
          setAddingProductId(null);
          window.setTimeout(() => {
            setStatusMessage(null);
          }, 1800);
        }
      })();
    },
    [addToCart, dispatch, featured, isAuthenticated, trending],
  );

  return (
    <>
      {statusMessage ? (
        <div
          className={
            statusTone === 'success'
              ? 'mx-auto mt-3 max-w-screen-lg rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800'
              : 'mx-auto mt-3 max-w-screen-lg rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800'
          }
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      ) : null}
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProductsSection
        products={featured}
        isLoading={homeLoading}
        onAddToCart={handleAddToCart}
        addingProductId={addingProductId}
      />
      <OfferBanners />
      <TrendingCarousel
        products={trending}
        onAddToCart={handleAddToCart}
        addingProductId={addingProductId}
        isLoading={homeLoading}
      />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
};
