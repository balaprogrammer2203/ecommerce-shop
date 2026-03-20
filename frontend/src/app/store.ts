import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { adminReducer } from '../features/admin/slices/adminSlice';
import { authApi } from '../features/auth/api/authApi';
import { authReducer } from '../features/auth/slices/authSlice';
import { cartApi } from '../features/cart/api/cartApi';
import { cartReducer } from '../features/cart/slices/cartSlice';
import { catalogApi } from '../features/catalog/api/catalogApi';
import { catalogReducer } from '../features/catalog/slices/catalogSlice';
import { checkoutReducer } from '../features/checkout/slices/checkoutSlice';
import { ordersApi } from '../features/orders/api/ordersApi';
import { ordersReducer } from '../features/orders/slices/ordersSlice';
import { reviewsApi } from '../features/reviews/api/reviewsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    catalog: catalogReducer,
    checkout: checkoutReducer,
    orders: ordersReducer,
    admin: adminReducer,
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authApi.middleware,
      cartApi.middleware,
      catalogApi.middleware,
      ordersApi.middleware,
      reviewsApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
