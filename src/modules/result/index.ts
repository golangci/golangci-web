import { combineReducers } from "redux";

enum ResultActions {
  GotApiResult = "@@GOLANGCI/RESULT/API",
}

export interface IResultStore {
  lastApiResultHttpCode: number;
  lastApiResultErrorCode: string;
  lastApiResultMessage: string;
}

export const onGotApiResult = (httpCode: number, errorCode: string = null, message: string = null) => ({
  type: ResultActions.GotApiResult,
  httpCode,
  errorCode,
  message,
});

const lastApiResultHttpCode = (state: number = 200, action: any): number => {
  switch (action.type) {
    case ResultActions.GotApiResult:
      return action.httpCode;
    default:
      return state;
  }
};

const lastApiResultErrorCode = (state: string = null, action: any): string => {
  switch (action.type) {
    case ResultActions.GotApiResult:
      return action.errorCode;
    default:
      return state;
  }
};

const lastApiResultMessage = (state: string = null, action: any): string => {
  switch (action.type) {
    case ResultActions.GotApiResult:
      return action.message;
    default:
      return state;
  }
};

export const reducer = combineReducers<IResultStore>({
  lastApiResultHttpCode,
  lastApiResultErrorCode,
  lastApiResultMessage,
});
