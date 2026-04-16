import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '../../../shared/ui/system/Button';
import {
  useCapturePaypalOrderMutation,
  useConfirmStripeCheckoutSessionMutation,
} from '../../orders/api/ordersApi';

type ResultState = 'loading' | 'success' | 'failure' | 'cancel';

export const CheckoutResultPage = () => {
  const location = useLocation();
  const [confirmStripeCheckoutSession] = useConfirmStripeCheckoutSessionMutation();
  const [capturePaypalOrder] = useCapturePaypalOrderMutation();
  const [state, setState] = useState<ResultState>('loading');
  const [message, setMessage] = useState('Confirming your payment...');
  const [orderId, setOrderId] = useState<string | null>(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const stripeStatus = params.get('stripe');
  const stripeSessionId = params.get('session_id');
  const paypalStatus = params.get('paypal');
  const paypalToken = params.get('token');
  const callbackOrderId = params.get('orderId');

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!callbackOrderId) {
        setState('failure');
        setMessage('Missing order id in payment callback.');
        return;
      }
      setOrderId(callbackOrderId);

      if (stripeStatus === 'cancel' || paypalStatus === 'cancel') {
        setState('cancel');
        setMessage('Payment was canceled. Your order is not paid.');
        return;
      }

      try {
        if (stripeStatus === 'success' && stripeSessionId) {
          const order = await confirmStripeCheckoutSession({
            orderId: callbackOrderId,
            sessionId: stripeSessionId,
          }).unwrap();
          if (!active) return;
          setOrderId(order._id);
          setState('success');
          setMessage('Stripe payment confirmed successfully.');
          return;
        }

        if (paypalStatus === 'success' && paypalToken) {
          const order = await capturePaypalOrder({
            orderId: callbackOrderId,
            paypalOrderId: paypalToken,
          }).unwrap();
          if (!active) return;
          setOrderId(order._id);
          setState('success');
          setMessage('PayPal payment confirmed successfully.');
          return;
        }

        setState('failure');
        setMessage('Unsupported payment callback state.');
      } catch (err) {
        if (!active) return;
        const apiMessage =
          (err as { data?: { error?: { message?: string }; message?: string } })?.data?.error
            ?.message ||
          (err as { data?: { error?: { message?: string }; message?: string } })?.data?.message;
        setState('failure');
        setMessage(apiMessage || 'Payment confirmation failed. Please check your order status.');
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [
    callbackOrderId,
    capturePaypalOrder,
    confirmStripeCheckoutSession,
    paypalStatus,
    paypalToken,
    stripeSessionId,
    stripeStatus,
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Payment result</h1>
        <p className="mt-3 text-sm text-slate-700">{message}</p>

        {state === 'loading' ? (
          <div className="mt-6">
            <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {state === 'success' && orderId ? (
            <Button shopVariant="primary" to={`/account/orders/${orderId}`}>
              View order details
            </Button>
          ) : null}
          <Button shopVariant="secondary" to="/checkout">
            Back to checkout
          </Button>
          <Link to="/account/orders" className="text-sm font-semibold text-primary hover:underline">
            Go to my orders
          </Link>
        </div>
      </div>
    </div>
  );
};
