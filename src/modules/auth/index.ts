import { combineReducers } from "redux";
import { put, call, select, fork, take } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiGetRequest, getApiHttpCode, processError,
} from "modules/api";

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
  authWasChecked?: boolean;
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

const authWasChecked = (state: boolean = false, action: any): boolean => {
  switch (action.type) {
    case AuthAction.Checked:
      return true;
    default:
      return state;
  }
};

const cookie = (state: string = null, action: any): string => {
    return state;
};

export const reducer = combineReducers<IAuthStore>({
  currentUser,
  authWasChecked,
  cookie,
});

function* doAuthCheckRequest() {
  const state: IAppStore = yield select();
  if (__SERVER__ && !state.auth.cookie) { // don't make extra request
    yield put(onCheckedAuth(null));
    return;
  }

  if (state.auth.authWasChecked) { // don't check auth twice
    return;
  }

  const apiUrl = "/v1/auth/check";
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    if (getApiHttpCode(resp) === 403) {
      // user isn't authorized
      yield put(onCheckedAuth(null));
    } else {
      yield* processError(apiUrl, resp, "Can't check authorization", true);
    }
  } else {
    const user: IUser = resp.data.user;
    yield put(onCheckedAuth(user));
  }
}

const takeLeading = (patternOrChannel: any, saga: any) => fork(function*() {
  while (true) {
    const action = yield take(patternOrChannel);
    yield call(saga, action);
  }
});

function* checkAuthWatcher() {
  yield takeLeading(AuthAction.Check, doAuthCheckRequest);
}

export function getWatchers() {
  return [
    fork(checkAuthWatcher),
  ];
}
