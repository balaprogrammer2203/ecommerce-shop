import { useMemo } from 'react';

import { useAppSelector } from '../../../app/hooks';

export const useCartTotals = () => {
  const items = useAppSelector((state) => state.cart.items);

  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [items]);
};
