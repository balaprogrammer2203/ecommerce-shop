const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const DELIVERY_TRANSITIONS = {
  order_placed: ['payment_pending', 'payment_confirmed', 'payment_failed', 'cancelled'],
  payment_pending: ['payment_confirmed', 'payment_failed', 'cancelled'],
  payment_failed: ['payment_pending', 'payment_confirmed', 'cancelled'],
  payment_confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped', 'cancelled'],
  shipped: ['in_transit', 'delivery_attempt_failed', 'delivery_exception'],
  in_transit: ['out_for_delivery', 'delivery_attempt_failed', 'delivery_exception'],
  out_for_delivery: ['delivered', 'delivery_attempt_failed', 'delivery_rescheduled', 'delivery_exception'],
  delivery_attempt_failed: ['delivery_rescheduled', 'out_for_delivery', 'delivery_exception', 'cancelled'],
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
  // Legacy compatibility states
  pending: ['payment_pending', 'payment_confirmed', 'payment_failed', 'processing', 'packed', 'cancelled'],
  delivery_failed: ['delivery_rescheduled', 'out_for_delivery', 'delivery_exception', 'cancelled'],
  rescheduled: ['out_for_delivery', 'delivery_attempt_failed', 'delivery_exception'],
  return_initiated: ['return_requested', 'refund_initiated', 'refund_completed'],
  refunded: ['refund_completed'],
  cancelled: [],
};

const statusLabel = {
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
  // Legacy labels
  pending: 'Pending (Legacy)',
  delivery_failed: 'Delivery Failed (Legacy)',
  rescheduled: 'Rescheduled (Legacy)',
  return_initiated: 'Return Initiated (Legacy)',
  refunded: 'Refunded (Legacy)',
};

const ensureDelivery = (order) => {
  if (!order.delivery) {
    order.delivery = {};
  }
  if (!order.delivery.currentStatus) {
    order.delivery.currentStatus = order.isDelivered ? 'delivered' : 'order_placed';
  }
  if (!Array.isArray(order.delivery.trackingLogs)) {
    order.delivery.trackingLogs = [];
  }
  if (!Array.isArray(order.delivery.deliveryAttempts)) {
    order.delivery.deliveryAttempts = [];
  }
  if (!order.delivery.courierDetails) {
    order.delivery.courierDetails = {};
  }
};

const appendTrackingLog = (order, payload) => {
  order.delivery.trackingLogs.push({
    timestamp: payload.timestamp ?? new Date(),
    status: payload.status,
    subStatus: payload.subStatus,
    description: payload.description,
    actor: payload.actor || 'admin',
  });
};

const changeDeliveryStatus = (order, nextStatus, meta = {}) => {
  ensureDelivery(order);
  const current = order.delivery.currentStatus || 'order_placed';
  if (current !== nextStatus) {
    const allowed = DELIVERY_TRANSITIONS[current] || [];
    if (!allowed.includes(nextStatus)) {
      throw new AppError(
        `Invalid delivery transition from ${statusLabel[current] || current} to ${statusLabel[nextStatus] || nextStatus}`,
        400,
        'ORDER_STATE_INVALID',
      );
    }
  }

  order.delivery.currentStatus = nextStatus;
  if (meta.subStatus !== undefined) {
    order.delivery.subStatus = meta.subStatus || undefined;
  }

  if (nextStatus === 'delivered') {
    order.markAsDelivered(new Date());
  }

  appendTrackingLog(order, {
    status: nextStatus,
    subStatus: meta.subStatus,
    description: meta.description || `Status changed to ${statusLabel[nextStatus] || nextStatus}`,
    actor: meta.actor || 'admin',
  });
};

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new AppError('No order items', 400, 'VALIDATION_ERROR');
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    throw new AppError('Missing shipping address', 400, 'VALIDATION_ERROR');
  }

  const requiredShipping = ['address', 'city', 'postalCode', 'country'];
  for (const field of requiredShipping) {
    if (!shippingAddress[field]) {
      throw new AppError(`Missing shipping address field: ${field}`, 400, 'VALIDATION_ERROR');
    }
  }

  if (!paymentMethod) throw new AppError('Missing payment method', 400, 'VALIDATION_ERROR');
  if (!['stripe', 'paypal', 'razorpay', 'cod'].includes(paymentMethod)) {
    throw new AppError('Invalid payment method', 400, 'VALIDATION_ERROR');
  }

  if (itemsPrice === undefined || totalPrice === undefined) {
    throw new AppError('Missing order totals', 400, 'VALIDATION_ERROR');
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice: taxPrice ?? 0,
    shippingPrice: shippingPrice ?? 0,
    totalPrice,
    delivery: {
      currentStatus: 'order_placed',
      subStatus: 'Order received',
      trackingLogs: [
        {
          status: 'order_placed',
          subStatus: 'Order received',
          description: 'Order has been created',
          actor: 'system',
          timestamp: new Date(),
        },
      ],
    },
  });

  const createdOrder = await order.save();
  return res.status(201).json(createdOrder);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this order', 403, 'FORBIDDEN');
  }

  ensureDelivery(order);
  return res.json(order);
});

