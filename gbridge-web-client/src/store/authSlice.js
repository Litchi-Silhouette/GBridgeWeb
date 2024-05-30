// src/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  user: null,
  error: null,
  saveAccount: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    toggleSaveAccount(state) {
      state.saveAccount = !state.saveAccount;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, toggleSaveAccount } = authSlice.actions;

export default authSlice.reducer;
