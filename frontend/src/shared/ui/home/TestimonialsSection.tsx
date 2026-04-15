import { IconFormatQuote } from '../icons/storefront';

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Verified buyer',
    quote: 'Delivery was fast and packaging was perfect. Great prices compared to other sites.',
    initials: 'P',
  },
  {
    name: 'James L.',
    role: 'Prime member',
    quote: 'Easy returns and helpful support. I order electronics here regularly now.',
    initials: 'J',
  },
  {
    name: 'Anita R.',
    role: 'Fashion shopper',
    quote: 'Love the filters and photos. Checkout is smooth on mobile too.',
    initials: 'A',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
          Customers love ShopSphere
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <IconFormatQuote
                className="pointer-events-none absolute right-4 top-3 text-slate-400"
                size={36}
              />
              <div className="flex flex-col gap-4">
                <p className="pr-6 text-sm leading-relaxed text-slate-600 md:text-base">
                  “{t.quote}”
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
