import { type FormEvent, useState } from 'react';

import { Button } from '../system/Button';
import { Input } from '../system/Input';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="border-t border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 py-10 md:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <h2 className="mb-2 text-lg font-extrabold text-slate-900">Deals in your inbox</h2>
            <p className="text-sm text-slate-600">
              Subscribe for launches, coupons, and curated picks. Unsubscribe anytime.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitted}
              className="sm:min-w-[260px]"
            />
            <Button
              type="submit"
              shopVariant="primary"
              disabled={submitted}
              className="min-w-[120px] shrink-0"
            >
              {submitted ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
