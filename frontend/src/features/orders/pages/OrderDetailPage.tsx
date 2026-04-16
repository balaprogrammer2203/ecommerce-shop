import { Link, useParams } from 'react-router-dom';

import { useOrderDetailQuery } from '../api/ordersApi';

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: order,
    isLoading,
    isError,
  } = useOrderDetailQuery(orderId ?? '', {
    skip: !orderId,
  });

  if (!orderId) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
      >
        Invalid order id.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
        >
          Failed to load this order.
        </div>
        <Link to="/account/orders" className="text-sm font-semibold text-primary hover:underline">
          Back to my orders
        </Link>
      </div>
    );
  }

  const address = order.shippingAddress;
  const items = order.orderItems ?? [];
  const paymentMethod = order.paymentMethod;
  const itemsPrice = order.itemsPrice;
  const shippingPrice = order.shippingPrice;
  const taxPrice = order.taxPrice;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Order details</h2>
        <Link to="/account/orders" className="text-sm font-semibold text-primary hover:underline">
          Back to my orders
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Order ID</p>
        <p className="mt-1 break-all font-mono text-sm text-slate-700">{order._id}</p>
        <p className="mt-3 text-sm text-slate-600">
          Placed: {new Date(order.createdAt).toLocaleString()}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Status</h3>
        <p className="mt-2 text-sm text-slate-700">Paid: {order.isPaid ? 'Yes' : 'No'}</p>
        <p className="text-sm text-slate-700">Delivered: {order.isDelivered ? 'Yes' : 'No'}</p>
        {paymentMethod ? (
          <p className="mt-2 text-sm text-slate-700">Payment method: {paymentMethod}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Shipping address</h3>
        {address ? (
          <div className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {address.address}
            {'\n'}
            {[address.city, address.postalCode].filter(Boolean).join(', ')}
            {'\n'}
            {address.country}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No shipping address available.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Items</h3>
        {items.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {items.map((item, idx) => (
              <li
                key={`${item.product ?? item.name ?? 'item'}-${idx}`}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="text-slate-700">
                  {item.name ?? 'Item'} x {item.qty ?? 0}
                </span>
                <span className="font-semibold text-slate-900">
                  ${((item.price ?? 0) * (item.qty ?? 0)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No order items available.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Totals</h3>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Items</dt>
            <dd className="font-semibold text-slate-900">${(itemsPrice ?? 0).toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Shipping</dt>
            <dd className="font-semibold text-slate-900">${(shippingPrice ?? 0).toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Tax</dt>
            <dd className="font-semibold text-slate-900">${(taxPrice ?? 0).toFixed(2)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <dt className="font-bold text-slate-900">Total</dt>
            <dd className="font-bold text-slate-900">${order.totalPrice.toFixed(2)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};
