const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
    },
  },
  { _id: false }
);

const deliveryTrackingLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    status: { type: String, required: true, trim: true },
    subStatus: { type: String, trim: true },
    description: { type: String, trim: true },
    actor: { type: String, enum: ['system', 'admin', 'courier'], default: 'system' },
  },
  { _id: false }
);

const deliveryAttemptSchema = new mongoose.Schema(
  {
    attemptedAt: { type: Date, default: Date.now },
    outcome: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'razorpay', 'cod'],
      trim: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPrice: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentResult: {
      provider: { type: String },
      sessionId: { type: String },
      paymentIntentId: { type: String },
      eventId: { type: String },
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    paypalOrderId: {
      type: String,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    delivery: {
      currentStatus: {
        type: String,
        enum: [
          'order_placed',
          'payment_pending',
          'payment_confirmed',
          'payment_failed',
          'processing',
          'packed',
          'ready_to_ship',
          'shipped',
          'in_transit',
          'out_for_delivery',
          'delivered',
          'delivery_attempt_failed',
          'delivery_rescheduled',
          'delivery_exception',
          'cancelled',
          'return_requested',
          'return_approved',
          'return_pickup_scheduled',
          'return_picked_up',
          'return_in_transit',
          'return_received',
          'return_rejected',
          'refund_initiated',
          'refund_completed',
          // Legacy statuses kept for backward compatibility with existing data
          'pending',
          'delivery_failed',
          'rescheduled',
          'return_initiated',
          'refunded',
        ],
        default: 'order_placed',
      },
      subStatus: { type: String, trim: true },
      courierDetails: {
        partner: { type: String, trim: true },
        trackingId: { type: String, trim: true },
        trackingUrl: { type: String, trim: true },
        estimatedDeliveryAt: { type: Date },
      },
      trackingLogs: { type: [deliveryTrackingLogSchema], default: [] },
      deliveryAttempts: { type: [deliveryAttemptSchema], default: [] },
      returnRequested: { type: Boolean, default: false },
      refundRequested: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ isPaid: 1, paidAt: -1 });
orderSchema.index({ isDelivered: 1, deliveredAt: -1 });

orderSchema.methods.canMarkAsPaid = function canMarkAsPaid() {
  return !this.isPaid;
};

orderSchema.methods.canMarkAsDelivered = function canMarkAsDelivered() {
  return !this.isDelivered;
};

orderSchema.methods.markAsPaid = function markAsPaid(date = new Date()) {
  if (this.canMarkAsPaid()) {
    this.isPaid = true;
    this.paidAt = date;
  }
  return this;
};

orderSchema.methods.markAsDelivered = function markAsDelivered(date = new Date()) {
  if (this.canMarkAsDelivered()) {
    this.isDelivered = true;
    this.deliveredAt = date;
  }
  return this;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

