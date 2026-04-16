import { CircularProgress, Box } from '@mui/material';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useCurrentUserQuery } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

type AuthGuardProps = {
  children: ReactNode;
  allowedRoles?: Array<'customer' | 'admin'>;
};

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const shouldFetchUserForRoles = Boolean(isAuthenticated && allowedRoles?.length && !user);
  const { data: fetchedUser, isLoading: isFetchingUserForRoles } = useCurrentUserQuery(undefined, {
    skip: !shouldFetchUserForRoles,
  });

  const effectiveRole = fetchedUser?.role ?? user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length) {
    if (!effectiveRole) {
      return isFetchingUserForRoles ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Navigate to="/" replace />
      );
    }

    if (!allowedRoles.includes(effectiveRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
