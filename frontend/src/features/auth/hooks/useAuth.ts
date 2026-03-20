import { useAppSelector } from '../../../app/hooks';

export const useAuth = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  return {
    isAuthenticated: Boolean(token),
    user,
  };
};
