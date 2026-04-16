const crypto = require('crypto');
const Razorpay = require('razorpay');
const Stripe = require('stripe');

const Cart = require('../models/Cart');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new AppError('Stripe is not configured on the server', 500, 'STRIPE_NOT_CONFIGURED');
  }
  if (!key.startsWith('sk_')) {
    throw new AppError(
      'Stripe secret key is invalid. Use STRIPE_SECRET_KEY starting with sk_.',
      500,
      'STRIPE_NOT_CONFIGURED'
    );
  }
  return new Stripe(key);
};

const buildStripeLineItems = (orderItems = []) =>
  orderItems.map((item) => ({
    quantity: item.qty,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
      },
    },
  }));

const validateCheckoutPayload = (payload, expectedPaymentMethod) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    totalPrice,
  } = payload;

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new AppError('No order items', 400, 'VALIDATION_ERROR');
  }
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    throw new AppError('Missing shipping address', 400, 'VALIDATION_ERROR');
  }
  if (paymentMethod !== expectedPaymentMethod) {
    throw new AppError(`Invalid payment method for ${expectedPaymentMethod}`, 400, 'VALIDATION_ERROR');
  }
  if (itemsPrice === undefined || totalPrice === undefined) {
    throw new AppError('Missing order totals', 400, 'VALIDATION_ERROR');
  }

  const requiredShipping = ['address', 'city', 'postalCode', 'country'];
  for (const field of requiredShipping) {
    if (!shippingAddress[field]) {
      throw new AppError(`Missing shipping address field: ${field}`, 400, 'VALIDATION_ERROR');
    }
  }
};

const getPaypalBaseUrl = () => process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';
const getRazorpayCurrency = () => process.env.RAZORPAY_CURRENCY || 'INR';

const getPaypalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new AppError('PayPal is not configured on the server', 500, 'PAYPAL_NOT_CONFIGURED');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new AppError('Failed to authenticate with PayPal', 502, 'PAYPAL_AUTH_FAILED');
  }

  const data = await response.json();
  return data.access_token;
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new AppError('Razorpay is not configured on the server', 500, 'RAZORPAY_NOT_CONFIGURED');
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  validateCheckoutPayload(req.body, 'stripe');

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: 'stripe',
    itemsPrice,
    taxPrice: taxPrice ?? 0,
    shippingPrice: shippingPrice ?? 0,
    totalPrice,
  });

  const stripe = getStripeClient();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${clientUrl}/checkout/result?stripe=success&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/checkout/result?stripe=cancel&orderId=${order._id}`,
    customer_email: req.user.email,
    line_items: buildStripeLineItems(orderItems),
    metadata: {
      orderId: String(order._id),
      userId: String(req.user._id),
    },
  });
  if (!session.url) {
    throw new AppError('Stripe checkout session URL was not returned', 502, 'STRIPE_SESSION_INVALID');
  }

  order.stripeSessionId = session.id;
  await order.save();

  return res.status(201).json({ sessionId: session.id, url: session.url, orderId: order._id });
});

const confirmStripeCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId, sessionId } = req.body;
  if (!orderId || !sessionId) {
    throw new AppError('Missing Stripe confirmation parameters', 400, 'VALIDATION_ERROR');
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to confirm this order', 403, 'FORBIDDEN');
  }
  if (order.paymentMethod !== 'stripe') {
    throw new AppError('Order is not a Stripe order', 400, 'ORDER_STATE_INVALID');
  }
  if (order.isPaid) {
    return res.json(order);
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== 'paid') {
    throw new AppError('Stripe payment is not completed yet', 400, 'STRIPE_PAYMENT_INCOMPLETE');
  }
  const sessionOrderId = session.metadata?.orderId;
  if (sessionOrderId && sessionOrderId !== String(order._id)) {
    throw new AppError('Stripe session does not match this order', 400, 'ORDER_STATE_INVALID');
  }

  order.markAsPaid(new Date());
  order.stripeSessionId = sessionId;
  order.paymentResult = {
    provider: 'stripe',
    sessionId,
    paymentIntentId: session.payment_intent ?? undefined,
    eventId: session.id,
  };
  const updatedOrder = await order.save();

  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [], itemsPrice: 0, totalPrice: 0 } });

  return res.json(updatedOrder);
});

const createPaypalOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  validateCheckoutPayload(req.body, 'paypal');

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: 'paypal',
    itemsPrice,
    taxPrice: taxPrice ?? 0,
    shippingPrice: shippingPrice ?? 0,
    totalPrice,
  });

  const accessToken = await getPaypalAccessToken();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: String(order._id),
          amount: {
            currency_code: 'USD',
            value: Number(totalPrice).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${clientUrl}/checkout/result?paypal=success&orderId=${order._id}`,
        cancel_url: `${clientUrl}/checkout/result?paypal=cancel&orderId=${order._id}`,
        shipping_preference: 'SET_PROVIDED_ADDRESS',
      },
    }),
  });

  if (!response.ok) {
    throw new AppError('Failed to create PayPal order', 502, 'PAYPAL_CREATE_ORDER_FAILED');
  }

  const paypalOrder = await response.json();
  const approvalUrl =
    paypalOrder.links?.find((link) => link.rel === 'approve')?.href ??
    paypalOrder.links?.find((link) => link.rel === 'payer-action')?.href;
  if (!approvalUrl) {
    throw new AppError('PayPal approval URL not found', 502, 'PAYPAL_CREATE_ORDER_FAILED');
  }

  order.paypalOrderId = paypalOrder.id;
  await order.save();

  return res.status(201).json({ orderId: order._id, paypalOrderId: paypalOrder.id, approvalUrl });
});

