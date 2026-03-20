import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { authService } from '../../../services/authService';
import { AuthResponse, User } from '../types';

type AuthState = {
  user: User | null;
  token: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      authService.storeCredentials({
        token: action.payload.token,
      });
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      authService.clearCredentials();
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
