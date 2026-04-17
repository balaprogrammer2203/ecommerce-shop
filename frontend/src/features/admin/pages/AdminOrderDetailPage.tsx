import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useAdminOrderByIdQuery,
  useDeleteAdminOrderMutation,
  useMarkOrderPaidMutation,
  useUpdateAdminOrderMutation,
  useUpdateAdminOrderDeliveryMutation,
} from '../api/adminApi';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type ToastState = { message: string; severity: 'success' | 'error' } | null;

const statusChipSx = (status: 'completed' | 'processing' | 'pending' | 'cancelled') => {
  switch (status) {
    case 'completed':
      return {
        color: 'rgb(5,150,105)',
        bgcolor: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.25)',
      };
    case 'processing':
      return {
        color: 'rgb(30,64,175)',
        bgcolor: 'rgba(59,130,246,0.12)',
        border: '1px solid rgba(59,130,246,0.25)',
      };
    case 'pending':
      return {
        color: 'rgb(180,83,9)',
        bgcolor: 'rgba(245,158,11,0.14)',
        border: '1px solid rgba(245,158,11,0.3)',
      };
    default:
      return {
        color: 'rgb(153,27,27)',
        bgcolor: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.28)',
      };
  }
};

const toOrderStatus = (order: {
  isDelivered: boolean;
  isPaid: boolean;
  paymentMethod?: string;
}) => {
  if (order.isDelivered) return 'completed';
  if (order.isPaid && !order.isDelivered) return 'processing';
  if (!order.isPaid && order.paymentMethod === 'cod') return 'pending';
  if (!order.isPaid) return 'pending';
  return 'cancelled';
};

const initialsFrom = (nameOrEmail?: string) => {
  const raw = (nameOrEmail || '').trim();
  if (!raw) return 'NA';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return raw.slice(0, 2).toUpperCase();
};

