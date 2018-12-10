import axios from "axios";
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

const makeApiRequest = (path: string, method: string, cookie?: string, data?: any): Promise<IApiResponse> => {
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
  }).then<IApiResponse>((resp) => {
    console.info("API: %s: %s: got response %d for %sms with cookie %s", method, path, resp.status, Date.now() - startTime, cookie);
    return {data: resp.data, status: resp.status};
  })
  .catch<IApiResponse>((error) => {
    console.warn("API: %s: %s: got error with cookie %s: %s for %sms", method, path, cookie, error, Date.now() - startTime);
    return {error};
  });
};

export interface IApiResponse {
  error?: any;
  data?: any;
}

export const getApiHttpCode = (resp: IApiResponse): number => {
  const code = (resp && resp.error && resp.error.response && resp.error.response.status) ? resp.error.response.status : 500;
  return code;
};

export function* processError(apiUrl: string, resp: IApiResponse, debugMessage: string, dontShowToast?: boolean) {
  const code = getApiHttpCode(resp);
  yield put(onGotApiResult(code));
  reportError("api error", {error: !resp ? "no response" : resp.error, apiUrl});
  console.error("api error:", debugMessage, resp);
  if (!dontShowToast && code !== 403) {
    const errResp = (resp && resp.error && resp.error.response && resp.error.response.data) ? resp.error.response.data : null;
    const errMessage = (errResp && errResp.error && errResp.error.message) ? errResp.error.message : null;
    if (errMessage) {
      toastr.error("Error", errMessage);
    } else {
      toastr.error("Error", debugMessage);
    }
  }
}
