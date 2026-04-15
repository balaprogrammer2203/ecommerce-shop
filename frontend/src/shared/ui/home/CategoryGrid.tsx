import { Link as RouterLink } from 'react-router-dom';

import { cn } from '../../lib/cn';
import { SHOP_CATEGORIES, type ShopCategoryDefinition } from '../../lib/shopCategories';

export type CategoryTile = Pick<ShopCategoryDefinition, 'slug' | 'title' | 'image'>;

type CategoryGridProps = {
  title?: string;
  items?: CategoryTile[];
};

export const CategoryGrid = ({
  title = 'Shop by category',
  items = SHOP_CATEGORIES.map(({ slug, title: t, image }) => ({ slug, title: t, image })),
}: CategoryGridProps) => {
  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6">
          {items.map(({ slug, title: label, image }) => (
            <RouterLink
              key={slug}
              to={`/category/${slug}`}
              aria-label={`Browse ${label}`}
              className={cn(
                'group relative block max-h-[200px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm aspect-square sm:max-h-[220px] md:max-h-[240px]',
                'text-white no-underline transition-all duration-300',
                'hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              )}
            >
              <div
                className="category-grid__media absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div
                className={cn(
                  'category-grid__overlay absolute inset-0 transition-colors duration-300',
                  'bg-gradient-to-b from-black/5 to-black/65 group-hover:from-black/15 group-hover:to-black/75',
                )}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <p
                  className="text-sm font-extrabold leading-snug drop-shadow-md sm:text-base"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
                >
                  {label}
                </p>
              </div>
            </RouterLink>
          ))}
        </div>
      </div>
    </section>
  );
};
