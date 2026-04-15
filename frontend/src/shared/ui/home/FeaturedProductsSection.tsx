import type { Product } from '../../../features/catalog/types';
import { ProductCard } from '../ProductCard';
import { PageLoader } from '../system/Loader';

type FeaturedProductsSectionProps = {
  title?: string;
  products: Product[];
  isLoading: boolean;
  onAddToCart: (productId: string) => void;
  addingProductId?: string | null;
};

export const FeaturedProductsSection = ({
  title = 'Featured for you',
  products,
  isLoading,
  onAddToCart,
  addingProductId,
}: FeaturedProductsSectionProps) => {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        <h2 className="mb-6 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
          {title}
        </h2>
        {isLoading ? (
          <PageLoader message="Loading products…" fullViewport={false} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => onAddToCart(product._id)}
                addToCartLoading={addingProductId === product._id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
