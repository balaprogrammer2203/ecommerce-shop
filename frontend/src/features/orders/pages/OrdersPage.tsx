import { useMyOrdersQuery } from '../api/ordersApi';

export const OrdersPage = () => {
  const { data, isLoading, isError } = useMyOrdersQuery();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-slate-900">Recent orders</h2>
      {isLoading ? (
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
        >
          Failed to load orders.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data && data.length > 0 ? (
            data.map((order) => (
              <article
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-0.5 text-sm">
                  <p className="font-semibold text-slate-900">Order #{order._id.slice(-6)}</p>
                  <p className="text-slate-600">
                    Total: ${order.totalPrice.toFixed(2)} • Paid: {order.isPaid ? 'Yes' : 'No'} •
                    Delivered: {order.isDelivered ? 'Yes' : 'No'}
                  </p>
                  <p className="text-slate-600">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-slate-600">No orders yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
