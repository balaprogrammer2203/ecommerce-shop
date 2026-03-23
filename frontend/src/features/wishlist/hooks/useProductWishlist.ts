import { useCallback, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '../api/wishlistApi';
import {
  readGuestWishlistIds,
  subscribeGuestWishlist,
  toggleGuestWishlist,
} from '../lib/guestWishlistStorage';

function useGuestWishlisted(productId: string): boolean {
  return useSyncExternalStore(
    subscribeGuestWishlist,
    () => readGuestWishlistIds().includes(productId),
    () => false,
  );
}

/**
 * Wishlist toggle backed by `/api/wishlist` when logged in, or localStorage for guests.
 */
export function useProductWishlist(productId: string) {
  const isAuthed = useSelector((s: RootState) => Boolean(s.auth.token));
  const { data } = useGetWishlistQuery(undefined, { skip: !isAuthed });
  const guestWishlisted = useGuestWishlisted(productId);

  const [addToWishlist, { isLoading: addLoading }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removeLoading }] = useRemoveFromWishlistMutation();

  const isWishlisted = isAuthed
    ? (data?.productIds?.includes(productId) ?? false)
    : guestWishlisted;

  const toggle = useCallback(async () => {
    if (isAuthed) {
      if (isWishlisted) {
        await removeFromWishlist(productId).unwrap();
      } else {
        await addToWishlist(productId).unwrap();
      }
      return;
    }
    toggleGuestWishlist(productId);
  }, [isAuthed, isWishlisted, productId, addToWishlist, removeFromWishlist]);

  return {
    isWishlisted,
    toggle,
    isLoading: addLoading || removeLoading,
  };
}
