import { IconLocalOffer, IconPayments } from '../icons/storefront';

export const OfferBanners = () => {
  return (
    <section className="py-8 md:py-10">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex gap-4 rounded-2xl border border-red-200/80 bg-red-50/80 p-5">
            <div className="flex shrink-0 rounded-xl bg-red-600 p-3 text-white">
              <IconLocalOffer />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-extrabold text-slate-900">Extra 10% off with ShopSphere Pay</p>
              <p className="text-sm text-slate-600">
                On orders above $50. Limited period. T&amp;C apply.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
            <div className="flex shrink-0 rounded-xl bg-primary p-3 text-white">
              <IconPayments />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-extrabold text-slate-900">No-cost EMI on select cards</p>
              <p className="text-sm text-slate-600">
                3 &amp; 6 month plans on bestsellers. Checkout for eligible items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
