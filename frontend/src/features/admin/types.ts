import { Product } from '../catalog/types';

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  dateOfBirth?: string | null;
  profileImageUrl?: string;
  twoFactorEnabled?: boolean;
  activeSessionsCount?: number;
  createdAt?: string;
};

export type AdminProductInput = Partial<Product> & {
  title: string;
  description: string;
  price: number;
  categoryId?: string;
  category?: string;
};

export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?:
    | string
    | null
    | { _id?: string; name?: string; slug?: string; path?: string; level?: number };
  level?: number;
  path?: string;
  sortOrder?: number;
  isActive: boolean;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
};

export type AdminCategoryAttribute = {
  _id: string;
  categoryId: string;
  key: string;
  label: string;
  values: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
};
