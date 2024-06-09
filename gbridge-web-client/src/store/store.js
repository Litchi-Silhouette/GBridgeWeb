import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import globalReducer from './globalSlice';

const store = configureStore({
  reducer: {
    global: globalReducer,
    auth: authReducer,
  },
});

export default store;
