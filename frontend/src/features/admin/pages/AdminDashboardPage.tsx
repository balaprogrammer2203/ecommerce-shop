import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

import { useAdminOrdersQuery, useAdminProductsQuery, useAdminUsersQuery } from '../api/adminApi';

export const AdminDashboardPage = () => {
  const { data: users = [], isLoading: loadingUsers, isError: usersError } = useAdminUsersQuery();
  const {
    data: productsRes,
    isLoading: loadingProducts,
    isError: productsError,
  } = useAdminProductsQuery({ limit: 1 });
  const {
    data: orders = [],
    isLoading: loadingOrders,
    isError: ordersError,
  } = useAdminOrdersQuery();
  const isLoading = loadingUsers || loadingProducts || loadingOrders;
  const isError = usersError || productsError || ordersError;
  const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const productsCount = productsRes?.total ?? 0;

  const revenueByDay = (() => {
    const map = new Map<string, number>();
    const now = new Date();
    const daysBack = 10;
    for (let i = daysBack - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    for (const order of orders) {
      const k = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : '';
      if (k && map.has(k)) map.set(k, (map.get(k) || 0) + (order.totalPrice || 0));
    }
    const keys = Array.from(map.keys());
    const values = keys.map((k) => map.get(k) || 0);
    return { keys, values };
  })();

  const maxDayRevenue = Math.max(...revenueByDay.values, 1);
  const cards = [
    { label: 'Users', value: users.length },
    { label: 'Products', value: productsCount },
    { label: 'Orders', value: orders.length },
    { label: 'Revenue', value: `$${revenue.toFixed(2)}` },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Business overview
      </Typography>
      {isError ? (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.15)' }}>
          <Typography color="error.light">Failed to load dashboard metrics.</Typography>
        </Paper>
      ) : null}
      <Grid container spacing={3}>
        {cards.map((tile) => (
          <Grid item xs={12} md={3} key={tile.label}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
              <Typography variant="body2" textTransform="uppercase" color="text.secondary">
                {tile.label}
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {isLoading ? '...' : tile.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Revenue trend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last {revenueByDay.values.length} days
          </Typography>
        </Stack>
        <Box sx={{ overflowX: 'auto' }}>
          <svg
            width="600"
            height="180"
            viewBox="0 0 600 180"
            role="img"
            aria-label="Revenue trend chart"
          >
            {revenueByDay.values.map((v, idx) => {
              const barW = 520 / revenueByDay.values.length;
              const x = 40 + idx * barW;
              const h = (v / maxDayRevenue) * 120;
              const y = 150 - h;
              return (
                <g key={revenueByDay.keys[idx]}>
                  <rect
                    x={x + 2}
                    y={y}
                    width={barW - 6}
                    height={h}
                    rx={6}
                    fill="rgba(59,130,246,0.8)"
                  />
                  <text
                    x={x + barW / 2}
                    y={168}
                    fontSize="11"
                    fill="rgba(148,163,184,0.9)"
                    textAnchor="middle"
                  >
                    {revenueByDay.keys[idx].slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Tip: click Orders to drill into individual payment statuses.
        </Typography>
      </Paper>
    </Stack>
  );
};
