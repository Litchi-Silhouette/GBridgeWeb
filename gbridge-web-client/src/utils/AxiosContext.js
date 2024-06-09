import React, { createContext, useContext } from 'react';
import axios from 'axios';
import config from '../config/config.json';

const axiosInstance = axios.create({
    baseURL: config.proxy.url,
    withCredentials: true,
});

const AxiosContext = createContext();

export const AxiosProvider = ({ children }) => (
    <AxiosContext.Provider value={axiosInstance}>
        {children}
    </AxiosContext.Provider>
);

export const useAxios = () => useContext(AxiosContext);
