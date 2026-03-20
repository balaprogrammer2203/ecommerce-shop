export type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description: string;
  category: string;
  countInStock: number;
  brand?: string;
  averageRating?: number;
  numReviews?: number;
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
