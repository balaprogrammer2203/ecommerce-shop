import { useMemo } from 'react';

import { Button } from '../../../shared/ui/system/Button';
import {
  useClearCartMutation,
  useMyCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemQtyMutation,
} from '../api/cartApi';

export const CartPage = () => {
  const { data, isLoading, isError, error } = useMyCartQuery();
  const [updateQty] = useUpdateCartItemQtyMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const totals = useMemo(() => {
    const itemsPrice = data?.itemsPrice ?? 0;
    const totalPrice = data?.totalPrice ?? itemsPrice;
    return { itemsPrice, totalPrice };
  }, [data]);

  const maybeStatus = (error as { status?: number } | undefined)?.status;
  const isAuthError = maybeStatus === 401;

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-6 sm:px-6 md:py-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
          >
            {isAuthError ? 'Please login to view your cart.' : 'Failed to load cart.'}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {data?.items?.length ? (
                <div className="flex flex-col gap-4">
                  {data.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">${item.price.toFixed(2)} each</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            shopVariant="secondary"
                            size="small"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                void removeItem({ productId: item.id });
                              } else {
                                void updateQty({ productId: item.id, qty: item.quantity - 1 });
                              }
                            }}
                          >
                            -
                          </Button>
                          <span className="w-9 text-center text-base font-bold">
                            {item.quantity}
                          </span>
                          <Button
                            shopVariant="secondary"
                            size="small"
                            onClick={() =>
                              void updateQty({ productId: item.id, qty: item.quantity + 1 })
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <hr className="border-slate-200" />

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-bold text-slate-900">
                        ${totals.itemsPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total</span>
                      <span className="font-bold text-slate-900">
                        ${totals.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600">Your cart is empty.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                shopVariant="secondary"
                size="large"
                disabled={!data?.items?.length || isClearing}
                onClick={() => {
                  void clearCart();
                }}
              >
                Clear cart
              </Button>
              <Button
                to="/checkout"
                shopVariant="primary"
                size="large"
                disabled={!data?.items?.length}
              >
                Proceed to checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
