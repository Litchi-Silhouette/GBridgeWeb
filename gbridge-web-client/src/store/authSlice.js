import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  isCodeSent: false,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset(state) {
      state.isLoading = false;
      state.isCodeSent = false;
      state.error = null;
      state.user = null;
    },
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
    registerRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
    },
    registerFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    sendCodeRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    sendCodeSuccess(state) {
      state.isLoading = false;
      state.isCodeSent = true;
    },
    sendCodeFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
  sendCodeRequest, sendCodeSuccess, sendCodeFailure,
  reset,
} = authSlice.actions;

export default authSlice.reducer;
