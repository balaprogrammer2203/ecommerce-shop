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
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
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