const capturePaypalOrder = asyncHandler(async (req, res) => {
  const { paypalOrderId, orderId } = req.body;
  if (!paypalOrderId || !orderId) {
    throw new AppError('Missing order capture parameters', 400, 'VALIDATION_ERROR');
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to capture this order', 403, 'FORBIDDEN');
  }
  if (order.paymentMethod !== 'paypal') {
    throw new AppError('Order is not a PayPal order', 400, 'ORDER_STATE_INVALID');
  }
  if (order.isPaid) {
    return res.json(order);
  }
  if (order.paypalOrderId && order.paypalOrderId !== paypalOrderId) {
    throw new AppError('PayPal order mismatch', 400, 'ORDER_STATE_INVALID');
  }

  const accessToken = await getPaypalAccessToken();
  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new AppError('Failed to capture PayPal order', 502, 'PAYPAL_CAPTURE_FAILED');
  }

  const capture = await response.json();
  if (capture.status !== 'COMPLETED') {
    throw new AppError('PayPal order was not completed', 400, 'PAYPAL_CAPTURE_INCOMPLETE');
  }

  order.markAsPaid(new Date());
  order.paypalOrderId = paypalOrderId;
  order.paymentResult = {
    provider: 'paypal',
    sessionId: paypalOrderId,
    paymentIntentId: capture.id,
    eventId: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id,
  };
  const updatedOrder = await order.save();

  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [], itemsPrice: 0, totalPrice: 0 } });

  return res.json(updatedOrder);
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  validateCheckoutPayload(req.body, 'razorpay');

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: 'razorpay',
    itemsPrice,
    taxPrice: taxPrice ?? 0,
    shippingPrice: shippingPrice ?? 0,
    totalPrice,
  });

  const currency = getRazorpayCurrency();
  const amount = Math.round(Number(totalPrice) * 100);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Invalid Razorpay amount', 400, 'VALIDATION_ERROR');
  }

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency,
    receipt: String(order._id),
    notes: {
      orderId: String(order._id),
      userId: String(req.user._id),
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return res.status(201).json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    customer: {
      name: req.user.name,
      email: req.user.email,
    },
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Missing Razorpay verification parameters', 400, 'VALIDATION_ERROR');
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to verify this order', 403, 'FORBIDDEN');
  }
  if (order.paymentMethod !== 'razorpay') {
    throw new AppError('Order is not a Razorpay order', 400, 'ORDER_STATE_INVALID');
  }
  if (order.isPaid) {
    return res.json(order);
  }
  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    throw new AppError('Razorpay order mismatch', 400, 'ORDER_STATE_INVALID');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    throw new AppError('Razorpay is not configured on the server', 500, 'RAZORPAY_NOT_CONFIGURED');
  }
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expectedSignature !== razorpaySignature) {
    throw new AppError('Invalid Razorpay payment signature', 400, 'RAZORPAY_SIGNATURE_INVALID');
  }

  order.markAsPaid(new Date());
  order.razorpayOrderId = razorpayOrderId;
  order.paymentResult = {
    provider: 'razorpay',
    sessionId: razorpayOrderId,
    paymentIntentId: razorpayPaymentId,
    eventId: razorpaySignature,
  };
  const updatedOrder = await order.save();

  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [], itemsPrice: 0, totalPrice: 0 } });

  return res.json(updatedOrder);
});

const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError('Stripe webhook secret is missing', 500, 'STRIPE_NOT_CONFIGURED');
    }

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session?.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.markAsPaid(new Date());
          order.paymentResult = {
            provider: 'stripe',
            sessionId: session.id,
            paymentIntentId: session.payment_intent ?? undefined,
            eventId: event.id,
          };
          await order.save();
          await Cart.findOneAndUpdate(
            { user: order.user },
            { $set: { items: [], itemsPrice: 0, totalPrice: 0 } }
          );
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  createPaypalOrder,
  capturePaypalOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleStripeWebhook,
};
