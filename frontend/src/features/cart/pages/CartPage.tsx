import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

import {
  useClearCartMutation,
  useMyCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemQtyMutation,
} from '../api/cartApi';

export const CartPage = () => {
  const { data, isLoading, isError, error } = useMyCartQuery();
  const [updateQty] = useUpdateCartItemQtyMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const totals = useMemo(() => {
    const itemsPrice = data?.itemsPrice ?? 0;
    const totalPrice = data?.totalPrice ?? itemsPrice;
    return { itemsPrice, totalPrice };
  }, [data]);

  const maybeStatus = (error as { status?: number } | undefined)?.status;
  const isAuthError = maybeStatus === 401;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          Shopping Cart
        </Typography>

        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <Alert severity="error">
            {isAuthError ? 'Please login to view your cart.' : 'Failed to load cart.'}
          </Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              {data?.items?.length ? (
                <Stack spacing={2}>
                  {data.items.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2 }}
                      elevation={0}
                    >
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        justifyContent="space-between"
                      >
                        <Stack spacing={0.5}>
                          <Typography fontWeight={650}>{item.name}</Typography>
                          <Typography color="text.secondary">
                            ${item.price.toFixed(2)} each
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                void removeItem({ productId: item.id });
                              } else {
                                void updateQty({ productId: item.id, qty: item.quantity - 1 });
                              }
                            }}
                          >
                            -
                          </Button>
                          <Typography sx={{ width: 36, textAlign: 'center' }} fontWeight={700}>
                            {item.quantity}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              void updateQty({ productId: item.id, qty: item.quantity + 1 })
                            }
                          >
                            +
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}

                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography fontWeight={700}>${totals.itemsPrice.toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Total</Typography>
                      <Typography fontWeight={700}>${totals.totalPrice.toFixed(2)}</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Typography color="text.secondary">Your cart is empty.</Typography>
              )}
            </Paper>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                disabled={!data?.items?.length || isClearing}
                onClick={() => {
                  void clearCart();
                }}
              >
                Clear cart
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ alignSelf: 'flex-end' }}
              >
                Proceed to checkout
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
};