const DELIVERY_STEPS = [
  'order_placed',
  'payment_pending',
  'payment_confirmed',
  'processing',
  'packed',
  'ready_to_ship',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
] as const;
const DELIVERY_STEP_LABEL: Record<(typeof DELIVERY_STEPS)[number], string> = {
  order_placed: 'Order Placed',
  payment_pending: 'Payment Pending',
  payment_confirmed: 'Payment Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  ready_to_ship: 'Ready To Ship',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};
const DELIVERY_STATUS_LABEL: Record<string, string> = {
  order_placed: 'Order Placed',
  payment_pending: 'Payment Pending',
  payment_confirmed: 'Payment Confirmed',
  payment_failed: 'Payment Failed',
  processing: 'Processing',
  packed: 'Packed',
  ready_to_ship: 'Ready To Ship',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delivery_attempt_failed: 'Delivery Attempt Failed',
  delivery_rescheduled: 'Delivery Rescheduled',
  delivery_exception: 'Delivery Exception',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  return_approved: 'Return Approved',
  return_pickup_scheduled: 'Return Pickup Scheduled',
  return_picked_up: 'Return Picked Up',
  return_in_transit: 'Return In Transit',
  return_received: 'Return Received',
  return_rejected: 'Return Rejected',
  refund_initiated: 'Refund Initiated',
  refund_completed: 'Refund Completed',
  // legacy labels
  pending: 'Pending (Legacy)',
  delivery_failed: 'Delivery Failed (Legacy)',
  rescheduled: 'Rescheduled (Legacy)',
  return_initiated: 'Return Initiated (Legacy)',
  refunded: 'Refunded (Legacy)',
};
const ALLOWED_NEXT_STATUS: Record<string, string[]> = {
  order_placed: ['payment_pending', 'payment_confirmed', 'payment_failed', 'cancelled'],
  payment_pending: ['payment_confirmed', 'payment_failed', 'cancelled'],
  payment_failed: ['payment_pending', 'payment_confirmed', 'cancelled'],
  payment_confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped', 'cancelled'],
  shipped: ['in_transit', 'delivery_attempt_failed', 'delivery_exception'],
  in_transit: ['out_for_delivery', 'delivery_attempt_failed', 'delivery_exception'],
  out_for_delivery: [
    'delivered',
    'delivery_attempt_failed',
    'delivery_rescheduled',
    'delivery_exception',
  ],
  delivery_attempt_failed: [
    'delivery_rescheduled',
    'out_for_delivery',
    'delivery_exception',
    'cancelled',
  ],
  delivery_rescheduled: ['out_for_delivery', 'delivery_attempt_failed', 'delivery_exception'],
  delivery_exception: ['delivery_rescheduled', 'in_transit', 'out_for_delivery', 'cancelled'],
  delivered: ['return_requested', 'refund_initiated'],
  return_requested: ['return_approved', 'return_rejected'],
  return_approved: ['return_pickup_scheduled'],
  return_pickup_scheduled: ['return_picked_up'],
  return_picked_up: ['return_in_transit'],
  return_in_transit: ['return_received'],
  return_received: ['refund_initiated'],
  return_rejected: ['refund_initiated'],
  refund_initiated: ['refund_completed'],
  refund_completed: [],
  // legacy paths
  pending: [
    'payment_pending',
    'payment_confirmed',
    'payment_failed',
    'processing',
    'packed',
    'cancelled',
  ],
  delivery_failed: ['delivery_rescheduled', 'out_for_delivery', 'delivery_exception', 'cancelled'],
  rescheduled: ['out_for_delivery', 'delivery_attempt_failed', 'delivery_exception'],
  return_initiated: ['return_requested', 'refund_initiated', 'refund_completed'],
  refunded: ['refund_completed'],
  cancelled: [],
};

/** Label + value rows in Payment Information: stack on narrow viewports so long IDs wrap inside the card. */
const PaymentFieldRow = ({
  label,
  value,
  valueSx,
}: {
  label: string;
  value: string;
  valueSx?: SxProps<Theme>;
}) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    spacing={{ xs: 0.25, sm: 0 }}
    sx={{ columnGap: { sm: 2 } }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        minWidth: 0,
        maxWidth: { xs: '100%', sm: '58%' },
        width: { xs: '100%', sm: 'auto' },
        textAlign: { xs: 'left', sm: 'right' },
        wordBreak: { xs: 'break-all', sm: 'break-word' },
        overflowWrap: 'anywhere',
        ...valueSx,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

export const AdminOrderDetailPage = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const { orderId = '' } = useParams();
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useAdminOrderByIdQuery(orderId, {
    skip: !orderId,
  });
  const [markPaid] = useMarkOrderPaidMutation();
  const [updateOrder, { isLoading: updatingOrder }] = useUpdateAdminOrderMutation();
  const [updateOrderDelivery, { isLoading: updatingDelivery }] =
    useUpdateAdminOrderDeliveryMutation();
  const [deleteOrder, { isLoading: deleting }] = useDeleteAdminOrderMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [markPaidConfirmOpen, setMarkPaidConfirmOpen] = useState(false);
  const [criticalActionConfirmOpen, setCriticalActionConfirmOpen] = useState(false);
  const [pendingDeliveryAction, setPendingDeliveryAction] = useState<
    null | 'cancel_delivery' | 'trigger_return' | 'trigger_refund'
  >(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    paymentMethod: 'cod' as 'stripe' | 'paypal' | 'razorpay' | 'cod',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [ops, setOps] = useState({
    nextStatus: 'order_placed' as
      | 'order_placed'
      | 'payment_pending'
      | 'payment_confirmed'
      | 'payment_failed'
      | 'processing'
      | 'ready_to_ship'
      | 'packed'
      | 'shipped'
      | 'in_transit'
      | 'out_for_delivery'
      | 'delivered'
      | 'delivery_attempt_failed'
      | 'delivery_rescheduled'
      | 'delivery_exception'
      | 'cancelled'
      | 'return_requested'
      | 'return_approved'
      | 'return_pickup_scheduled'
      | 'return_picked_up'
      | 'return_in_transit'
      | 'return_received'
      | 'return_rejected'
      | 'refund_initiated'
      | 'refund_completed'
      | 'pending'
      | 'delivery_failed'
      | 'rescheduled'
      | 'return_initiated'
      | 'refunded',
    subStatus: '',
    description: '',
    courierPartner: '',
    trackingId: '',
    trackingUrl: '',
    estimatedDeliveryAt: '',
  });
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!order) return;
    const current =
      order.delivery?.currentStatus || (order.isDelivered ? 'delivered' : 'order_placed');
    const normalizedCurrent = current === 'pending' ? 'payment_pending' : current;
    setForm({
      paymentMethod: (order.paymentMethod as 'stripe' | 'paypal' | 'razorpay' | 'cod') || 'cod',
      address: order.shippingAddress?.address || '',
      city: order.shippingAddress?.city || '',
      postalCode: order.shippingAddress?.postalCode || '',
      country: order.shippingAddress?.country || '',
    });
    setOps((prev) => ({
      ...prev,
      nextStatus: normalizedCurrent,
      subStatus: order.delivery?.subStatus || '',
      courierPartner: order.delivery?.courierDetails?.partner || '',
      trackingId: order.delivery?.courierDetails?.trackingId || '',
      trackingUrl: order.delivery?.courierDetails?.trackingUrl || '',
      estimatedDeliveryAt: order.delivery?.courierDetails?.estimatedDeliveryAt
        ? new Date(order.delivery.courierDetails.estimatedDeliveryAt).toISOString().slice(0, 16)
        : '',
    }));
  }, [order]);
  const fmtDateTime = (value?: string) => (value ? new Date(value).toLocaleString() : '-');
  const currentStatus =
    order?.delivery?.currentStatus || (order?.isDelivered ? 'delivered' : 'order_placed');
  const allowedNextStatuses = ALLOWED_NEXT_STATUS[currentStatus] || [];
  const stepIndex = DELIVERY_STEPS.findIndex((s) => s === currentStatus);
  const activeStep = stepIndex === -1 ? 0 : stepIndex;
  const trackingLogs = [...(order?.delivery?.trackingLogs || [])].sort(
    (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime(),
  );
  const runDeliveryAction = (action: 'set_status' | 'mark_delivery_failed' | 'reschedule') => {
    if (!orderId) return;
    void updateOrderDelivery({
      id: orderId,
      payload: {
        action,
        payload: {
          nextStatus: action === 'set_status' ? ops.nextStatus : undefined,
          subStatus: ops.subStatus || undefined,
          description: ops.description || undefined,
          actor: 'admin',
        },
      },
    })
      .unwrap()
      .then(() => {
        setToast({ message: 'Delivery status updated', severity: 'success' });
        void refetch();
      })
      .catch((e) =>
        setToast({
          message: e instanceof Error ? e.message : 'Failed to update delivery status',
          severity: 'error',
        }),
      );
  };
  const runCriticalAction = (action: 'cancel_delivery' | 'trigger_return' | 'trigger_refund') => {
    if (!orderId) return;
    void updateOrderDelivery({
      id: orderId,
      payload: {
        action,
        payload: {
          subStatus: ops.subStatus || undefined,
          description: ops.description || undefined,
          actor: 'admin',
        },
      },
    })
      .unwrap()
      .then(() => {
        setToast({ message: 'Delivery workflow updated', severity: 'success' });
        setCriticalActionConfirmOpen(false);
        setPendingDeliveryAction(null);
        void refetch();
      })
      .catch((e) =>
        setToast({
          message: e instanceof Error ? e.message : 'Failed to apply action',
          severity: 'error',
        }),
      );
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ width: '100%', minWidth: 0 }}
      >
        <Stack
          spacing={0.5}
          sx={{
            minWidth: 0,
            width: { xs: '100%', md: 'auto' },
            flex: { md: '1 1 auto' },
            pr: { md: 2 },
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            Order {orderId ? `ORD-${orderId.slice(-4).toUpperCase()}` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          flexWrap={{ xs: 'wrap', md: 'nowrap' }}
          sx={{
            width: { xs: '100%', md: 'auto' },
            flexShrink: { md: 0 },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: { md: 'flex-end' },
            '& > .MuiButton-root': {
              width: { xs: '100%', md: 'auto' },
              flexShrink: { md: 0 },
              whiteSpace: { md: 'nowrap' },
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/admin/orders')}
          >
            Back
          </Button>
          {!order?.isPaid ? (
            <Button
              variant="contained"
              startIcon={<PaymentRoundedIcon />}
              onClick={() => setMarkPaidConfirmOpen(true)}
            >
              Mark paid
            </Button>
          ) : null}
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">Loading order...</Typography>
        </Paper>
      ) : null}
      {isError ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">Failed to load order details.</Typography>
        </Paper>
      ) : null}

      {order ? (
        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)', order: 1 }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Order Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Basic order information
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  ORD-{order._id.slice(-4).toUpperCase()}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={DELIVERY_STATUS_LABEL[currentStatus] || toOrderStatus(order)}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    fontWeight: 700,
                    ...statusChipSx(toOrderStatus(order)),
                  }}
                />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2">{fmtDateTime(order.createdAt)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  ${order.totalPrice.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Updated
                </Typography>
                <Typography variant="body2">{fmtDateTime(order.updatedAt)}</Typography>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2.5,
              borderColor: 'rgba(229,231,235,1)',
              order: 4,
              overflow: 'hidden',
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Payment Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Payment state and provider references from order record
            </Typography>
            <Stack spacing={1}>
              <PaymentFieldRow
                label="Payment Method"
                value={order.paymentMethod || '-'}
                valueSx={{ textTransform: 'uppercase' }}
              />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 0.5, sm: 0 }}
                sx={{ columnGap: { sm: 2 } }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  Payment Status
                </Typography>
                <Chip
                  size="small"
                  label={order.isPaid ? 'Paid' : 'Unpaid'}
                  color={order.isPaid ? 'success' : 'warning'}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, flexShrink: 0 }}
                />
              </Stack>
              <PaymentFieldRow label="Paid At" value={fmtDateTime(order.paidAt)} />
              <Divider />
              <PaymentFieldRow label="Provider" value={order.paymentResult?.provider || '-'} />
              <PaymentFieldRow label="Session ID" value={order.paymentResult?.sessionId || '-'} />
              <PaymentFieldRow
                label="Payment Intent ID"
                value={order.paymentResult?.paymentIntentId || '-'}
              />
              <PaymentFieldRow label="Event ID" value={order.paymentResult?.eventId || '-'} />
              <PaymentFieldRow label="Stripe Session" value={order.stripeSessionId || '-'} />
              <PaymentFieldRow label="PayPal Order" value={order.paypalOrderId || '-'} />
              <PaymentFieldRow label="Razorpay Order" value={order.razorpayOrderId || '-'} />
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2.5,
              borderColor: 'rgba(229,231,235,1)',
              order: 2,
              overflow: 'hidden',
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Delivery Status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current shipping state and progress tracker
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
              sx={{ mb: 1.5 }}
            >
              <Chip
                label={DELIVERY_STATUS_LABEL[currentStatus] || 'Pending'}
                color={
                  currentStatus === 'delivered'
                    ? 'success'
                    : currentStatus === 'delivery_attempt_failed' ||
                        currentStatus === 'delivery_exception'
                      ? 'error'
                      : currentStatus === 'out_for_delivery'
                        ? 'warning'
                        : 'default'
                }
                sx={{ textTransform: 'capitalize', fontWeight: 700, maxWidth: '100%' }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  wordBreak: 'break-word',
                  alignSelf: { xs: 'stretch', sm: 'auto' },
                  textAlign: { xs: 'left', sm: 'right' },
                }}
              >
                {order.delivery?.subStatus || 'No sub-status'}
              </Typography>
            </Stack>
            <Stepper
              activeStep={activeStep}
              orientation={mdUp ? 'horizontal' : 'vertical'}
              alternativeLabel={mdUp}
              sx={
                mdUp
                  ? undefined
                  : {
                      alignItems: 'stretch',
                      '& .MuiStepLabel-root': { alignItems: 'flex-start' },
                      '& .MuiStepLabel-labelContainer': {
                        maxWidth: '100%',
                        width: '100%',
                      },
                      '& .MuiStepLabel-label': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: 1.35,
                        fontSize: '0.8125rem',
                      },
                    }
              }
            >
              {DELIVERY_STEPS.map((step) => (
                <Step key={step} completed={DELIVERY_STEPS.indexOf(step) <= activeStep}>
                  <StepLabel>{DELIVERY_STEP_LABEL[step]}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)', order: 5 }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Shipping Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Delivery address and contact details
            </Typography>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ width: 34, height: 34, fontSize: 12 }}>
                {initialsFrom(order.user?.name || order.user?.email)}
              </Avatar>
              <Stack spacing={0}>
                <Typography variant="body2" fontWeight={600}>
                  {order.user?.name || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.user?.email || '-'}
                </Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 1.25 }} />
            <Typography variant="body2">{order.shippingAddress?.address || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress?.city || '-'}, {order.shippingAddress?.postalCode || '-'} |{' '}
              {order.shippingAddress?.country || '-'}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)', order: 6 }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Courier Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Courier partner and tracking reference
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Partner
                </Typography>
                <Typography variant="body2">
                  {order.delivery?.courierDetails?.partner || '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tracking ID
                </Typography>
                <Typography variant="body2">
                  {order.delivery?.courierDetails?.trackingId || '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tracking URL
                </Typography>
                <Typography variant="body2">
                  {order.delivery?.courierDetails?.trackingUrl || '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  ETA
                </Typography>
                <Typography variant="body2">
                  {fmtDateTime(order.delivery?.courierDetails?.estimatedDeliveryAt)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)', order: 3 }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Admin Delivery Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Update status, tracking, and exception flow with guarded transitions
            </Typography>
            <Stack spacing={1}>
              <FormControl size="small">
                <InputLabel>Next Status</InputLabel>
                <Select
                  label="Next Status"
                  value={ops.nextStatus}
                  onChange={(e) =>
                    setOps((prev) => ({
                      ...prev,
                      nextStatus: e.target.value as typeof prev.nextStatus,
                    }))
                  }
                >
                  {Object.entries(DELIVERY_STATUS_LABEL)
                    .filter(
                      ([key]) =>
                        ![
                          'pending',
                          'delivery_failed',
                          'rescheduled',
                          'return_initiated',
                          'refunded',
                        ].includes(key),
                    )
                    .map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="Sub-status"
                  value={ops.subStatus}
                  onChange={(e) => setOps((prev) => ({ ...prev, subStatus: e.target.value }))}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Description"
                  value={ops.description}
                  onChange={(e) => setOps((prev) => ({ ...prev, description: e.target.value }))}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="Courier Partner"
                  value={ops.courierPartner}
                  onChange={(e) => setOps((prev) => ({ ...prev, courierPartner: e.target.value }))}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Tracking ID"
                  value={ops.trackingId}
                  onChange={(e) => setOps((prev) => ({ ...prev, trackingId: e.target.value }))}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="Tracking URL"
                  value={ops.trackingUrl}
                  onChange={(e) => setOps((prev) => ({ ...prev, trackingUrl: e.target.value }))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="datetime-local"
                  label="ETA"
                  InputLabelProps={{ shrink: true }}
                  value={ops.estimatedDeliveryAt}
                  onChange={(e) =>
                    setOps((prev) => ({ ...prev, estimatedDeliveryAt: e.target.value }))
                  }
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={() => runDeliveryAction('set_status')}
                  disabled={updatingDelivery}
                >
                  Apply status
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (!orderId) return;
                    void updateOrderDelivery({
                      id: orderId,
                      payload: {
                        action: 'update_tracking',
                        payload: {
                          subStatus: ops.subStatus || undefined,
                          description: ops.description || undefined,
                          actor: 'admin',
                          courierDetails: {
                            partner: ops.courierPartner || undefined,
                            trackingId: ops.trackingId || undefined,
                            trackingUrl: ops.trackingUrl || undefined,
                            estimatedDeliveryAt: ops.estimatedDeliveryAt
                              ? new Date(ops.estimatedDeliveryAt).toISOString()
                              : undefined,
                          },
                        },
                      },
                    })
                      .unwrap()
                      .then(() => {
                        setToast({ message: 'Tracking details updated', severity: 'success' });
                        void refetch();
                      })
                      .catch((e) =>
                        setToast({
                          message: e instanceof Error ? e.message : 'Failed to update tracking',
                          severity: 'error',
                        }),
                      );
                  }}
                  disabled={updatingDelivery}
                >
                  Save tracking
                </Button>
                <Button
                  color="warning"
                  variant="outlined"
                  onClick={() => runDeliveryAction('mark_delivery_failed')}
                  disabled={updatingDelivery}
                >
                  Delivery attempt failed
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => runDeliveryAction('reschedule')}
                  disabled={updatingDelivery}
                >
                  Delivery rescheduled
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    setPendingDeliveryAction('cancel_delivery');
                    setCriticalActionConfirmOpen(true);
                  }}
                  disabled={updatingDelivery}
                >
                  Cancel delivery
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => {
                    setPendingDeliveryAction('trigger_return');
                    setCriticalActionConfirmOpen(true);
                  }}
                  disabled={updatingDelivery}
                >
                  Trigger return
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => {
                    setPendingDeliveryAction('trigger_refund');
                    setCriticalActionConfirmOpen(true);
                  }}
                  disabled={updatingDelivery}
                >
                  Trigger refund
                </Button>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Allowed next statuses from{' '}
                  <b>{DELIVERY_STATUS_LABEL[currentStatus] || currentStatus}</b>:
                </Typography>
                {allowedNextStatuses.length ? (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap">
                    {allowedNextStatuses.map((status) => (
                      <Chip
                        key={status}
                        size="small"
                        variant="outlined"
                        label={DELIVERY_STATUS_LABEL[status] || status}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No further transitions allowed from this status.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)', order: 7 }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Tracking Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Chronological event feed (system/admin/courier)
            </Typography>
            <Stack spacing={1.25}>
              {trackingLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tracking logs yet.
                </Typography>
              ) : (
                trackingLogs.map((log, idx) => (
                  <Paper
                    key={`${log.timestamp}-${idx}`}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderColor:
                        log.status === 'delivery_attempt_failed' ||
                        log.status === 'delivery_exception'
                          ? 'rgba(248,113,113,0.45)'
                          : 'rgba(229,231,235,1)',
                      bgcolor:
                        log.status === 'delivery_attempt_failed' ||
                        log.status === 'delivery_exception'
                          ? 'rgba(254,242,242,1)'
                          : '#FFFFFF',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>
                        {DELIVERY_STATUS_LABEL[log.status] || log.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fmtDateTime(log.timestamp)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {log.subStatus || '-'}
                    </Typography>
                    <Typography variant="body2">{log.description || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actor: {log.actor || 'system'}
                    </Typography>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2.5, borderColor: 'rgba(229,231,235,1)', order: 8 }}
          >
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Product
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Purchased product details
            </Typography>
            <Stack spacing={1}>
              {(order.orderItems ?? []).map((item, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${(item.qty * item.price).toFixed(2)}
                  </Typography>
                </Stack>
              ))}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Items Total
                </Typography>
                <Typography variant="body2">${(order.itemsPrice ?? 0).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="body2">${(order.taxPrice ?? 0).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body2">${(order.shippingPrice ?? 0).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Grand Total
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  ${order.totalPrice.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      ) : null}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit order details</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                label="Payment Method"
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as 'stripe' | 'paypal' | 'razorpay' | 'cod',
                  }))
                }
              >
                <MenuItem value="stripe">stripe</MenuItem>
                <MenuItem value="paypal">paypal</MenuItem>
                <MenuItem value="razorpay">razorpay</MenuItem>
                <MenuItem value="cod">cod</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Address"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="City"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                fullWidth
              />
              <TextField
                size="small"
                label="Postal Code"
                value={form.postalCode}
                onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              size="small"
              label="Country"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={updatingOrder}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!orderId) return;
              void updateOrder({
                id: orderId,
                payload: {
                  paymentMethod: form.paymentMethod,
                  shippingAddress: {
                    address: form.address.trim(),
                    city: form.city.trim(),
                    postalCode: form.postalCode.trim(),
                    country: form.country.trim(),
                  },
                },
              })
                .unwrap()
                .then(() => {
                  setToast({ message: 'Order details updated', severity: 'success' });
                  setEditOpen(false);
                  void refetch();
                })
                .catch((e) =>
                  setToast({
                    message: e instanceof Error ? e.message : 'Failed to update order',
                    severity: 'error',
                  }),
                );
            }}
            disabled={updatingOrder}
          >
            {updatingOrder ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={markPaidConfirmOpen}
        onClose={() => setMarkPaidConfirmOpen(false)}
        title="Mark this order as paid?"
        confirmLabel="Mark paid"
        confirmColor="primary"
        description="This will update the payment status immediately."
        onConfirm={() => {
          if (!orderId) return;
          void markPaid(orderId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Order marked as paid', severity: 'success' });
              setMarkPaidConfirmOpen(false);
              void refetch();
            })
            .catch((e) =>
              setToast({
                message: e instanceof Error ? e.message : 'Failed to mark paid',
                severity: 'error',
              }),
            );
        }}
      />

      <ConfirmDialog
        open={criticalActionConfirmOpen}
        onClose={() => {
          setCriticalActionConfirmOpen(false);
          setPendingDeliveryAction(null);
        }}
        title="Proceed with critical delivery action?"
        confirmLabel="Continue"
        confirmColor="error"
        description="This action may have irreversible customer impact. Please confirm."
        loading={updatingDelivery}
        onConfirm={() => {
          if (!pendingDeliveryAction) return;
          runCriticalAction(pendingDeliveryAction);
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this order?"
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        description="This action permanently deletes the order."
        onConfirm={() => {
          if (!orderId) return;
          void deleteOrder(orderId)
            .unwrap()
            .then(() => {
              setToast({ message: 'Order deleted', severity: 'success' });
              navigate('/admin/orders');
            })
            .catch((e) =>
              setToast({
                message: e instanceof Error ? e.message : 'Failed to delete order',
                severity: 'error',
              }),
            );
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
