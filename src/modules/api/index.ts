import axios from 'axios';
import { onGotApiResult } from '../result';
import { put } from 'redux-saga/effects';

export const makeApiGetRequest = (path: string, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "GET", cookie);
}
export const makeApiPostRequest = (path: string, data: any, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "POST", cookie, data);
}
export const makeApiPutRequest = (path: string, data: any, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "PUT", cookie, data);
}
export const makeApiDeleteRequest = (path: string, data: any, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "DELETE", cookie, data);
}

const makeApiRequest = (path: string, method: string, cookie?: string, data?: any): Promise<IApiResponse> => {
  let startTime = Date.now();
  console.info("API: %s: %s: making HTTP request with cookie %s", method, path, cookie);
  let headers: any = {
    'Accept': 'application/json',
  };

  if (__SERVER__ && cookie) {
    headers.cookie = cookie;
  }

  return axios.request<IApiResponse>({
    url: API_HOST + path,
    data,
    method,
    headers,
    withCredentials: true,
  }).then<IApiResponse>(resp => {
    console.info("API: %s: %s: got response for %sms with cookie %s", method, path, Date.now() - startTime, cookie);
    return {data: resp.data};
  })
  .catch<IApiResponse>(error => {
    console.error("API: %s: %s: got error with cookie %s: %s for %sms", method, path, cookie, error, Date.now() - startTime);
    return {error};
  });
}

export interface IApiResponse {
  error?: any;
  data?: any;
}


export const getApiHttpCode = (resp: IApiResponse): number => {
  let code = (resp && resp.error && resp.error.response && resp.error.response.status) ? resp.error.response.status : 500;
  return code;
}

export function* processError(resp: IApiResponse, message: string) {
  yield put(onGotApiResult(getApiHttpCode(resp)));
  console.error("api error:", message, resp);
}
