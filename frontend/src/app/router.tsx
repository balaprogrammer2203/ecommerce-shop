import { createBrowserRouter } from 'react-router-dom';

import { AccountProfilePage } from '../features/account/pages/AccountProfilePage';
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage';
import { AdminCategoryAttributesPage } from '../features/admin/pages/AdminCategoryAttributesPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AdminOrderDetailPage } from '../features/admin/pages/AdminOrderDetailPage';
import { AdminOrdersPage } from '../features/admin/pages/AdminOrdersPage';
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AuthGuard } from '../features/auth/components/AuthGuard';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CartPage } from '../features/cart/pages/CartPage';
import { CategoryPage } from '../features/catalog/pages/CategoryPage';
import { HomePage } from '../features/catalog/pages/HomePage';
import { ProductPage } from '../features/catalog/pages/ProductPage';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage';
import { CheckoutResultPage } from '../features/checkout/pages/CheckoutResultPage';
import { OrderDetailPage } from '../features/orders/pages/OrderDetailPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { WishlistPage } from '../features/wishlist/pages/WishlistPage';
import { AccountLayout } from '../shared/layouts/AccountLayout';
import { AdminLayout } from '../shared/layouts/AdminLayout';
import { PublicLayout } from '../shared/layouts/PublicLayout';
import { NotFoundPage } from '../shared/ui/system/NotFoundPage';
import { RouteErrorBoundary } from '../shared/ui/system/RouteErrorBoundary';

/**
 * Application route tree. Keep route definitions here (composition root);
 * screens live under `features/{name}/pages` for feature-based scaling.
 */
export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'product/:productId', element: <ProductPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'checkout',
        element: (
          <AuthGuard>
            <CheckoutPage />
          </AuthGuard>
        ),
      },
      {
        path: 'checkout/result',
        element: (
          <AuthGuard>
            <CheckoutResultPage />
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: '/account',
    element: (
      <AuthGuard>
        <AccountLayout />
      </AuthGuard>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <AccountProfilePage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:orderId', element: <OrderDetailPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AuthGuard allowedRoles={['admin']}>
        <AdminLayout />
      </AuthGuard>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'category-attributes', element: <AdminCategoryAttributesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'orders/:orderId', element: <AdminOrderDetailPage /> },
      { path: 'users', element: <AdminUsersPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
