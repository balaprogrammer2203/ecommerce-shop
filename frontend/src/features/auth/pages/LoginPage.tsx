import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../app/hooks';
import { Button } from '../../../shared/ui/system/Button';
import { Input } from '../../../shared/ui/system/Input';
import { useMergeWishlistMutation } from '../../wishlist/api/wishlistApi';
import { clearGuestWishlist, readGuestWishlistIds } from '../../wishlist/lib/guestWishlistStorage';
import { useLoginMutation } from '../api/authApi';
import { setCredentials } from '../slices/authSlice';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const [mergeWishlist] = useMergeWishlistMutation();

  const onSubmit = async () => {
    const result = await login({ email, password }).unwrap();
    dispatch(setCredentials(result));

    const guestIds = readGuestWishlistIds();
    if (guestIds.length > 0) {
      try {
        await mergeWishlist({ productIds: guestIds }).unwrap();
        clearGuestWishlist();
      } catch {
        // Offline / API error — guest list is kept for next session
      }
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
              >
                Login failed. Check email/password.
              </div>
            ) : null}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              shopVariant="primary"
              size="large"
              fullWidth
              disabled={isLoading}
              onClick={() => {
                void onSubmit();
              }}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
