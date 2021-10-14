import { defer, Observable } from 'rxjs';
import initializeAxios from './axios.init';
import { axiosRequestConfiguration } from './axios.config';
import { map } from 'rxjs/operators';

const axiosInstance = initializeAxios(axiosRequestConfiguration);

const get = <T>(url: string, queryParams?: object): Observable<T> => {
  return defer(() => axiosInstance.get<T>(url, { params: queryParams })).pipe(
    map((result) => result.data),
  );
};

const post = <T>(
  url: string,
  body: object,
  queryParams?: object,
): Observable<T | void> => {
  return defer(() =>
    axiosInstance.post<T>(url, body, { params: queryParams }),
  ).pipe(map((result) => result.data));
};

const put = <T>(
  url: string,
  body: object,
  queryParams?: object,
): Observable<T | void> => {
  return defer(() =>
    axiosInstance.put<T>(url, body, { params: queryParams }),
  ).pipe(map((result) => result.data));
};

const patch = <T>(
  url: string,
  body: object,
  queryParams?: object,
): Observable<T | void> => {
  return defer(() =>
    axiosInstance.patch<T>(url, body, { params: queryParams }),
  ).pipe(map((result) => result.data));
};

export default { get, post, put, patch };