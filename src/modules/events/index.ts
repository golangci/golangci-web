import { call, select, takeEvery, fork } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiPostRequest, processError,
} from "modules/api";

export enum EventAction {
  Post = "@@GOLANGCI/EVENTS/POST",
}

export const postEvent = (name: string, payload?: object) => ({
  type: EventAction.Post,
  name,
  payload,
});

function* doEventPosting({name, payload}: any) {
  const state: IAppStore = yield select();
  if (__SERVER__) { // events should be sent from browser
    return;
  }

  const apiUrl = "/v1/events/analytics";
  const req = {
    name,
    payload,
  };
  const resp = yield call(makeApiPostRequest, apiUrl, req, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, "Can't post event", true);
  }
}

function* postEventWatcher() {
  yield takeEvery(EventAction.Post, doEventPosting);
}

export function getWatchers() {
  return [
    fork(postEventWatcher),
  ];
}
