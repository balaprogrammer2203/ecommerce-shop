import { createBrowserRouter } from 'react-router-dom';

import { AuthGuard } from '../features/auth/components/AuthGuard';
import { AccountLayout } from '../layouts/AccountLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductPage } from '../pages/ProductPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'product/:productId', element: <ProductPage /> },
    ],
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/checkout',
    element: (
      <AuthGuard>
        <CheckoutPage />
      </AuthGuard>
    ),
  },
  {
    path: '/account',
    element: (
      <AuthGuard>
        <AccountLayout />
      </AuthGuard>
    ),
    children: [{ path: 'orders', element: <OrdersPage /> }],
  },
  {
    path: '/admin',
    element: (
      <AuthGuard allowedRoles={['admin']}>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
]);
