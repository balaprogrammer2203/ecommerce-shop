import { getEnvConfig } from '../../config';

export type BackendCategoryTreeNode = {
  _id: string;
  name: string;
  slug: string;
  children?: BackendCategoryTreeNode[];
};

let cachedActiveTree: BackendCategoryTreeNode[] | null = null;
let cachedActiveTreePromise: Promise<BackendCategoryTreeNode[]> | null = null;

/**
 * Fetches the category tree from backend and memoizes it in-memory.
 * We default to `active=true` because storefront navigation should not show inactive categories.
 */
export async function fetchActiveCategoryTree(): Promise<BackendCategoryTreeNode[]> {
  if (cachedActiveTree) return cachedActiveTree;
  if (cachedActiveTreePromise) return cachedActiveTreePromise;

  const { apiBaseUrl } = getEnvConfig();
  cachedActiveTreePromise = fetch(`${apiBaseUrl}/categories/tree?active=true`, {
    credentials: 'include',
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(`Failed to load categories tree (${r.status})`);
      return (await r.json()) as BackendCategoryTreeNode[];
    })
    .then((data) => {
      cachedActiveTree = data;
      return data;
    })
    .finally(() => {
      cachedActiveTreePromise = null;
    });

  return cachedActiveTreePromise;
}
