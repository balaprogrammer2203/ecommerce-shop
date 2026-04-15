import { createBrowserRouter } from 'react-router-dom';

import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AuthGuard } from '../features/auth/components/AuthGuard';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CartPage } from '../features/cart/pages/CartPage';
import { CategoryPage } from '../features/catalog/pages/CategoryPage';
import { HomePage } from '../features/catalog/pages/HomePage';
import { ProductPage } from '../features/catalog/pages/ProductPage';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { WishlistPage } from '../features/wishlist/pages/WishlistPage';
import { AccountLayout } from '../shared/layouts/AccountLayout';
import { AdminLayout } from '../shared/layouts/AdminLayout';
import { PublicLayout } from '../shared/layouts/PublicLayout';

/**
 * Application route tree. Keep route definitions here (composition root);
 * screens live under `features/{name}/pages` for feature-based scaling.
 */
export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'product/:productId', element: <ProductPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
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
