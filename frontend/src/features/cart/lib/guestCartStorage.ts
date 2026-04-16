import type { CartItem } from '../types';

const GUEST_CART_STORAGE_KEY = 'guest_cart_items_v1';

const isValidCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    (item.image === undefined || typeof item.image === 'string')
  );
};

export const readGuestCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
};

export const saveGuestCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota/security errors; cart still works in-memory.
  }
};
