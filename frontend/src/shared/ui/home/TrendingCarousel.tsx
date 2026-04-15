import { useRef } from 'react';

import type { Product } from '../../../features/catalog/types';
import { IconChevronLeft, IconChevronRight } from '../icons/storefront';
import { ProductCard } from '../ProductCard';

type TrendingCarouselProps = {
  title?: string;
  products: Product[];
  onAddToCart: (productId: string) => void;
  addingProductId?: string | null;
};

export const TrendingCarousel = ({
  title = 'Trending now',
  products,
  onAddToCart,
  addingProductId,
}: TrendingCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
            {title}
          </h2>
          <div className="flex gap-0.5">
            <button
              type="button"
              aria-label="Scroll trending left"
              onClick={() => scrollBy(-320)}
              className="inline-flex rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <IconChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Scroll trending right"
              onClick={() => scrollBy(320)}
              className="inline-flex rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-color:rgba(148,163,184,0.9)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => (
            <div key={product._id} className="w-[min(280px,85vw)] shrink-0 snap-start sm:w-[260px]">
              <ProductCard
                product={product}
                variant="compact"
                onAddToCart={() => onAddToCart(product._id)}
                addToCartLoading={addingProductId === product._id}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
