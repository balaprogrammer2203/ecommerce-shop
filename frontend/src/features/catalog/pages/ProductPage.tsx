import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../../../shared/ui/system/Button';
import { Input } from '../../../shared/ui/system/Input';
import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { useProductReviewsQuery, useSubmitReviewMutation } from '../../reviews/api/reviewsApi';
import { useProductDetailQuery } from '../api/catalogApi';

export const ProductPage = () => {
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
  } = useProductReviewsQuery({ productId: productId ?? '' }, { skip: !productId });

  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();

  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleAddToCart = () => {
    if (!productId) return;
    void addToCart({ productId, qty: 1 })
      .unwrap()
      .catch(() => {
        // Intentionally silent; UI feedback can be added later.
      });
  };

  const pageCx = 'mx-auto max-w-screen-lg px-4 py-6 sm:px-6 md:py-10';

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
        <div className="flex justify-center py-14">
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

  return (
    <div className={pageCx}>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-slate-900">{product.title ?? product.name}</h1>
        {(product.averageRating !== undefined || product.numReviews !== undefined) && (
          <p className="text-slate-600">
            Rating: {(product.averageRating ?? 0).toFixed(1)} / 5 • Reviews:{' '}
            {product.numReviews ?? 0}
          </p>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Description</h2>
          <p className="mt-1 text-slate-600">{product.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button shopVariant="primary" size="large" disabled={isAdding} onClick={handleAddToCart}>
            Add to cart
          </Button>
          <Button shopVariant="secondary" size="large">
            Buy now
          </Button>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Reviews</h2>

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
                  <PaperReview
                    key={r._id}
                    rating={r.rating}
                    title={r.title}
                    comment={r.comment}
                    authorName={r.user?.name ?? 'Customer'}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900">
                  No reviews yet.
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-3 font-bold text-slate-900">Write a review</p>

                <div className="flex flex-col gap-3">
                  <Input
                    label="Rating (1-5)"
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={String(rating)}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                  <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input
                    label="Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    multiline
                    minRows={3}
                  />

                  <Button
                    shopVariant="primary"
                    disabled={isSubmitting}
                    onClick={() => {
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
                          // UI keeps it minimal; error can be shown later.
                        }
                      })();
                    }}
                  >
                    Submit review
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PaperReview = ({
  rating,
  title,
  comment,
  authorName,
}: {
  rating: number;
  title?: string;
  comment?: string;
  authorName: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="font-bold text-slate-900">
        {authorName} • {rating} / 5
      </p>
      {title ? <p className="mt-1 font-semibold text-slate-800">{title}</p> : null}
      {comment ? <p className="mt-1 text-slate-600">{comment}</p> : null}
    </div>
  );
};