const getOrders = asyncHandler(async (req, res) => {
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'date';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  const direction = sortOrder === 'asc' ? 1 : -1;

  const orders = await Order.find({}).populate('user', 'name email').lean();

  const statusWeight = (order) => {
    if (order.isDelivered) return 3;
    if (order.isPaid) return 2;
    if (!order.isPaid) return 1;
    return 0;
  };

  const trendWeight = (order) => {
    if (order.isDelivered) return 3;
    if (order.isPaid) return 2;
    return 1;
  };

  const compareStrings = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

  orders.sort((a, b) => {
    let base = 0;

    switch (sortBy) {
      case 'order':
        base = compareStrings(a._id.toString(), b._id.toString());
        break;
      case 'customer':
        base = compareStrings(a.user?.name || a.user?.email || '', b.user?.name || b.user?.email || '');
        break;
      case 'product':
        base = compareStrings(a.orderItems?.[0]?.name || '', b.orderItems?.[0]?.name || '');
        break;
      case 'status':
        base = statusWeight(a) - statusWeight(b);
        break;
      case 'trend':
        base = trendWeight(a) - trendWeight(b);
        break;
      case 'amount':
        base = (a.totalPrice || 0) - (b.totalPrice || 0);
        break;
      case 'date':
      default:
        base = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    if (base === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return base * direction;
  });

  return res.json(orders);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (!order.canMarkAsPaid()) throw new AppError('Order is already paid', 400, 'ORDER_STATE_INVALID');

  ensureDelivery(order);
  order.markAsPaid(new Date());
  const current = order.delivery.currentStatus || 'order_placed';
  if (
    current === 'order_placed' ||
    current === 'payment_pending' ||
    current === 'payment_failed' ||
    current === 'pending'
  ) {
    changeDeliveryStatus(order, 'payment_confirmed', {
      subStatus: 'Payment verified',
      description: 'Payment confirmed by admin',
      actor: 'admin',
    });
  } else {
    appendTrackingLog(order, {
      status: current,
      subStatus: order.delivery.subStatus || 'Payment verified',
      description: 'Payment confirmed by admin',
      actor: 'admin',
    });
  }
  const updatedOrder = await order.save();
  return res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (!order.canMarkAsDelivered()) {
    throw new AppError('Order is already delivered', 400, 'ORDER_STATE_INVALID');
  }

  changeDeliveryStatus(order, 'delivered', {
    subStatus: 'Package delivered',
    description: 'Order marked as delivered by admin',
    actor: 'admin',
  });
  const updatedOrder = await order.save();
  return res.json(updatedOrder);
});

const updateOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

  const { shippingAddress, paymentMethod } = req.body ?? {};

  if (paymentMethod !== undefined) {
    if (!['stripe', 'paypal', 'razorpay', 'cod'].includes(paymentMethod)) {
      throw new AppError('Invalid payment method', 400, 'VALIDATION_ERROR');
    }
    order.paymentMethod = paymentMethod;
  }

  if (shippingAddress !== undefined) {
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      throw new AppError('Invalid shipping address', 400, 'VALIDATION_ERROR');
    }

    const nextAddress = {
      ...order.shippingAddress.toObject(),
      ...shippingAddress,
    };

    const requiredShipping = ['address', 'city', 'postalCode', 'country'];
    for (const field of requiredShipping) {
      if (!nextAddress[field]) {
        throw new AppError(`Missing shipping address field: ${field}`, 400, 'VALIDATION_ERROR');
      }
    }

    order.shippingAddress = nextAddress;
  }

  const updatedOrder = await order.save();
  return res.json(updatedOrder);
});

