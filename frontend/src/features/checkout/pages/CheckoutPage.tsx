import { FormEvent, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/system/Button';
import { Input } from '../../../shared/ui/system/Input';
import { useClearCartMutation, useMyCartQuery } from '../../cart/api/cartApi';
import {
  useCreateOrderMutation,
  useCreatePaypalOrderMutation,
  useCreateRazorpayOrderMutation,
  useCreateStripeCheckoutSessionMutation,
  useVerifyRazorpayPaymentMutation,
} from '../../orders/api/ordersApi';

const SHIPPING_FLAT = 5.99;
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;

type Phase = 'shipping' | 'payment' | 'success';
type RazorpayWindow = Window &
  typeof globalThis & {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill?: { name?: string; email?: string };
      notes?: Record<string, string>;
      theme?: { color?: string };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
    }) => { open: () => void };
  };

const steps: { id: Phase | 'done'; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Review & pay' },
  { id: 'done', label: 'Confirmation' },
];

const ensureRazorpayScript = async (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as RazorpayWindow).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError, error } = useMyCartQuery();
  const [createOrder, { isLoading: isPlacing }] = useCreateOrderMutation();
  const [createStripeCheckoutSession, { isLoading: isStripeRedirecting }] =
    useCreateStripeCheckoutSessionMutation();
  const [createPaypalOrder, { isLoading: isPaypalRedirecting }] = useCreatePaypalOrderMutation();
  const [createRazorpayOrder, { isLoading: isRazorpayCreating }] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment, { isLoading: isRazorpayVerifying }] =
    useVerifyRazorpayPaymentMutation();
  const [clearCart] = useClearCartMutation();

  const [phase, setPhase] = useState<Phase>('shipping');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'razorpay' | 'cod'>(
    'cod',
  );

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);
  const itemsPrice = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items],
  );
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;
  const isRazorpay = paymentMethod === 'razorpay';
  const activeCurrency = isRazorpay ? 'INR' : 'USD';
  const formatPrice = (value: number): string =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: activeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const shippingValid =
    fullName.trim().length > 1 &&
    addressLine.trim().length > 3 &&
    city.trim().length > 1 &&
    postalCode.trim().length > 2 &&
    country.trim().length > 1;

  const addressBlock = useMemo(() => {
    const line = addressLine.trim();
    if (!fullName.trim()) return line;
    return `${fullName.trim()}\n${line}`;
  }, [fullName, addressLine]);

  const handlePlaceOrder = async () => {
    setSubmitError(null);
    if (!shippingValid || !items.length) return;

    const orderItems = items.map((it) => ({
      product: it.id,
      name: it.name,
      qty: it.quantity,
      price: it.price,
    }));

    const payload = {
      orderItems,
      shippingAddress: {
        address: addressBlock,
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } as const;

    try {
      if (paymentMethod === 'stripe') {
        const session = await createStripeCheckoutSession(payload).unwrap();
        window.location.assign(session.url);
        return;
      }

      if (paymentMethod === 'paypal') {
        const approval = await createPaypalOrder(payload).unwrap();
        window.location.assign(approval.approvalUrl);
        return;
      }

      if (paymentMethod === 'razorpay') {
        const sdkLoaded = await ensureRazorpayScript();
        if (!sdkLoaded) {
          setSubmitError('Razorpay SDK failed to load. Check your connection and try again.');
          return;
        }

        const rzOrder = await createRazorpayOrder(payload).unwrap();
        const Razorpay = (window as RazorpayWindow).Razorpay;
        if (!Razorpay) {
          setSubmitError('Razorpay SDK is unavailable. Please retry.');
          return;
        }

        const razorpay = new Razorpay({
          key: rzOrder.keyId,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          name: 'Ecommerce Shop',
          description: 'Order payment',
          order_id: rzOrder.razorpayOrderId,
          prefill: {
            name: rzOrder.customer?.name,
            email: rzOrder.customer?.email,
          },
          notes: { orderId: rzOrder.orderId },
          theme: { color: '#2563eb' },
          modal: {
            ondismiss: () => {
              setSubmitError('Razorpay payment was canceled.');
            },
          },
          handler: (response) => {
            void (async () => {
              try {
                const verifiedOrder = await verifyRazorpayPayment({
                  orderId: rzOrder.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }).unwrap();
                setPlacedOrderId(verifiedOrder._id);
                setPhase('success');
              } catch (verifyErr) {
                const verifyMessage =
                  (verifyErr as { data?: { error?: { message?: string }; message?: string } })?.data
                    ?.error?.message ||
                  (verifyErr as { data?: { error?: { message?: string }; message?: string } })?.data
                    ?.message;
                setSubmitError(verifyMessage || 'Razorpay payment verification failed.');
              }
            })();
          },
        });

        razorpay.open();
        return;
      }

      const order = await createOrder(payload).unwrap();

      setPlacedOrderId(order._id);
      setPhase('success');
      try {
        await clearCart().unwrap();
      } catch {
        // Cart may already be empty; order is still confirmed.
      }
    } catch (err) {
      const apiMessage =
        (err as { data?: { error?: { message?: string }; message?: string } })?.data?.error
          ?.message ||
        (err as { data?: { error?: { message?: string }; message?: string } })?.data?.message;
      setSubmitError(
        paymentMethod === 'stripe'
          ? apiMessage || 'Could not start Stripe checkout. Please try again.'
          : paymentMethod === 'paypal'
            ? apiMessage || 'Could not start PayPal checkout. Please try again.'
            : paymentMethod === 'razorpay'
              ? apiMessage || 'Could not start Razorpay checkout. Please try again.'
              : apiMessage || 'We could not place your order. Check your connection and try again.',
      );
    }
  };

  const activeProgressIndex = phase === 'shipping' ? 0 : phase === 'payment' ? 1 : -1;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex justify-center py-20">
          <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isError) {
    const msg =
      (error as { data?: { message?: string }; status?: number })?.status === 401
        ? 'Please sign in again to continue checkout.'
        : 'Could not load your cart.';
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {msg}
        </div>
        <div className="mt-6">
          <Button shopVariant="primary" to="/cart">
            Back to cart
          </Button>
        </div>
      </div>
    );
  }

  if (!items.length && phase !== 'success') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Checkout</h1>
        <p className="mt-3 text-slate-600">Your cart is empty. Add items before checking out.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button shopVariant="primary" to="/">
            Continue shopping
          </Button>
          <Button shopVariant="secondary" to="/cart">
            View cart
          </Button>
        </div>
      </div>
    );
  }

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
          <li>
            <RouterLink to="/cart" className="text-primary no-underline hover:underline">
              Cart
            </RouterLink>
          </li>
          <li className="text-slate-400" aria-hidden>
            /
          </li>
          <li className="font-medium text-slate-900" aria-current="page">
            Checkout
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Secure checkout — review your bag, enter shipping, then confirm payment.
      </p>

      {/* Progress */}
      <ol
        className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4"
        aria-label="Checkout steps"
      >
        {steps.map((s, i) => {
          const done = phase === 'success' || (activeProgressIndex >= 0 && i < activeProgressIndex);
          const active = phase !== 'success' && i === activeProgressIndex;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-bold',
                  done && 'bg-emerald-600 text-white',
                  active && 'bg-primary text-white',
                  !done && !active && 'border border-slate-300 bg-white text-slate-500',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  active || done ? 'text-slate-900' : 'text-slate-500',
                )}
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

      {phase === 'success' ? (
        <div className="mt-10 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-emerald-950">Thank you for your order</h2>
          <p className="mt-2 text-sm text-emerald-900">
            Your order has been received. You will receive an email confirmation shortly (demo — no
            email is sent).
          </p>
          {placedOrderId ? (
            <p className="mt-3 font-mono text-sm text-emerald-950">
              Order ID: <span className="font-semibold">{placedOrderId}</span>
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {placedOrderId ? (
              <Button shopVariant="primary" to={`/account/orders/${placedOrderId}`}>
                View order details
              </Button>
            ) : null}
            <Button shopVariant="primary" to="/account/orders">
              View my orders
            </Button>
            <Button shopVariant="secondary" onClick={() => navigate('/')}>
              Continue shopping
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="flex flex-col gap-6">
            {phase === 'shipping' ? (
              <form
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  if (shippingValid) setPhase('payment');
                }}
              >
                <h2 className="text-lg font-bold text-slate-900">Shipping details</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Where should we deliver this order? All fields are required.
                </p>
                <div className="mt-5 flex flex-col gap-4">
                  <Input
                    label="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                  <Input
                    label="Street address"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    autoComplete="street-address"
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      required
                    />
                    <Input
                      label="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      autoComplete="postal-code"
                      required
                    />
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-slate-800">Country</span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary"
                      autoComplete="country-name"
                    >
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                      <option value="GBR">United Kingdom</option>
                      <option value="IND">India</option>
                      <option value="AUS">Australia</option>
                    </select>
                  </label>
                </div>
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Button shopVariant="ghost" type="button" to="/cart">
                    Back to cart
                  </Button>
                  <Button shopVariant="primary" type="submit" disabled={!shippingValid}>
                    Continue to payment
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Review & pay</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose a payment method and place your order. Demo store: use Cash on Delivery for
                  the simplest path.
                </p>

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Ship to</p>
                  <p className="mt-2 whitespace-pre-line">{addressBlock}</p>
                  <p className="mt-2">
                    {city}, {postalCode}
                  </p>
                  <p>{country}</p>
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-primary hover:underline"
                    onClick={() => setPhase('shipping')}
                  >
                    Edit shipping
                  </button>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm font-bold text-slate-900">Payment method</legend>
                  <div className="mt-3 flex flex-col gap-2">
                    {(
                      [
                        {
                          id: 'cod' as const,
                          label: 'Cash on delivery',
                          hint: 'Pay when your order arrives.',
                        },
                        {
                          id: 'stripe' as const,
                          label: 'Card (Stripe)',
                          hint: 'Secure hosted card checkout.',
                        },
                        {
                          id: 'paypal' as const,
                          label: 'PayPal',
                          hint: 'Pay with your PayPal account.',
                        },
                        {
                          id: 'razorpay' as const,
                          label: 'Razorpay (India)',
                          hint: 'UPI, cards, netbanking and wallets.',
                        },
                      ] as const
                    ).map((opt) => (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition',
                          paymentMethod === opt.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.id}
                          checked={paymentMethod === opt.id}
                          onChange={() => setPaymentMethod(opt.id)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block font-semibold text-slate-900">{opt.label}</span>
                          <span className="block text-xs text-slate-600">{opt.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {submitError ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                  >
                    {submitError}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Button shopVariant="ghost" type="button" onClick={() => setPhase('shipping')}>
                    Back
                  </Button>
                  <Button
                    shopVariant="primary"
                    type="button"
                    loading={
                      isPlacing ||
                      isStripeRedirecting ||
                      isPaypalRedirecting ||
                      isRazorpayCreating ||
                      isRazorpayVerifying
                    }
                    disabled={
                      isPlacing ||
                      isStripeRedirecting ||
                      isPaypalRedirecting ||
                      isRazorpayCreating ||
                      isRazorpayVerifying
                    }
                    onClick={() => void handlePlaceOrder()}
                  >
                    {paymentMethod === 'stripe'
                      ? `Continue to Stripe · ${formatPrice(totalPrice)}`
                      : paymentMethod === 'paypal'
                        ? `Continue to PayPal · ${formatPrice(totalPrice)}`
                        : paymentMethod === 'razorpay'
                          ? `Pay with Razorpay · ${formatPrice(totalPrice)}`
                          : `Place order · ${formatPrice(totalPrice)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-slate-900">Order summary</h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-auto pr-1">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 text-slate-700">
                    <span className="font-medium text-slate-900">{it.name}</span>
                    <span className="text-slate-500"> × {it.quantity}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {formatPrice(it.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatPrice(itemsPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="font-semibold text-slate-900">
                  {shippingPrice === 0 ? (
                    <span className="text-emerald-700">Free</span>
                  ) : (
                    formatPrice(shippingPrice)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Estimated tax ({Math.round(TAX_RATE * 100)}%)</dt>
                <dd className="font-semibold text-slate-900">{formatPrice(taxPrice)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-black text-primary">{formatPrice(totalPrice)}</dd>
              </div>
            </dl>
            {itemsPrice < FREE_SHIPPING_THRESHOLD ? (
              <p className="mt-3 text-xs text-slate-500">
                Add{' '}
                <strong>{formatPrice(Math.max(0, FREE_SHIPPING_THRESHOLD - itemsPrice))}</strong>{' '}
                more for free shipping on this order.
              </p>
            ) : (
              <p className="mt-3 text-xs font-medium text-emerald-700">
                You qualify for free shipping.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
