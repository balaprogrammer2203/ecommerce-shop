const STORAGE_KEY = 'shop_wishlist_product_ids';
const CHANGE_EVENT = 'shop-wishlist-changed';

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export function readGuestWishlistIds(): string[] {
  if (typeof window === 'undefined') return [];
  return parseIds(window.localStorage.getItem(STORAGE_KEY));
}

export function writeGuestWishlistIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function clearGuestWishlist(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Toggle id in guest wishlist; returns new membership. */
export function toggleGuestWishlist(productId: string): boolean {
  const ids = readGuestWishlistIds();
  const has = ids.includes(productId);
  const next = has ? ids.filter((id) => id !== productId) : [...ids, productId];
  writeGuestWishlistIds(next);
  return !has;
}

export function subscribeGuestWishlist(onChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = () => onChange();
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
