import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '../../../shared/ui/system/Button';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  useClearCartMutation,
  useMyCartQuery,
  useRemoveCartItemMutation as useRemoveCartItemApiMutation,
  useUpdateCartItemQtyMutation,
} from '../api/cartApi';
import {
  clearCart as clearGuestCart,
  removeItem as removeGuestItem,
  updateQuantity,
} from '../slices/cartSlice';

export const CartPage = () => {
  const SHIPPING_FLAT = 5.99;
  const TAX_RATE = 0.08;
  const FREE_SHIPPING_THRESHOLD = 50;

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const guestItems = useAppSelector((state) => state.cart.items);
  const { data, isLoading, isError, error } = useMyCartQuery(undefined, { skip: !isAuthenticated });
  const [updateQty] = useUpdateCartItemQtyMutation();
  const [removeCartItem] = useRemoveCartItemApiMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const maybeStatus = (error as { status?: number } | undefined)?.status;
  const isAuthError = maybeStatus === 401;
  const items = useMemo(
    () => (isAuthenticated ? (data?.items ?? []) : guestItems),
    [data?.items, guestItems, isAuthenticated],
  );
  const itemsPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const shippingPrice =
    itemsPrice <= 0 ? 0 : itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const estimatedTotal = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

  const steps: { id: 'cart' | 'checkout' | 'confirmation'; label: string }[] = [
    { id: 'cart', label: 'Cart' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'confirmation', label: 'Confirmation' },
  ];
  const activeStepIndex = 1; // Cart is done, Checkout is active.

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
      <nav className="mb-6 text-xs text-slate-600 sm:text-sm" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <RouterLink to="/" className="text-primary no-underline hover:underline">
              Home
            </RouterLink>
          </li>
          <li className="text-slate-400" aria-hidden>
            /
          </li>
          <li className="font-medium text-slate-900" aria-current="page">
            Cart
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review your items, adjust quantities, then proceed to checkout.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isAuthenticated && isError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
          >
            {isAuthError ? 'Please login to view your cart.' : 'Failed to load cart.'}
          </div>
        ) : (
          <>
            {/* Progress */}
            <ol
              className="mt-2 flex flex-wrap gap-2 border-b border-slate-200 pb-4"
              aria-label="Checkout steps"
            >
              {steps.map((s, i) => {
                const done = i < activeStepIndex;
                const active = i === activeStepIndex;
                return (
                  <li key={s.id} className="flex items-center gap-2">
                    <span
                      className={[
                        'flex size-8 items-center justify-center rounded-full text-xs font-bold',
                        done ? 'bg-emerald-600 text-white' : '',
                        active ? 'bg-primary text-white' : '',
                        !done && !active ? 'border border-slate-300 bg-white text-slate-500' : '',
                      ].join(' ')}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={
                        active || done
                          ? 'text-sm font-semibold text-slate-900'
                          : 'text-sm font-semibold text-slate-500'
                      }
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 ? (
                      <span className="hidden px-1 text-slate-300 sm:inline" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {items.length ? (
                    <div className="flex flex-col gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                              <img
                                src={
                                  item.image ||
                                  'https://dummyimage.com/88x88/e2e8f0/64748b&text=Item'
                                }
                                alt={item.name}
                                className="size-20 rounded-xl border border-slate-200 bg-white object-cover"
                              />
                              <div className="flex flex-col gap-0.5">
                                <p className="font-semibold text-slate-900">{item.name}</p>
                                <p className="text-sm text-slate-600">
                                  ${item.price.toFixed(2)} each
                                </p>
                                <p className="text-sm font-semibold text-slate-900">
                                  Line total: ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end md:gap-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  shopVariant="secondary"
                                  size="small"
                                  onClick={() => {
                                    if (item.quantity <= 1) {
                                      if (isAuthenticated) {
                                        void removeCartItem({ productId: item.id });
                                      } else {
                                        dispatch(removeGuestItem(item.id));
                                      }
                                    } else {
                                      if (isAuthenticated) {
                                        void updateQty({
                                          productId: item.id,
                                          qty: item.quantity - 1,
                                        });
                                      } else {
                                        dispatch(
                                          updateQuantity({
                                            id: item.id,
                                            quantity: item.quantity - 1,
                                          }),
                                        );
                                      }
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
                                  onClick={() => {
                                    if (isAuthenticated) {
                                      void updateQty({
                                        productId: item.id,
                                        qty: item.quantity + 1,
                                      });
                                    } else {
                                      dispatch(
                                        updateQuantity({
                                          id: item.id,
                                          quantity: item.quantity + 1,
                                        }),
                                      );
                                    }
                                  }}
                                >
                                  +
                                </Button>
                              </div>

                              <Button
                                shopVariant="ghost"
                                size="small"
                                onClick={() => {
                                  if (isAuthenticated) {
                                    void removeCartItem({ productId: item.id });
                                  } else {
                                    dispatch(removeGuestItem(item.id));
                                  }
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6">
                      <p className="text-slate-600">Your cart is empty.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Button
                    shopVariant="secondary"
                    size="large"
                    disabled={!items.length || (isAuthenticated && isClearing)}
                    onClick={() => {
                      if (isAuthenticated) {
                        void clearCart();
                      } else {
                        dispatch(clearGuestCart());
                      }
                    }}
                  >
                    Clear cart
                  </Button>
                  <Button
                    to={isAuthenticated ? '/checkout' : '/login'}
                    state={isAuthenticated ? undefined : { from: { pathname: '/checkout' } }}
                    shopVariant="primary"
                    size="large"
                    disabled={!items.length}
                  >
                    {isAuthenticated ? 'Proceed to checkout' : 'Login to checkout'}
                  </Button>
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-slate-900">Order summary</h2>
                <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Subtotal</dt>
                    <dd className="font-semibold text-slate-900">${itemsPrice.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">
                      Estimated tax ({Math.round(TAX_RATE * 100)}%)
                    </dt>
                    <dd className="font-semibold text-slate-900">${taxPrice.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Shipping</dt>
                    <dd className="font-semibold text-slate-900">
                      {shippingPrice === 0 ? (
                        <span className="text-emerald-700">Free</span>
                      ) : (
                        `$${shippingPrice.toFixed(2)}`
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                    <dt className="font-bold text-slate-900">Estimated total</dt>
                    <dd className="font-black text-primary">${estimatedTotal.toFixed(2)}</dd>
                  </div>
                </dl>
                {itemsPrice < FREE_SHIPPING_THRESHOLD ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Add{' '}
                    <strong>${Math.max(0, FREE_SHIPPING_THRESHOLD - itemsPrice).toFixed(2)}</strong>{' '}
                    more for free shipping.
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-emerald-700">
                    You qualify for free shipping.
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
