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
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-6 md:py-10">
      <nav className="mb-4 text-sm" aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-slate-600">
          <li>
            <RouterLink to="/" className="text-primary no-underline hover:underline">
              Home
            </RouterLink>
          </li>
          <li aria-hidden className="text-slate-400">
            /
          </li>
          <li className="font-semibold text-slate-900" aria-current="page">
            {categoryTitle ?? ''}
          </li>
        </ol>
      </nav>

      <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
        {categoryTitle ?? ''}
      </h1>

      <p className="mb-6 text-sm text-slate-600">
        {products.length} product{products.length === 1 ? '' : 's'} in this category
      </p>

      {isLoading || !categoryTitle ? (
        <div className="flex justify-center py-14">
          <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load products. Try again later.</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
          <p className="text-slate-600">
            No products in this category yet.{' '}
            <RouterLink to="/" className="font-medium text-primary no-underline hover:underline">
              Continue shopping
            </RouterLink>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() => handleAddToCart(product._id)}
              addToCartLoading={addingProductId === product._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
