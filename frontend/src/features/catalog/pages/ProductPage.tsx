import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch } from '../../../app/hooks';
import { cn } from '../../../shared/lib/cn';
import { IconFavoriteBorder, IconFavoriteFilled } from '../../../shared/ui/icons/storefront';
import { Button } from '../../../shared/ui/system/Button';
import { Input } from '../../../shared/ui/system/Input';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { addItem } from '../../cart/slices/cartSlice';
import { useProductReviewsQuery, useSubmitReviewMutation } from '../../reviews/api/reviewsApi';
import { useProductWishlist } from '../../wishlist/hooks/useProductWishlist';
import { useProductDetailQuery } from '../api/catalogApi';

type TabId = 'overview' | 'specifications' | 'shipping' | 'reviews';

const RatingStars = ({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) => {
  const rounded = Math.round(value);
  const cls = size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div
      className={cn('flex gap-0.5 text-amber-500', cls)}
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
};

export const ProductPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { productId } = useParams();
  const {
    data: product,
    isLoading,
    isError,
  } = useProductDetailQuery(productId ?? '', { skip: !productId });
  const [addToCart, { isLoading: isAdding }] = useAddItemToCartMutation();
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
  } = useProductReviewsQuery(
    { productId: productId ?? '', page: 1, limit: 12 },
    { skip: !productId },
  );

  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();

  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const {
    isWishlisted,
    toggle: toggleWishlist,
    isLoading: wishlistBusy,
  } = useProductWishlist(productId ?? '');

  useEffect(() => {
    if (!product) return;
    setSelectedImage(0);
    setSelectedColor(product.colors?.[0]?.name ?? null);
    setSelectedSize(product.sizes?.[0] ?? null);
    // Reset gallery/variants when opening a different product (id change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = product.images?.length ? product.images : product.image ? [product.image] : [];
    return list.filter(Boolean);
  }, [product]);

  const displayTitle = product?.title ?? product?.name ?? '';
  const primaryCategory = product?.categories?.[0];
  const avg = product?.averageRating ?? 0;
  const reviewCount = product?.numReviews ?? 0;

  const variantSuffix = useMemo(() => {
    const parts: string[] = [];
    if (selectedColor) parts.push(selectedColor);
    if (selectedSize) parts.push(selectedSize);
    return parts.length ? ` (${parts.join(' · ')})` : '';
  }, [selectedColor, selectedSize]);

  const handleAddToCart = () => {
    if (!productId || !product) return;
    const lineName = `${displayTitle}${variantSuffix}`;
    if (!isAuthenticated) {
      dispatch(
        addItem({
          id: product._id,
          name: lineName,
          price: product.price,
          quantity: 1,
          image: product.images?.[0] || product.image || '',
        }),
      );
      return;
    }
    void addToCart({ productId, qty: 1 })
      .unwrap()
      .catch(() => {});
  };

  const pageCx = 'mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10';

  if (!productId) {
    return (
      <div className={pageCx}>
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
        >
          Missing product id.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={pageCx}>
        <div className="flex justify-center py-20">
          <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={pageCx}>
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
        >
          Failed to load product.
        </div>
      </div>
    );
  }

  const mainImage =
    gallery[selectedImage] ??
    gallery[0] ??
    'https://placehold.co/800x800/e2e8f0/64748b?text=Product';

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & returns' },
    { id: 'reviews', label: `Reviews (${reviewCount})` },
  ];

  return (
    <div className={pageCx}>
      <nav className="mb-6 text-xs text-slate-600 sm:text-sm" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <RouterLink to="/" className="text-primary no-underline hover:underline">
              Home
            </RouterLink>
          </li>
          <li className="text-slate-400" aria-hidden>
            /
          </li>
          {primaryCategory ? (
            <>
              <li>
                <RouterLink
                  to={`/category/${primaryCategory.slug}`}
                  className="text-primary no-underline hover:underline"
                >
                  {primaryCategory.name}
                </RouterLink>
              </li>
              <li className="text-slate-400" aria-hidden>
                /
              </li>
            </>
          ) : null}
          <li
            className="max-w-[min(52vw,28rem)] truncate font-medium text-slate-900"
            aria-current="page"
          >
            {displayTitle}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <div className="aspect-square w-full">
              <img
                src={mainImage}
                alt={displayTitle}
                className="h-full w-full object-contain object-center p-4 sm:p-6"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          {gallery.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {gallery.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'relative size-16 overflow-hidden rounded-xl border-2 bg-white p-0.5 transition sm:size-20',
                    selectedImage === idx
                      ? 'border-primary ring-2 ring-primary/25'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Buy column */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          {product.brand ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.brand}
            </p>
          ) : null}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            {displayTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <RatingStars value={avg} />
            <span className="text-sm font-semibold text-slate-800">{avg.toFixed(1)}</span>
            <span className="text-sm text-slate-500">
              {reviewCount} review{reviewCount === 1 ? '' : 's'}
            </span>
            {product.sku ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                SKU: {product.sku}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-baseline gap-3 border-y border-slate-200 py-4">
            <span className="text-3xl font-black text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice != null && product.originalPrice > product.price ? (
              <span className="text-lg text-slate-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">
              {product.countInStock > 0 ? 'In stock' : 'Out of stock'}
            </span>
            {product.countInStock > 0 ? (
              <span className="text-slate-500"> — {product.countInStock} units available</span>
            ) : null}
          </p>

          {product.colors?.length ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const active = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition',
                        active
                          ? 'border-primary bg-primary/5 text-slate-900 ring-2 ring-primary/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                      )}
                    >
                      {c.hex ? (
                        <span
                          className="size-4 rounded-full border border-slate-200 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden
                        />
                      ) : null}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.sizes?.length ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                Size / option
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const active = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        'min-w-[2.75rem] rounded-lg border px-3 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {product.highlights?.length ? (
            <ul className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-0.5 text-primary" aria-hidden>
                    ✓
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {product.warranty ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Warranty: </span>
              {product.warranty}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              shopVariant="primary"
              size="large"
              disabled={isAdding}
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
            <Button
              shopVariant="secondary"
              size="large"
              onClick={() => {
                handleAddToCart();
                navigate(isAuthenticated ? '/checkout' : '/login');
              }}
            >
              Buy now
            </Button>
            <button
              type="button"
              onClick={() => {
                void toggleWishlist();
              }}
              disabled={wishlistBusy || !productId}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition',
                isWishlisted
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
              )}
              aria-pressed={isWishlisted}
            >
              {isWishlisted ? <IconFavoriteFilled size={22} /> : <IconFavoriteBorder size={22} />}
              {isWishlisted ? 'Saved' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <div
          role="tablist"
          aria-label="Product information"
          className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition sm:px-4',
                activeTab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="max-w-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Description</h2>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>
        ) : null}

        {activeTab === 'specifications' ? (
          <div className="max-w-3xl">
            {product.specifications?.length ? (
              <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {product.specifications.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4"
                  >
                    <dt className="text-sm font-semibold text-slate-800">{row.label}</dt>
                    <dd className="text-sm text-slate-600">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-slate-600">No specifications listed for this item.</p>
            )}
            {product.attributes && Object.keys(product.attributes).length > 0 ? (
              <div className="mt-8">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                  Attributes
                </h3>
                <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
                      <dt className="text-sm font-semibold capitalize text-slate-800">{k}</dt>
                      <dd className="text-sm text-slate-600">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'shipping' ? (
          <div className="max-w-3xl space-y-4 text-slate-600">
            <p className="text-base leading-relaxed">
              {product.shippingReturns ??
                'Standard delivery timelines apply based on your region. Track packages from your account orders page once shipped.'}
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>Order cut-off times may vary during peak seasons.</li>
              <li>Returns must include original packaging when required by the manufacturer.</li>
              <li>Refunds are issued to the original payment method after inspection.</li>
            </ul>
          </div>
        ) : null}

        {activeTab === 'reviews' ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Customer rating
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="text-4xl font-black text-slate-900">{avg.toFixed(1)}</span>
                  <RatingStars value={avg} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Based on {reviewCount} verified review{reviewCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {isReviewsLoading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : isReviewsError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
              >
                Failed to load reviews.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviewsData?.reviews?.length ? (
                  reviewsData.reviews.map((r) => (
                    <article
                      key={r._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{r.user?.name ?? 'Customer'}</p>
                          <p className="text-xs text-slate-500">
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : null}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <RatingStars value={r.rating} size="sm" />
                          <span className="text-sm font-semibold text-slate-700">{r.rating}/5</span>
                        </div>
                      </div>
                      {r.title ? (
                        <p className="mt-2 font-semibold text-slate-800">{r.title}</p>
                      ) : null}
                      {r.comment ? (
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900">
                    No reviews yet. Be the first to share your experience.
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                    <p className="mb-3 font-bold text-slate-900">Write a review</p>
                    <form
                      className="flex flex-col gap-3"
                      onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        if (!productId) return;
                        void (async () => {
                          try {
                            await submitReview({
                              productId,
                              payload: {
                                rating,
                                title: title || undefined,
                                comment: comment || undefined,
                              },
                            }).unwrap();
                            setTitle('');
                            setComment('');
                          } catch {
                            // silent
                          }
                        })();
                      }}
                    >
                      <Input
                        label="Rating (1–5)"
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        value={String(rating)}
                        onChange={(e) => setRating(Number(e.target.value))}
                      />
                      <Input
                        label="Title (optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <Input
                        label="Comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        multiline
                        minRows={3}
                      />
                      <Button shopVariant="primary" type="submit" disabled={isSubmitting}>
                        Submit review
                      </Button>
                    </form>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">
                    <RouterLink
                      to="/login"
                      className="font-semibold text-primary no-underline hover:underline"
                    >
                      Sign in
                    </RouterLink>{' '}
                    to write a review.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
