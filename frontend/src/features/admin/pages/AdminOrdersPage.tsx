import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Menu,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Order } from '../../orders/types';
import {
  useAdminOrdersQuery,
  useDeleteAdminOrderMutation,
  useDeleteAdminOrdersBulkMutation,
} from '../api/adminApi';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' } | null;
type SortColumn = 'order' | 'customer' | 'product' | 'status' | 'date' | 'trend' | 'amount';
type SortDirection = 'asc' | 'desc';

/** Enterprise pipeline buckets: raw statuses map here; delivered is terminal success, not in-transit. */
type OrderStatusBucket =
  | 'payment'
  | 'fulfillment'
  | 'shipping'
  | 'completed'
  | 'exception'
  | 'returns';

type OrderStatusFilter = 'all' | OrderStatusBucket;

const BUCKET_TAB_ORDER: OrderStatusBucket[] = [
  'payment',
  'fulfillment',
  'shipping',
  'completed',
  'exception',
  'returns',
];

const columnOptions: Array<{ key: SortColumn; label: string }> = [
  { key: 'order', label: 'id' },
  { key: 'customer', label: 'customerName' },
  { key: 'product', label: 'productName' },
  { key: 'status', label: 'status' },
  { key: 'date', label: 'date' },
  { key: 'trend', label: 'Trend' },
  { key: 'amount', label: 'amount' },
];

type DeliveryStat = NonNullable<NonNullable<Order['delivery']>['currentStatus']>;

const normalizeDeliveryStatus = (s: DeliveryStat | undefined): string | undefined => {
  if (!s) return undefined;
  if (s === 'refunded') return 'refund_completed';
  if (s === 'return_initiated') return 'return_requested';
  if (s === 'delivery_failed') return 'delivery_attempt_failed';
  if (s === 'rescheduled') return 'delivery_rescheduled';
  if (s === 'pending') return 'payment_pending';
  return s;
};

const inferStatusFromFlags = (order: Pick<Order, 'isPaid' | 'isDelivered'>): string => {
  if (order.isDelivered) return 'delivered';
  if (order.isPaid) return 'payment_confirmed';
  return 'payment_pending';
};

const RETURNS_STATUSES = new Set<string>([
  'return_requested',
  'return_approved',
  'return_pickup_scheduled',
  'return_picked_up',
  'return_in_transit',
  'return_received',
  'return_rejected',
  'refund_initiated',
  'refund_completed',
]);

const EXCEPTION_STATUSES = new Set<string>([
  'cancelled',
  'delivery_attempt_failed',
  'delivery_rescheduled',
  'delivery_exception',
]);

const PAYMENT_STATUSES = new Set<string>(['order_placed', 'payment_pending', 'payment_failed']);

const FULFILLMENT_STATUSES = new Set<string>([
  'payment_confirmed',
  'processing',
  'packed',
  'ready_to_ship',
]);

const SHIPPING_STATUSES = new Set<string>(['shipped', 'in_transit', 'out_for_delivery']);

const COMPLETED_STATUSES = new Set<string>(['delivered']);

const getOrderStatusBucket = (
  order: Pick<Order, 'delivery' | 'isPaid' | 'isDelivered'>,
): OrderStatusBucket => {
  const raw = order.delivery?.currentStatus;
  const normalized = normalizeDeliveryStatus(raw) ?? inferStatusFromFlags(order);
  if (RETURNS_STATUSES.has(normalized)) return 'returns';
  if (EXCEPTION_STATUSES.has(normalized)) return 'exception';
  if (PAYMENT_STATUSES.has(normalized)) return 'payment';
  if (FULFILLMENT_STATUSES.has(normalized)) return 'fulfillment';
  if (COMPLETED_STATUSES.has(normalized)) return 'completed';
  if (SHIPPING_STATUSES.has(normalized)) return 'shipping';
  return 'fulfillment';
};

