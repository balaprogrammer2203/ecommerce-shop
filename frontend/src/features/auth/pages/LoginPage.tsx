import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../app/hooks';
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

  const onSubmit = async () => {
    const result = await login({ email, password }).unwrap();
    dispatch(setCredentials(result));
    navigate(from, { replace: true });
  };

  return (
    <Stack alignItems="center" justifyContent="center" minHeight="70vh">
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
          <Button variant="contained" size="large" disabled={isLoading} onClick={onSubmit}>
            Sign in
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
