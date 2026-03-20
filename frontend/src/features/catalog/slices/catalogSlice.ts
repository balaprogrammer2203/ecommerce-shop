import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CatalogFilters } from '../types';

type CatalogState = {
  filters: CatalogFilters;
};

const initialState: CatalogState = {
  filters: {
    search: '',
    categories: [],
  },
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    toggleCategory: (state, action: PayloadAction<string>) => {
      const exists = state.filters.categories.includes(action.payload);
      state.filters.categories = exists
        ? state.filters.categories.filter((cat) => cat !== action.payload)
        : [...state.filters.categories, action.payload];
    },
  },
});

export const { setSearch, toggleCategory } = catalogSlice.actions;
export const catalogReducer = catalogSlice.reducer;
