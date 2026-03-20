import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CheckoutStep } from '../types';

type CheckoutState = {
  step: CheckoutStep;
};

const initialState: CheckoutState = {
  step: 'shipping',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
  },
});

export const { setStep } = checkoutSlice.actions;
export const checkoutReducer = checkoutSlice.reducer;
