import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAddItemToCartMutation } from '../../cart/api/cartApi';
import { useProductDetailQuery } from '../api/catalogApi';
import {
  useProductReviewsQuery,
  useSubmitReviewMutation,
} from '../../reviews/api/reviewsApi';

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

  if (!productId) {
    return <Alert severity="error">Missing product id.</Alert>;
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError || !product) {
    return <Alert severity="error">Failed to load product.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        {product.name}
      </Typography>
      {(product.averageRating !== undefined || product.numReviews !== undefined) && (
        <Typography color="text.secondary">
          Rating: {(product.averageRating ?? 0).toFixed(1)} / 5 • Reviews: {product.numReviews ?? 0}
        </Typography>
      )}
      <Box>
        <Typography variant="h6">Description</Typography>
        <Typography color="text.secondary">{product.description}</Typography>
      </Box>
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
        <Button variant="contained" size="large" disabled={isAdding} onClick={handleAddToCart}>
          Add to cart
        </Button>
        <Button variant="outlined" size="large">
          Buy now
        </Button>
      </Stack>

      <Box>
        <Typography variant="h6" gutterBottom>
          Reviews
        </Typography>

        {isReviewsLoading ? (
          <Stack alignItems="center" justifyContent="center" minHeight={120}>
            <CircularProgress size={24} />
          </Stack>
        ) : isReviewsError ? (
          <Alert severity="error">Failed to load reviews.</Alert>
        ) : (
          <Stack spacing={2}>
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
              <Alert severity="info" variant="outlined">
                No reviews yet.
              </Alert>
            )}

            <Stack
              spacing={2}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography fontWeight={700}>Write a review</Typography>

              <TextField
                label="Rating (1-5)"
                type="number"
                inputProps={{ min: 1, max: 5, step: 1 }}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
              <TextField
                label="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />

              <Button
                variant="contained"
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
            </Stack>
          </Stack>
        )}
      </Box>
    </Stack>
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
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography fontWeight={700}>
        {authorName} • {rating} / 5
      </Typography>
      {title ? (
        <Typography sx={{ mt: 0.5 }} fontWeight={600}>
          {title}
        </Typography>
      ) : null}
      {comment ? (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {comment}
        </Typography>
      ) : null}
    </Box>
  );
};
