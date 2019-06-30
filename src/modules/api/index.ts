import axios, { Method } from "axios";
import { onGotApiResult } from "modules/result";
import { put } from "redux-saga/effects";
import { reportError } from "modules/utils/analytics";
import { toastr } from "react-redux-toastr";

export const makeApiGetRequest = (path: string, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "GET", cookie);
};
export const makeApiPostRequest = (path: string, data: any, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "POST", cookie, data);
};
export const makeApiPutRequest = (path: string, data: any, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "PUT", cookie, data);
};
export const makeApiDeleteRequest = (path: string, data: any, cookie?: string): Promise<IApiResponse> => {
  return makeApiRequest(path, "DELETE", cookie, data);
};

const makeApiRequest = (path: string, method: Method, cookie?: string, data?: any): Promise<IApiResponse> => {
  const startTime = Date.now();
  console.info("API: %s: %s: making HTTP request with cookie %s", method, path, cookie);
  const headers: any = {
    Accept: "application/json",
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
  }).then<IApiResponse>((resp: any) => {
    console.info("API: %s: %s: got response %d for %sms with cookie %s", method, path, resp.status, Date.now() - startTime, cookie);
    return {data: resp.data, status: resp.status, requestMethod: method};
  })
  .catch<IApiResponse>((error: any) => {
    console.warn("API: %s: %s: got error with cookie %s: %s for %sms", method, path, cookie, error, Date.now() - startTime);
    return {error, requestMethod: method};
  });
};

export interface IApiResponse {
  error?: any;
  data?: any;
  requestMethod: string;
}

export const getApiHttpCode = (resp: IApiResponse): number => {
  const code = (resp && resp.error && resp.error.response && resp.error.response.status) ? resp.error.response.status : 500;
  return code;
};

export const getApiErrorCode = (resp: IApiResponse): string => {
  const errResponse = (resp && resp.error && resp.error.response) ? resp.error.response : null;
  if (errResponse && errResponse.data && errResponse.data.error) {
    const err = errResponse.data.error;
    return err.code;
  }

  return null;
};

export const getApiErrorMessage = (resp: IApiResponse): string => {
  const errResponse = (resp && resp.error && resp.error.response) ? resp.error.response : null;
  if (errResponse && errResponse.data && errResponse.data.error) {
    const err = errResponse.data.error;
    return err.message;
  }

  return null;
};

export function* processError(apiUrl: string, resp: IApiResponse, debugMessage: string, dontShowToast?: boolean, forceToast?: boolean) {
  const httpCode = getApiHttpCode(resp);
  const errCode = getApiErrorCode(resp);
  const errMessage = getApiErrorMessage(resp);

  const showErrMessageAsToast = forceToast || (resp && resp.requestMethod !== "GET");

  yield put(onGotApiResult(httpCode, errCode, showErrMessageAsToast ? null : errMessage));

  reportError("api error", {error: !resp ? "no response" : resp.error, apiUrl});
  console.error("api error:", debugMessage, resp);
  if (!dontShowToast && httpCode !== 403 && showErrMessageAsToast) {
    if (errMessage) {
      toastr.error("Error", errMessage);
    } else {
      toastr.error("Error", debugMessage);
    }
  }
}
