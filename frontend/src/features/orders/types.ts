export type Order = {
  _id: string;
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
