import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../app/hooks';
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <Paper sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600}>
              Welcome back
            </Typography>
            {error ? <Alert severity="error">Login failed. Check email/password.</Alert> : null}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              size="large"
              disabled={isLoading}
              onClick={() => {
                void onSubmit();
              }}
            >
              Sign in
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