const orderStatusBucketLabel = (bucket: OrderStatusBucket): string => {
  const labels: Record<OrderStatusBucket, string> = {
    payment: 'Payment',
    fulfillment: 'Fulfillment',
    shipping: 'Shipping',
    completed: 'Completed',
    exception: 'Exception',
    returns: 'Returns',
  };
  return labels[bucket];
};

const bucketChipSx = (bucket: OrderStatusBucket) => {
  switch (bucket) {
    case 'payment':
      return {
        color: 'rgb(180,83,9)',
        bgcolor: 'rgba(245,158,11,0.14)',
        border: '1px solid rgba(245,158,11,0.3)',
      };
    case 'fulfillment':
      return {
        color: 'rgb(30,64,175)',
        bgcolor: 'rgba(59,130,246,0.12)',
        border: '1px solid rgba(59,130,246,0.25)',
      };
    case 'shipping':
      return {
        color: 'rgb(14,116,144)',
        bgcolor: 'rgba(6,182,212,0.12)',
        border: '1px solid rgba(6,182,212,0.28)',
      };
    case 'completed':
      return {
        color: 'rgb(5,150,105)',
        bgcolor: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.25)',
      };
    case 'exception':
      return {
        color: 'rgb(153,27,27)',
        bgcolor: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.28)',
      };
    case 'returns':
      return {
        color: 'rgb(107,33,168)',
        bgcolor: 'rgba(168,85,247,0.12)',
        border: '1px solid rgba(168,85,247,0.28)',
      };
  }
};

/** Lower = higher operational priority when sorting status ascending (exceptions surface first). */
const statusOperationalRank = (
  order: Pick<Order, 'delivery' | 'isPaid' | 'isDelivered'>,
): number => {
  const rank: Record<OrderStatusBucket, number> = {
    exception: 0,
    shipping: 1,
    fulfillment: 2,
    payment: 3,
    returns: 4,
    completed: 5,
  };
  return rank[getOrderStatusBucket(order)];
};

const effectiveNormalizedStatus = (
  order: Pick<Order, 'delivery' | 'isPaid' | 'isDelivered'>,
): string => normalizeDeliveryStatus(order.delivery?.currentStatus) ?? inferStatusFromFlags(order);

const RETURN_SUBLINE: Record<string, string> = {
  return_requested: 'Return requested',
  return_approved: 'Return approved',
  return_pickup_scheduled: 'Pickup scheduled',
  return_picked_up: 'Picked up',
  return_in_transit: 'Return in transit',
  return_received: 'Return received',
  return_rejected: 'Return rejected',
  refund_initiated: 'Refund started',
  refund_completed: 'Refund completed',
};

const getOrderStatusSubline = (
  order: Pick<Order, 'delivery' | 'isPaid' | 'isDelivered'>,
): { line: string; paymentFailed?: boolean } => {
  const n = effectiveNormalizedStatus(order);
  if (n in RETURN_SUBLINE) return { line: RETURN_SUBLINE[n] };
  switch (n) {
    case 'order_placed':
      return { line: 'Order placed' };
    case 'payment_pending':
      return { line: 'Awaiting payment' };
    case 'payment_failed':
      return { line: 'Needs attention', paymentFailed: true };
    case 'payment_confirmed':
      return { line: 'Payment confirmed' };
    case 'processing':
      return { line: 'Processing' };
    case 'packed':
      return { line: 'Packed' };
    case 'ready_to_ship':
      return { line: 'Ready to ship' };
    case 'shipped':
      return { line: 'Shipped' };
    case 'in_transit':
      return { line: 'In transit' };
    case 'out_for_delivery':
      return { line: 'Out for delivery' };
    case 'delivered':
      return { line: 'Delivered' };
    case 'cancelled':
      return { line: 'Cancelled' };
    case 'delivery_attempt_failed':
      return { line: 'Attempt failed' };
    case 'delivery_rescheduled':
      return { line: 'Rescheduled' };
    case 'delivery_exception':
      return { line: 'Delivery issue' };
    default:
      return { line: '' };
  }
};

