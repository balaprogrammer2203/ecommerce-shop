export type Order = {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems?: Array<{
    product?: string;
    name: string;
    qty: number;
    price: number;
    image?: string;
  }>;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
  paymentResult?: {
    provider?: string;
    sessionId?: string;
    paymentIntentId?: string;
    eventId?: string;
  };
  stripeSessionId?: string;
  paypalOrderId?: string;
  razorpayOrderId?: string;
  delivery?: {
    currentStatus?:
      | 'order_placed'
      | 'payment_pending'
      | 'payment_confirmed'
      | 'payment_failed'
      | 'processing'
      | 'packed'
      | 'ready_to_ship'
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
      // legacy
      | 'pending'
      | 'delivery_failed'
      | 'rescheduled'
      | 'return_initiated'
      | 'refunded';
    subStatus?: string;
    courierDetails?: {
      partner?: string;
      trackingId?: string;
      trackingUrl?: string;
      estimatedDeliveryAt?: string;
    };
    trackingLogs?: Array<{
      timestamp?: string;
      status: string;
      subStatus?: string;
      description?: string;
      actor?: 'system' | 'admin' | 'courier';
    }>;
    deliveryAttempts?: Array<{
      attemptedAt?: string;
      outcome: string;
      notes?: string;
    }>;
    returnRequested?: boolean;
    refundRequested?: boolean;
  };
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateOrderPayload = {
  orderItems: Array<{
    product: string;
    name: string;
    qty: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
};

export type StripeCheckoutSessionResponse = {
  sessionId: string;
  url: string;
  orderId: string;
};

export type PaypalCreateOrderResponse = {
  orderId: string;
  paypalOrderId: string;
  approvalUrl: string;
};

export type PaypalCapturePayload = {
  orderId: string;
  paypalOrderId: string;
};

export type StripeConfirmPayload = {
  orderId: string;
  sessionId: string;
};

export type RazorpayCreateOrderResponse = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customer: {
    name?: string;
    email?: string;
  };
};

export type RazorpayVerifyPayload = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};
