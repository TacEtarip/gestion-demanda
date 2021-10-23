/* eslint-disable @typescript-eslint/ban-types */
import { defer, Observable } from 'rxjs';
import initializeAxios from './axios.init';
import { axiosRequestConfiguration } from './axios.config';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';

const axiosInstance = initializeAxios(axiosRequestConfiguration);

// eslint-disable-next-line @typescript-eslint/ban-types
const get = <T>(url: string, queryParams?: {}) => {
  return defer(() => axiosInstance.get<T>(url, { params: queryParams }));
};

const pureGet = <T>(
  url: string,
  queryParams?: {},
): Observable<AxiosResponse<T>> => {
  return defer(() => axiosInstance.get<T>(url, { params: queryParams }));
};

const post = <T>(url: string, body: {}, queryParams?: {}) => {
  return defer(() => axiosInstance.post<T>(url, body, { params: queryParams }));
};

const put = <T>(
  url: string,
  body: {},
  queryParams?: {},
): Observable<T | void> => {
  return defer(() =>
    axiosInstance.put<T>(url, body, { params: queryParams }),
  ).pipe(map((result) => result.data));
};

const patch = <T>(
  url: string,
  body: {},
  queryParams?: {},
): Observable<T | void> => {
  return defer(() =>
    axiosInstance.patch<T>(url, body, { params: queryParams }),
  ).pipe(map((result) => result.data));
};

export default { get, post, put, patch, pureGet };