const orderStatusExportLine = (order: Order): string => {
  const bucket = orderStatusBucketLabel(getOrderStatusBucket(order));
  const { line } = getOrderStatusSubline(order);
  return line ? `${bucket} — ${line}` : bucket;
};

const OrderPipelineChip = ({ order }: { order: Order }) => {
  const bucket = getOrderStatusBucket(order);
  const { line, paymentFailed } = getOrderStatusSubline(order);
  const base = bucketChipSx(bucket);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.125,
        px: 1,
        py: 0.375,
        borderRadius: 1,
        minWidth: 0,
        width: { xs: '100%', sm: 'auto' },
        maxWidth: { xs: '100%', sm: 220 },
        boxSizing: 'border-box',
        ...base,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
        <Typography component="span" variant="caption" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {orderStatusBucketLabel(bucket)}
        </Typography>
        {paymentFailed ? (
          <Chip
            label="Failed"
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              color: 'rgb(153,27,27)',
              bgcolor: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.45)',
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
        ) : null}
      </Stack>
      {line ? (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            opacity: 0.92,
            lineHeight: 1.25,
            fontSize: 10,
            color: 'inherit',
            alignSelf: 'stretch',
            wordBreak: 'break-word',
          }}
        >
          {line}
        </Typography>
      ) : null}
    </Box>
  );
};

const initialsFrom = (nameOrEmail?: string) => {
  const raw = (nameOrEmail || '').trim();
  if (!raw) return 'NA';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
};

