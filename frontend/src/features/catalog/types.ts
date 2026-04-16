import type { MyntraNavItem } from '../../shared/ui/Header/myntraNavConfig';

export type MegaMenuResponse = {
  items: MyntraNavItem[];
};

export type ProductCategorySnapshot = {
  _id: string;
  slug: string;
  path: string;
  name: string;
};

export type ProductSpecRow = {
  label: string;
  value: string;
};

export type ProductColorOption = {
  name: string;
  hex?: string;
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
  /** Optional sale price (used by admin editing / backend pricing) */
  discountPrice?: number | null;
  /** Optional list / MSRP — when greater than `price`, shows strike-through + discount badge */
  image?: string;
  images?: string[];
  description: string;
  category: string;
  categories?: ProductCategorySnapshot[];
  countInStock: number;
  stock?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  brand?: string;
  averageRating?: number;
  numReviews?: number;
  attributes?: Record<string, unknown>;
  /** Merchant SKU (detail page) */
  sku?: string;
  warranty?: string;
  highlights?: string[];
  specifications?: ProductSpecRow[];
  colors?: ProductColorOption[];
  sizes?: string[];
  shippingReturns?: string;
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

export type HomeProductsResponse = {
  featured: Product[];
  trending: Product[];
};
