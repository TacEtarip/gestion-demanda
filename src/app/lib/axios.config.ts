import { AxiosRequestConfig } from 'axios';

export const axiosRequestConfiguration: AxiosRequestConfig = {
  baseURL: 'http://localhost:2000',
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
};
// http://localhost:2000

// http://20.64.121.17:2000