export const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [sortBy, setSortBy] = useState<SortColumn>('status');
  const [sortOrder, setSortOrder] = useState<SortDirection>('asc');
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<SortColumn, boolean>>({
    order: true,
    customer: true,
    product: true,
    status: true,
    date: true,
    trend: true,
    amount: true,
  });
  const { data: orders = [], isLoading, isError } = useAdminOrdersQuery({ sortBy, sortOrder });
  type PaymentMethod = 'stripe' | 'paypal' | 'razorpay' | 'cod';
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'all' | PaymentMethod>('all');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [toast, setToast] = useState<ToastState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteOrder, { isLoading: deletingSingle }] = useDeleteAdminOrderMutation();
  const [deleteOrdersBulk, { isLoading: deletingBulk }] = useDeleteAdminOrdersBulkMutation();

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [rowMenuOrderId, setRowMenuOrderId] = useState<string | null>(null);
  const formatMoney = (value?: number) => `$${Number(value || 0).toFixed(2)}`;
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '-');
  const trendLabel = (order: { isDelivered: boolean; isPaid: boolean }) => {
    if (order.isDelivered) return { text: '+18%', tone: 'success.main' };
    if (order.isPaid) return { text: '+9%', tone: 'info.main' };
    return { text: '-2%', tone: 'warning.main' };
  };

  const sortedOrders = useMemo(() => {
    const list = [...orders];
    if (sortBy === 'status') {
      list.sort((a, b) => {
        const ra = statusOperationalRank(a);
        const rb = statusOperationalRank(b);
        const cmp = ra - rb;
        const dir = sortOrder === 'asc' ? 1 : -1;
        if (cmp !== 0) return cmp * dir;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return list;
  }, [orders, sortBy, sortOrder]);

  const bucketTabCounts = useMemo(() => {
    const counts: Record<OrderStatusFilter, number> = {
      all: 0,
      payment: 0,
      fulfillment: 0,
      shipping: 0,
      completed: 0,
      exception: 0,
      returns: 0,
    };
    const base = orders.filter((o) => {
      const matchesPayment = paymentMethod === 'all' ? true : o.paymentMethod === paymentMethod;
      const matchesPaid =
        paidFilter === 'all' ? true : paidFilter === 'paid' ? o.isPaid : !o.isPaid;
      return matchesPayment && matchesPaid;
    });
    counts.all = base.length;
    base.forEach((o) => {
      counts[getOrderStatusBucket(o)] += 1;
    });
    return counts;
  }, [orders, paymentMethod, paidFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedOrders.filter((o) => {
      const bucket = getOrderStatusBucket(o);
      const bucketLabel = orderStatusBucketLabel(bucket);
      const { line } = getOrderStatusSubline(o);
      const orderCode = `ord-${o._id.slice(-4).toUpperCase()}`;
      const firstProduct = o.orderItems?.[0]?.name || '';
      const trend = trendLabel(o).text;
      const date = formatDate(o.createdAt);
      const amount = formatMoney(o.totalPrice);
      const searchable = [
        o._id,
        orderCode,
        o.user?.name || '',
        o.user?.email || '',
        firstProduct,
        bucket,
        bucketLabel,
        line,
        date,
        trend,
        amount,
        o.paymentMethod || '',
        o.isPaid ? 'paid' : 'unpaid',
        o.isDelivered ? 'delivered' : 'undelivered',
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !q || searchable.includes(q);

      const matchesPayment = paymentMethod === 'all' ? true : o.paymentMethod === paymentMethod;
      const matchesPaid =
        paidFilter === 'all' ? true : paidFilter === 'paid' ? o.isPaid : !o.isPaid;
      const matchesStatus = statusFilter === 'all' ? true : bucket === statusFilter;

      return matchesSearch && matchesPayment && matchesPaid && matchesStatus;
    });
  }, [sortedOrders, search, paymentMethod, paidFilter, statusFilter]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortOrder('asc');
  };
  const toggleColumnVisibility = (column: SortColumn) => {
    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
    if (visibleColumns[column] && visibleCount <= 1) return;
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };
  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;
  const openRowMenu = (e: MouseEvent<HTMLButtonElement>, orderId: string) => {
    e.stopPropagation();
    setRowMenuAnchorEl(e.currentTarget);
    setRowMenuOrderId(orderId);
  };
  const closeRowMenu = () => {
    setRowMenuAnchorEl(null);
    setRowMenuOrderId(null);
  };
  const viewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
    closeRowMenu();
  };
  const editOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
    closeRowMenu();
  };
  const askDeleteOrder = (orderId: string) => {
    setSingleDeleteId(orderId);
    setSingleDeleteOpen(true);
    closeRowMenu();
  };
  const toggleRowSelection = (orderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };
  const isAllPagedSelected = paged.length > 0 && paged.every((o) => selectedIds.includes(o._id));
  const isSomePagedSelected = paged.some((o) => selectedIds.includes(o._id)) && !isAllPagedSelected;
  const toggleSelectAllPaged = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !paged.some((o) => o._id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const merged = new Set(prev);
      paged.forEach((o) => merged.add(o._id));
      return Array.from(merged);
    });
  };
  const exportRows = useMemo(() => {
    if (selectedIds.length > 0) return filtered.filter((o) => selectedIds.includes(o._id));
    return filtered;
  }, [filtered, selectedIds]);
  const exportToCsv = () => {
    if (exportRows.length === 0) {
      setToast({ message: 'No rows available to export', severity: 'error' });
      return;
    }

    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Product',
      'Status',
      'Payment Method',
      'Paid',
      'Delivered',
      'Date',
      'Amount',
    ];
    const escapeCsv = (value: string | number | boolean) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = exportRows.map((order) => [
      `ORD-${order._id.slice(-4).toUpperCase()}`,
      order.user?.name || '',
      order.user?.email || '',
      order.orderItems?.[0]?.name || '',
      orderStatusExportLine(order),
      order.paymentMethod || '',
      order.isPaid ? 'Yes' : 'No',
      order.isDelivered ? 'Yes' : 'No',
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
      Number(order.totalPrice || 0).toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => escapeCsv(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message:
        selectedIds.length > 0
          ? `Exported ${exportRows.length} selected order(s)`
          : `Exported ${exportRows.length} order(s)`,
      severity: 'success',
    });
  };

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((o) => o._id === id)));
  }, [filtered]);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
      >
        <Typography variant="h5" fontWeight={700}>
          Orders
        </Typography>
        <Button
          variant="contained"
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, flexShrink: 0 }}
        >
          New Order
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Manage and track all customer orders.
      </Typography>

      <Tabs
        value={statusFilter}
        onChange={(_e, next) => setStatusFilter(next as OrderStatusFilter)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 44,
          '& .MuiTabScrollButton-root': { width: { xs: 28, sm: 40 } },
        }}
      >
        <Tab value="all" label={`All (${bucketTabCounts.all})`} />
        {BUCKET_TAB_ORDER.map((key) => (
          <Tab
            key={key}
            value={key}
            label={`${orderStatusBucketLabel(key)} (${bucketTabCounts[key]})`}
          />
        ))}
      </Tabs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.25}
      >
        <Typography variant="h6" fontWeight={600}>
          Orders
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
        >
          <Menu
            anchorEl={columnsAnchorEl}
            open={Boolean(columnsAnchorEl)}
            onClose={() => setColumnsAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: { minWidth: 230, border: '1px solid rgba(229,231,235,1)', borderRadius: 2 },
              },
            }}
          >
            <MenuItem disabled sx={{ opacity: 1, fontWeight: 700, fontSize: 13 }}>
              Toggle columns
            </MenuItem>
            {columnOptions.map((col) => (
              <MenuItem key={col.key} onClick={() => toggleColumnVisibility(col.key)}>
                <Checkbox checked={visibleColumns[col.key]} size="small" sx={{ mr: 1 }} />
                {col.label}
              </MenuItem>
            ))}
          </Menu>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => setColumnsAnchorEl(e.currentTarget)}
          >
            Columns
          </Button>
          <Button size="small" variant="outlined" onClick={exportToCsv}>
            Export
          </Button>
        </Stack>
      </Stack>
      {selectedIds.length > 0 ? (
        <Paper
          variant="outlined"
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 2,
            borderColor: 'rgba(229,231,235,1)',
            bgcolor: '#F8FAFC',
            width: 'fit-content',
            maxWidth: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="body2" fontWeight={600}>
              {selectedIds.length} selected
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => setBulkDeleteOpen(true)}
                startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
              >
                Delete ({selectedIds.length})
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedIds([])}
                startIcon={<CloseRoundedIcon fontSize="small" />}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <TextField
            size="small"
            fullWidth
            label="Search order / customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: { sm: '1 1 200px' }, minWidth: { sm: 180 }, maxWidth: { sm: 360 } }}
          />
          <FormControl
            size="small"
            fullWidth
            sx={{ minWidth: { sm: 160 }, flex: { sm: '0 1 200px' } }}
          >
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
          <FormControl
            size="small"
            fullWidth
            sx={{ minWidth: { sm: 140 }, flex: { sm: '0 1 160px' } }}
          >
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
          <FormControl
            size="small"
            fullWidth
            sx={{ minWidth: { sm: 180 }, flex: { sm: '0 1 220px' } }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatusFilter)}
            >
              <MenuItem value="all">all ({bucketTabCounts.all})</MenuItem>
              {BUCKET_TAB_ORDER.map((key) => (
                <MenuItem key={key} value={key}>
                  {orderStatusBucketLabel(key).toLowerCase()} ({bucketTabCounts[key]})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load orders.</Typography>
        </Paper>
      ) : null}

      <Paper sx={{ overflowX: 'auto', border: '1px solid rgba(229,231,235,1)' }}>
        {mdUp ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllPagedSelected}
                      indeterminate={isSomePagedSelected}
                      onChange={(e) => toggleSelectAllPaged(e.target.checked)}
                      inputProps={{ 'aria-label': 'Select all orders on current page' }}
                    />
                  </TableCell>
                  {visibleColumns.order ? (
                    <TableCell sortDirection={sortBy === 'order' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'order'}
                        direction={sortBy === 'order' ? sortOrder : 'asc'}
                        onClick={() => handleSort('order')}
                      >
                        Order
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.customer ? (
                    <TableCell sortDirection={sortBy === 'customer' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'customer'}
                        direction={sortBy === 'customer' ? sortOrder : 'asc'}
                        onClick={() => handleSort('customer')}
                      >
                        Customer
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.product ? (
                    <TableCell sortDirection={sortBy === 'product' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'product'}
                        direction={sortBy === 'product' ? sortOrder : 'asc'}
                        onClick={() => handleSort('product')}
                      >
                        Product
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.status ? (
                    <TableCell sortDirection={sortBy === 'status' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'status'}
                        direction={sortBy === 'status' ? sortOrder : 'asc'}
                        onClick={() => handleSort('status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.date ? (
                    <TableCell sortDirection={sortBy === 'date' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'date'}
                        direction={sortBy === 'date' ? sortOrder : 'asc'}
                        onClick={() => handleSort('date')}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.trend ? (
                    <TableCell sortDirection={sortBy === 'trend' ? sortOrder : false}>
                      <TableSortLabel
                        active={sortBy === 'trend'}
                        direction={sortBy === 'trend' ? sortOrder : 'asc'}
                        onClick={() => handleSort('trend')}
                      >
                        Trend
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  {visibleColumns.amount ? (
                    <TableCell
                      align="right"
                      sortDirection={sortBy === 'amount' ? sortOrder : false}
                    >
                      <TableSortLabel
                        active={sortBy === 'amount'}
                        direction={sortBy === 'amount' ? sortOrder : 'asc'}
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                      </TableSortLabel>
                    </TableCell>
                  ) : null}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(isLoading ? [] : paged).map((order) => (
                  <TableRow key={order._id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell
                      padding="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.includes(order._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRowSelection(order._id);
                        }}
                        inputProps={{ 'aria-label': `Select order ${order._id}` }}
                      />
                    </TableCell>
                    {visibleColumns.order ? (
                      <TableCell sx={{ fontWeight: 700 }}>
                        ORD-{order._id.slice(-4).toUpperCase()}
                      </TableCell>
                    ) : null}
                    {visibleColumns.customer ? (
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
                            {initialsFrom(order.user?.name || order.user?.email)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{order.user?.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.user?.email || '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                    ) : null}
                    {visibleColumns.product ? (
                      <TableCell>
                        <Typography variant="body2">
                          {order.orderItems?.[0]?.name || '—'}
                        </Typography>
                        {order.orderItems && order.orderItems.length > 1 ? (
                          <Typography variant="caption" color="text.secondary">
                            +{order.orderItems.length - 1} more
                          </Typography>
                        ) : null}
                      </TableCell>
                    ) : null}
                    {visibleColumns.status ? (
                      <TableCell>
                        <OrderPipelineChip order={order} />
                      </TableCell>
                    ) : null}
                    {visibleColumns.date ? (
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    ) : null}
                    {visibleColumns.trend ? (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: trendLabel(order).tone }}
                        >
                          {trendLabel(order).text}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {visibleColumns.amount ? (
                      <TableCell align="right">{formatMoney(order.totalPrice)}</TableCell>
                    ) : null}
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => openRowMenu(e, order._id)}
                        sx={{ minWidth: 32, px: 0.5 }}
                      >
                        <MoreHorizRoundedIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount + 2}>
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No orders found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {(isLoading ? [] : paged).map((order) => (
              <Paper
                key={order._id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  borderColor: 'rgba(229,231,235,1)',
                  cursor: 'pointer',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(order._id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRowSelection(order._id);
                      }}
                      sx={{ p: 0.5, ml: -0.5 }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      onClick={(e) => openRowMenu(e, order._id)}
                      sx={{ minWidth: 40, px: 0.5, flexShrink: 0 }}
                      aria-label="Order actions"
                    >
                      <MoreHorizRoundedIcon fontSize="small" />
                    </Button>
                  </Stack>
                  <Typography variant="body2" fontWeight={700} sx={{ width: '100%' }}>
                    ORD-{order._id.slice(-4).toUpperCase()}
                  </Typography>
                  <Box sx={{ width: '100%', minWidth: 0 }}>
                    <OrderPipelineChip order={order} />
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                      {initialsFrom(order.user?.name || order.user?.email)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {order.user?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {order.user?.email || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {order.orderItems?.[0]?.name || '—'}
                  </Typography>
                  <Divider />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="baseline"
                    gap={1}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      Date
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ textAlign: 'right', wordBreak: 'break-word' }}
                    >
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      Trend
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: trendLabel(order).tone, textAlign: 'right' }}
                    >
                      {trendLabel(order).text}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={700}>
                      {formatMoney(order.totalPrice)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {!isLoading && filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No orders found.
              </Typography>
            ) : null}
          </Stack>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
          gap={1}
          sx={{ px: { xs: 1, sm: 2 }, pb: 1, pt: 0.5 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: { xs: 'center', sm: 'left' }, py: { xs: 0.5, sm: 0 } }}
          >
            Showing {filtered.length ? page * rowsPerPage + 1 : 0}-
            {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length} results
          </Typography>
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
            sx={{
              width: { xs: '100%', sm: 'auto' },
              overflow: 'hidden',
              border: 0,
              '& .MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' },
                gap: 0.5,
                minHeight: { xs: 56, sm: 48 },
                px: { xs: 0, sm: 1 },
              },
              '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                margin: 0,
              },
            }}
          />
        </Stack>
      </Paper>

      <Menu
        anchorEl={rowMenuAnchorEl}
        open={Boolean(rowMenuAnchorEl)}
        onClose={closeRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 170, border: '1px solid rgba(229,231,235,1)', borderRadius: 2 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (!rowMenuOrderId) return;
            viewOrder(rowMenuOrderId);
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!rowMenuOrderId) return;
            editOrder(rowMenuOrderId);
          }}
        >
          <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (!rowMenuOrderId) return;
            askDeleteOrder(rowMenuOrderId);
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={singleDeleteOpen}
        onClose={() => {
          setSingleDeleteOpen(false);
          setSingleDeleteId(null);
        }}
        title="Delete this order?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deletingSingle}
        description="This action permanently deletes the selected order."
        onConfirm={() => {
          if (!singleDeleteId) return;
          void deleteOrder(singleDeleteId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Order deleted', severity: 'success' });
              setSelectedIds((prev) => prev.filter((id) => id !== singleDeleteId));
              setSingleDeleteOpen(false);
              setSingleDeleteId(null);
            })
            .catch((e) => {
              setToast({
                message: e instanceof Error ? e.message : 'Failed to delete order',
                severity: 'error',
              });
            });
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} selected order(s)?`}
        confirmLabel={`Delete (${selectedIds.length})`}
        confirmColor="error"
        loading={deletingBulk}
        description="This action permanently deletes selected orders."
        onConfirm={() => {
          if (selectedIds.length === 0) return;
          void deleteOrdersBulk({ orderIds: selectedIds })
            .unwrap()
            .then((res) => {
              setToast({
                message: `Deleted ${res.deletedCount} order(s)`,
                severity: 'success',
              });
              setSelectedIds([]);
              setBulkDeleteOpen(false);
            })
            .catch((e) => {
              setToast({
                message: e instanceof Error ? e.message : 'Failed to delete selected orders',
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
