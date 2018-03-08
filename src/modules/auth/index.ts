import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "../../reducers";
import {
  makeApiGetRequest, getApiHttpCode, processError,
} from "../api";
import { trackAuthorizedUser } from "../utils/analytics";

enum AuthAction {
  Check = "@@GOLANGCI/AUTH/CHECK",
  Checked = "@@GOLANGCI/AUTH/CHECKED",
}

export const checkAuth = () => ({
  type: AuthAction.Check,
});

export const onCheckedAuth = (cu: IUser) => ({
  type: AuthAction.Checked,
  currentUser: cu,
});

export interface IAuthStore {
  currentUser?: IUser;
  cookie?: string;
}

export interface IUser {
  id: number;
  name: string;
  avatarUrl: string;
  githubLogin: string;
  email: string;
  createdAt: Date;
}

const currentUser = (state: IUser = null, action: any): IUser => {
  switch (action.type) {
    case AuthAction.Checked:
      return action.currentUser;
    default:
      return state;
  }
};

const cookie = (state: string = null, action: any): string => {
    return state;
};

export const reducer = combineReducers<IAuthStore>({
  currentUser,
  cookie,
});

function* doAuthCheckRequest() {
  const state: IAppStore = yield select();
  const apiUrl = "/v1/auth/check";
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    if (getApiHttpCode(resp) === 403) {
      // user isn't authorized
      yield put(onCheckedAuth(null));
    } else {
      yield* processError(apiUrl, resp, "Can't check authorization");
    }
  } else {
    const user: IUser = resp.data.user;
    yield put(onCheckedAuth(user));
    yield call(trackAuthorizedUser, user);
  }
}

function* checkAuthWatcher() {
  yield takeEvery(AuthAction.Check, doAuthCheckRequest);
}

export function getWatchers() {
  return [
    fork(checkAuthWatcher),
  ];
}
