import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../../auth/hooks/useAuth';
import { useGetWishlistQuery } from '../api/wishlistApi';

export const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });

  const ids = data?.productIds ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-4 text-3xl font-extrabold text-slate-900">Wishlist</h1>
      {!isAuthenticated ? (
        <p className="text-slate-600">
          Sign in to sync your wishlist across devices. You can still save items locally from
          product cards.
          <span className="mt-3 block">
            <RouterLink to="/login" className="font-bold text-primary no-underline hover:underline">
              Login
            </RouterLink>
          </span>
        </p>
      ) : isLoading ? (
        <p className="text-slate-600">Loading…</p>
      ) : isError ? (
        <p className="text-red-600">Could not load wishlist.</p>
      ) : ids.length === 0 ? (
        <p className="text-slate-600">No saved items yet.</p>
      ) : (
        <ul className="mt-4 flex list-none flex-col gap-2 p-0">
          {ids.map((id) => (
            <li key={id}>
              <RouterLink
                to={`/product/${id}`}
                className="font-semibold text-primary no-underline hover:underline"
              >
                Product {id}
              </RouterLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
