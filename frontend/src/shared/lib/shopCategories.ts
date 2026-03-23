/** Minimal product fields used for category browse filtering. */
export type CategorizableProduct = {
  name: string;
  title?: string;
  description: string;
  category: string;
};

/** Storefront category tile (homepage grid + browse routing). */
export type ShopCategoryDefinition = {
  slug: string;
  title: string;
  /** Hero image for the category tile */
  image: string;
  /** When set, `/products` is queried with this L1 category slug (includes subtree) */
  apiCategorySlug?: string;
  /** Match `Product.category` exactly when set */
  exactCategory?: string;
  /** Fallback: match if any term appears in name or description */
  searchTerms?: string[];
};

/**
 * 8 browse categories — grid on home and `/category/:slug` filters.
 * Three align with seeded API categories; others use keyword matching (may be empty until catalog grows).
 */
export const SHOP_CATEGORIES: ShopCategoryDefinition[] = [
  {
    slug: 'electronics',
    title: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
    exactCategory: 'Electronics',
  },
  {
    slug: 'fashion',
    title: 'Fashion',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    exactCategory: 'Fashion',
  },
  {
    slug: 'home-kitchen',
    title: 'Home & Kitchen',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    exactCategory: 'Home & Kitchen',
  },
  {
    slug: 'sports',
    title: 'Sports & Outdoors',
    image:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    apiCategorySlug: 'sports-outdoors',
    searchTerms: ['sport', 'fitness', 'outdoor', 'running', 'gym', 'yoga'],
  },
  {
    slug: 'beauty',
    title: 'Beauty',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    apiCategorySlug: 'beauty-personal-care',
    searchTerms: ['beauty', 'cosmetic', 'skincare', 'makeup', 'fragrance'],
  },
  {
    slug: 'toys',
    title: 'Toys & Games',
    image:
      'https://images.unsplash.com/photo-1558068030-4b2cbf586f01?auto=format&fit=crop&w=800&q=80',
    searchTerms: ['toy', 'games', 'puzzle', 'lego', 'kids'],
  },
  {
    slug: 'books',
    title: 'Books',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    searchTerms: ['book', 'novel', 'read', 'fiction', 'journal'],
  },
  {
    slug: 'grocery',
    title: 'Grocery',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    searchTerms: ['grocery', 'food', 'snack', 'organic', 'beverage'],
  },
];

const bySlug = new Map(SHOP_CATEGORIES.map((c) => [c.slug, c]));

export function getShopCategoryBySlug(
  slug: string | undefined,
): ShopCategoryDefinition | undefined {
  if (!slug) return undefined;
  return bySlug.get(slug);
}

export function filterProductsForShopCategory<T extends CategorizableProduct>(
  def: ShopCategoryDefinition,
  products: T[],
): T[] {
  if (def.exactCategory) {
    return products.filter((p) => p.category === def.exactCategory);
  }
  const terms = def.searchTerms ?? [];
  if (terms.length === 0) return [];
  return products.filter((p) => {
    const hay = `${p.title ?? p.name} ${p.description} ${p.category}`.toLowerCase();
    return terms.some((t) => hay.includes(t.toLowerCase()));
  });
}
