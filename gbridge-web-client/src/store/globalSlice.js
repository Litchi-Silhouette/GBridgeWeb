import { createSlice } from '@reduxjs/toolkit';

export const globalSlice = createSlice({
    name: 'global',
    initialState: {
        saveAccount: false,
        username: null,
        password: null,
        portrait: null,
        authenticated: false,
        token: null,
    },
    reducers: {
        resetInfo: (state) => {
            state.saveAccount = false;
            state.username = null;
            state.password = null;
            state.portrait = null;
            state.authenticated = false;
            state.token = null;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        setCredentials: (state, action) => {
            state.username = action.payload.username;
            state.password = action.payload.password;
        },
        setPortrait: (state, action) => {
            state.portrait = action.payload;
        },
        setSaveAccount: (state, action) => {
            state.saveAccount = action.payload;
        },
        toggleSaveAccount(state) {
            state.saveAccount = !state.saveAccount;
        },
        setAuthenticated: (state, action) => {
            state.authenticated = action.payload;
        },
    },
});

export const { setAuthenticated, setCredentials, setPortrait,
    setSaveAccount, toggleSaveAccount, setToken, resetInfo
} = globalSlice.actions;

export default globalSlice.reducer;
