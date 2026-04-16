export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Cart = {
  items: CartItem[];
  itemsPrice: number;
  totalPrice: number;
};
