import { combineReducers } from "redux";

enum ResultActions {
  GotApiResult = "@@GOLANGCI/RESULT/API",
}

export interface IResultStore {
  apiResultHttpCode: number;
}

export const onGotApiResult = (httpCode: number) => ({
  type: ResultActions.GotApiResult,
  httpCode,
});

const apiResultHttpCode = (state: number = 200, action: any): number => {
  switch (action.type) {
    case ResultActions.GotApiResult:
      return action.httpCode;
    default:
      return state;
  }
};

export const reducer = combineReducers<IResultStore>({
  apiResultHttpCode,
});
