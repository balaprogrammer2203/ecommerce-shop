import { Alert, CircularProgress, Paper, Stack, Typography } from '@mui/material';

import { useMyOrdersQuery } from '../api/ordersApi';

export const OrdersPage = () => {
  const { data, isLoading, isError } = useMyOrdersQuery();

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={600}>
        Recent orders
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : isError ? (
        <Alert severity="error">Failed to load orders.</Alert>
      ) : (
        <Stack spacing={2}>
          {data && data.length > 0 ? (
            data.map((order) => (
              <Paper key={order._id} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={0.5}>
                  <Typography fontWeight={600}>Order #{order._id.slice(-6)}</Typography>
                  <Typography color="text.secondary">
                    Total: ${order.totalPrice.toFixed(2)} • Paid: {order.isPaid ? 'Yes' : 'No'} • Delivered:{' '}
                    {order.isDelivered ? 'Yes' : 'No'}
                  </Typography>
                  <Typography color="text.secondary">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            ))
          ) : (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography color="text.secondary">No orders yet.</Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Stack>
  );
};
