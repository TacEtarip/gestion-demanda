import { AxiosRequestConfig } from 'axios';

export const axiosRequestConfiguration: AxiosRequestConfig = {
  baseURL: 'http://localhost:2000',
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
};
