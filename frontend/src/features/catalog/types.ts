export type ProductCategorySnapshot = {
  _id: string;
  slug: string;
  path: string;
  name: string;
};

export type Product = {
  _id: string;
  /** Canonical catalog title */
  title?: string;
  /** Populated for storefront compatibility (alias of title) */
  name: string;
  slug?: string;
  price: number;
  /** Optional list / MSRP — when greater than `price`, shows strike-through + discount badge */
  originalPrice?: number;
  image?: string;
  images?: string[];
  description: string;
  category: string;
  categories?: ProductCategorySnapshot[];
  countInStock: number;
  stock?: number;
  brand?: string;
  averageRating?: number;
  numReviews?: number;
  attributes?: Record<string, unknown>;
};

export type CatalogFilters = {
  search: string;
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
};

export type ProductListResponse = {
  products: Product[];
  page: number;
  pages: number;
  total: number;
};
