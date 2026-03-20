import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AdminState = {
  inventoryCount: number;
};

const initialState: AdminState = {
  inventoryCount: 0,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setInventoryCount: (state, action: PayloadAction<number>) => {
      state.inventoryCount = action.payload;
    },
  },
});

export const { setInventoryCount } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
