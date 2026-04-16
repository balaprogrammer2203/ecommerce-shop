import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';

import { useAppDispatch } from '../../../app/hooks';
import { getEnvConfig } from '../../../config';
import { ProductCard } from '../../../shared/ui/ProductCard';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { addItem } from '../../cart/slices/cartSlice';
import { useListProductsQuery } from '../api/catalogApi';

const PAGE_SIZE = 10;
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export const CategoryPage = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const { apiBaseUrl } = getEnvConfig();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { data, isLoading, isError } = useListProductsQuery(
    slug
      ? { page, limit: PAGE_SIZE, sort: sortBy, categorySlug: slug }
      : { page, limit: PAGE_SIZE, sort: sortBy },
  );

  const [addToCart] = useAddItemToCartMutation();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const products = useMemo(() => data?.products ?? [], [data?.products]);

  const [categoryTitle, setCategoryTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setPage(1);
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
        if (!isAuthenticated) {
          const product = products.find((item) => item._id === productId);
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
          return;
        }

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
    [addToCart, dispatch, isAuthenticated, products],
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
        {data?.total ?? 0} product{(data?.total ?? 0) === 1 ? '' : 's'} in this category
      </p>

      {!isLoading && !isError && products.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm text-slate-600">
            Page {data?.page ?? 1} of {data?.pages ?? 1}
          </span>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            Sort by
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-primary focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </label>
        </div>
      ) : null}

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
        <>
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
          {(data?.pages ?? 1) > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={(data?.page ?? 1) <= 1}
                onClick={() => {
                  setPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Previous
              </button>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                {data?.page ?? 1} / {data?.pages ?? 1}
              </span>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={(data?.page ?? 1) >= (data?.pages ?? 1)}
                onClick={() => {
                  setPage((prev) => Math.min(data?.pages ?? 1, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