const updateOrderDeliveryWorkflow = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

  ensureDelivery(order);
  const { action, payload } = req.body ?? {};
  const actor = payload?.actor || 'admin';

  if (!action) {
    throw new AppError('Missing delivery action', 400, 'VALIDATION_ERROR');
  }

  if (action === 'update_tracking') {
    const nextCourier = {
      ...(order.delivery.courierDetails || {}),
      ...(payload?.courierDetails || {}),
    };
    order.delivery.courierDetails = nextCourier;
    if (payload?.subStatus !== undefined) {
      order.delivery.subStatus = payload.subStatus || undefined;
    }
    appendTrackingLog(order, {
      status: order.delivery.currentStatus || 'order_placed',
      subStatus: order.delivery.subStatus,
      description: payload?.description || 'Tracking details updated',
      actor,
    });
  } else if (action === 'set_status') {
    const nextStatus = payload?.nextStatus;
    if (!nextStatus) {
      throw new AppError('Missing nextStatus for set_status', 400, 'VALIDATION_ERROR');
    }
    changeDeliveryStatus(order, nextStatus, {
      subStatus: payload?.subStatus,
      description: payload?.description,
      actor,
    });
  } else if (action === 'mark_delivery_failed') {
    changeDeliveryStatus(order, 'delivery_attempt_failed', {
      subStatus: payload?.subStatus || 'Delivery attempt failed',
      description: payload?.description || 'Delivery attempt failed',
      actor,
    });
    order.delivery.deliveryAttempts.push({
      attemptedAt: new Date(),
      outcome: 'failed',
      notes: payload?.description || payload?.subStatus || 'Delivery failed',
    });
  } else if (action === 'reschedule') {
    changeDeliveryStatus(order, 'delivery_rescheduled', {
      subStatus: payload?.subStatus || 'Delivery rescheduled',
      description: payload?.description || 'Delivery rescheduled',
      actor,
    });
  } else if (action === 'cancel_delivery') {
    changeDeliveryStatus(order, 'cancelled', {
      subStatus: payload?.subStatus || 'Delivery cancelled',
      description: payload?.description || 'Delivery cancelled by admin',
      actor,
    });
  } else if (action === 'trigger_return') {
    changeDeliveryStatus(order, 'return_requested', {
      subStatus: payload?.subStatus || 'Return requested',
      description: payload?.description || 'Return process initiated',
      actor,
    });
    order.delivery.returnRequested = true;
  } else if (action === 'trigger_refund') {
    changeDeliveryStatus(order, 'refund_initiated', {
      subStatus: payload?.subStatus || 'Refund initiated',
      description: payload?.description || 'Refund process initiated',
      actor,
    });
    order.delivery.refundRequested = true;
  } else {
    throw new AppError('Unsupported delivery action', 400, 'VALIDATION_ERROR');
  }

  const updatedOrder = await order.save();
  return res.json(updatedOrder);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

  await order.deleteOne();
  return res.json({ message: 'Order deleted' });
});

const deleteOrdersBulk = asyncHandler(async (req, res) => {
  const orderIds = Array.isArray(req.body?.orderIds) ? req.body.orderIds : [];
  if (orderIds.length === 0) {
    throw new AppError('No order ids provided', 400, 'VALIDATION_ERROR');
  }

  const result = await Order.deleteMany({ _id: { $in: orderIds } });
  return res.json({
    message: 'Orders deleted',
    deletedCount: result.deletedCount ?? 0,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderDetails,
  updateOrderDeliveryWorkflow,
  deleteOrder,
  deleteOrdersBulk,
};

