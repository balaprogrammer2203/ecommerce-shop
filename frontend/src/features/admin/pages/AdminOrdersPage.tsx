import {
  Alert,
  Box,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  useAdminOrderByIdQuery,
  useAdminOrdersQuery,
  useMarkOrderDeliveredMutation,
  useMarkOrderPaidMutation,
} from '../api/adminApi';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' } | null;

export const AdminOrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useAdminOrdersQuery();
  type PaymentMethod = 'stripe' | 'paypal' | 'razorpay' | 'cod';
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'all' | PaymentMethod>('all');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [deliveredFilter, setDeliveredFilter] = useState<'all' | 'delivered' | 'undelivered'>(
    'all',
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [toast, setToast] = useState<ToastState>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const drawerOpen = Boolean(selectedOrderId);

  const {
    data: selectedOrder,
    isLoading: loadingSelectedOrder,
    isError: selectedOrderError,
  } = useAdminOrderByIdQuery(selectedOrderId ?? '', { skip: !selectedOrderId });

  const [markPaid] = useMarkOrderPaidMutation();
  const [markDelivered] = useMarkOrderDeliveredMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'paid' | 'delivered'>('paid');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const idMatch = o._id.toLowerCase().includes(q);
      const customerMatch = (o.user?.name || o.user?.email || '').toLowerCase().includes(q);
      const matchesSearch = !q || idMatch || customerMatch;

      const matchesPayment = paymentMethod === 'all' ? true : o.paymentMethod === paymentMethod;
      const matchesPaid =
        paidFilter === 'all' ? true : paidFilter === 'paid' ? o.isPaid : !o.isPaid;
      const matchesDelivered =
        deliveredFilter === 'all'
          ? true
          : deliveredFilter === 'delivered'
            ? o.isDelivered
            : !o.isDelivered;

      return matchesSearch && matchesPayment && matchesPaid && matchesDelivered;
    });
  }, [orders, search, paymentMethod, paidFilter, deliveredFilter]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const selected = selectedOrder ?? orders.find((o) => o._id === selectedOrderId);

  const openConfirm = (mode: 'paid' | 'delivered') => {
    setConfirmMode(mode);
    setConfirmOpen(true);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        Orders
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <TextField
            size="small"
            label="Search order / customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Payment</InputLabel>
            <Select
              label="Payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'all' | PaymentMethod)}
            >
              <MenuItem value="all">all</MenuItem>
              <MenuItem value="stripe">stripe</MenuItem>
              <MenuItem value="paypal">paypal</MenuItem>
              <MenuItem value="razorpay">razorpay</MenuItem>
              <MenuItem value="cod">cod</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Paid</InputLabel>
            <Select
              label="Paid"
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
            >
              <MenuItem value="all">all</MenuItem>
              <MenuItem value="paid">paid</MenuItem>
              <MenuItem value="unpaid">unpaid</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Delivered</InputLabel>
            <Select
              label="Delivered"
              value={deliveredFilter}
              onChange={(e) =>
                setDeliveredFilter(e.target.value as 'all' | 'delivered' | 'undelivered')
              }
            >
              <MenuItem value="all">all</MenuItem>
              <MenuItem value="delivered">delivered</MenuItem>
              <MenuItem value="undelivered">undelivered</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load orders.</Typography>
        </Paper>
      ) : null}

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Paid</TableCell>
              <TableCell align="center">Delivered</TableCell>
              <TableCell align="right">Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isLoading ? [] : paged).map((order) => (
              <TableRow
                key={order._id}
                hover
                onClick={() => setSelectedOrderId(order._id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>#{order._id.slice(-6)}</TableCell>
                <TableCell>{order.user?.name || order.user?.email || '-'}</TableCell>
                <TableCell align="right">${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell align="center">{order.isPaid ? 'Yes' : 'No'}</TableCell>
                <TableCell align="center">{order.isDelivered ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">{order.paymentMethod ?? '-'}</TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No orders found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_e, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setSelectedOrderId(null)}
        PaperProps={{ sx: { width: 520 } }}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Order details
          </Typography>

          {!selectedOrderId ? null : loadingSelectedOrder ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : selectedOrderError ? (
            <Typography color="error.main">Failed to load order.</Typography>
          ) : selected ? (
            <>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Order: <b>#{selected._id.slice(-10)}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: {selected.user?.name || selected.user?.email || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Payment: {selected.paymentMethod ?? '-'} | Paid: {selected.isPaid ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Delivered: {selected.isDelivered ? 'Yes' : 'No'}
                </Typography>
              </Stack>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Shipping
                </Typography>
                <Typography variant="body2">{selected.shippingAddress?.address ?? '-'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.shippingAddress?.city ?? '-'},{' '}
                  {selected.shippingAddress?.postalCode ?? '-'} |{' '}
                  {selected.shippingAddress?.country ?? '-'}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Items
                </Typography>
                <Stack spacing={1}>
                  {(selected.orderItems ?? []).map((it, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      {it.image ? (
                        <Box
                          component="img"
                          src={it.image}
                          alt={it.name}
                          sx={{ width: 44, height: 34, borderRadius: 1, objectFit: 'cover' }}
                        />
                      ) : null}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {it.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Qty {it.qty} • ${it.price.toFixed(2)} each
                        </Typography>
                      </Box>
                      <Typography variant="body2">${(it.qty * it.price).toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Totals
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Items: ${selected.itemsPrice?.toFixed(2) ?? '0.00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tax: ${selected.taxPrice?.toFixed(2) ?? '0.00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shipping: ${selected.shippingPrice?.toFixed(2) ?? '0.00'}
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    ${selected.totalPrice.toFixed(2)}
                  </Typography>
                </Stack>
              </Paper>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {!selected.isPaid ? (
                  <Button variant="contained" color="primary" onClick={() => openConfirm('paid')}>
                    Mark paid
                  </Button>
                ) : null}
                {selected.isPaid && !selected.isDelivered ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => openConfirm('delivered')}
                  >
                    Mark delivered
                  </Button>
                ) : null}
                <Button onClick={() => setSelectedOrderId(null)}>Close</Button>
              </Stack>
            </>
          ) : null}
        </Stack>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmMode === 'paid' ? 'Mark order as paid?' : 'Mark order as delivered?'}
        confirmLabel={confirmMode === 'paid' ? 'Mark paid' : 'Mark delivered'}
        confirmColor="primary"
        loading={false}
        description="Admin will update the order status in the system."
        onConfirm={() => {
          if (!selectedOrderId) return;
          const action =
            confirmMode === 'paid' ? markPaid(selectedOrderId) : markDelivered(selectedOrderId);
          void action
            .unwrap()
            .then(() => {
              setToast({
                message:
                  confirmMode === 'paid' ? 'Order marked as paid' : 'Order marked as delivered',
                severity: 'success',
              });
              setConfirmOpen(false);
            })
            .catch((e) => {
              setToast({
                message: e instanceof Error ? e.message : 'Failed to update order',
                severity: 'error',
              });
            });
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  );
};
