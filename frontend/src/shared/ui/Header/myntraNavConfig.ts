/**
 * Types for storefront mega-menu (Myntra-style). Live data: `GET /api/categories/mega-menu`.
 * Fallback: `megaMenuFallbackData.ts` (keep in sync with `backend/utils/megaMenuSeed.js`).
 */

export type NavBadge = 'new' | 'trending' | 'sale';

export type MyntraNavLink = {
  label: string;
  /** Client route */
  href: string;
  /** Category slug from catalog */
  categorySlug: string;
  badge?: NavBadge;
};

export type MyntraNavColumn = {
  title: string;
  links: MyntraNavLink[];
};

export type MyntraNavItem = {
  id: string;
  label: string;
  sortOrder?: number;
  columns: MyntraNavColumn[];
};
