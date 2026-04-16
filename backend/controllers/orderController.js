const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

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

  return res.json(order);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  return res.json(orders);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (!order.canMarkAsPaid()) throw new AppError('Order is already paid', 400, 'ORDER_STATE_INVALID');

  order.markAsPaid(new Date());
  const updatedOrder = await order.save();
  return res.json(updatedOrder);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (!order.canMarkAsDelivered()) {
    throw new AppError('Order is already delivered', 400, 'ORDER_STATE_INVALID');
  }

  order.markAsDelivered(new Date());
  const updatedOrder = await order.save();
  return res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
};

