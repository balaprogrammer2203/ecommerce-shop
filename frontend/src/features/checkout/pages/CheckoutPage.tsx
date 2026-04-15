export const CheckoutPage = () => {
  return (
    <div className="mx-auto max-w-screen-lg px-4 py-6 sm:px-6 md:py-10">
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Shipping details</h2>
            <p className="text-sm text-slate-600">Address forms and validation live here.</p>
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Order summary</h2>
            <p className="text-sm text-slate-600">Cart totals, promos, and payment buttons.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
