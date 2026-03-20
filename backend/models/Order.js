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
      enum: ['stripe', 'paypal', 'cod'],
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
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
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

