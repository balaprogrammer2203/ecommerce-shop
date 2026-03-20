import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Order } from '../types';

type OrdersState = {
  latestOrder?: Order;
};

const initialState: OrdersState = {};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setLatestOrder: (state, action: PayloadAction<Order>) => {
      state.latestOrder = action.payload;
    },
  },
});

export const { setLatestOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
