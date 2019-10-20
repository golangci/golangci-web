import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiGetRequest, processError, makeApiPutRequest,
} from "modules/api";
import { sleep } from "modules/utils/time";
import { push } from "react-router-redux";
import { toastr } from "react-redux-toastr";

enum SubsAction {
  Fetch = "@@GOLANGCI/SUBS/FETCH",
  Fetched = "@@GOLANGCI/SUBS/FETCHED",
  Update = "@@GOLANGCI/SUBS/UPDATE",
  Updated = "@@GOLANGCI/SUBS/UPDATED",
  Poll = "@@GOLANGCI/SUBS/POLL",
}

export enum SubStatus {
  Active = "active",
  Inactive = "inactive",
  Creating = "creating",
  Updating = "updating",
  Deleting = "deleting",
}

export interface ISub {
  seatsCount: number;
  version: number;
  status: SubStatus;
  pricePerSeat: number; // TODO: currency
  cancelUrl: string;
  trialAllowanceInDays: number;
  paddleTrialDaysAuth: string;
}

export const fetchSub = (provider: string, name: string) => ({
  type: SubsAction.Fetch,
  provider,
  name,
});

const onSubFetched = (sub: ISub) => ({
  type: SubsAction.Fetched,
  sub,
});

export const updateSub = (seatsCount: number) => ({
  type: SubsAction.Update,
  seatsCount,
});

export const onSubUpdated = (sub: ISub) => ({
  type: SubsAction.Updated,
  sub,
});

export const pollSub = (provider: string, name: string) => ({
  type: SubsAction.Poll,
  provider,
  name,
});

export interface ISubsStore {
  current?: ISub;
  isUpdating?: boolean;
  isCreating?: boolean;
}

const current = (state: ISub = null, action: any): ISub => {
  switch (action.type) {
    case SubsAction.Fetched:
      return action.sub;
    case SubsAction.Fetch:
    case SubsAction.Poll:
      return null; // remove previous to trigger loading bar
    case SubsAction.Updated:
      return action.sub; // update version after saving
    default:
      return state;
  }
};

const isUpdating = (state: boolean = false, action: any): boolean => {
  switch (action.type) {
    case SubsAction.Update:
      return true;
    case SubsAction.Updated:
      return false;
    default:
      return state;
  }
};

const isCreating = (state: boolean = false, action: any): boolean => {
  switch (action.type) {
    case SubsAction.Poll:
      return true;
    case SubsAction.Fetched:
      return false;
    default:
      return state;
  }
};

export const reducer = combineReducers<ISubsStore>({
  current,
  isUpdating,
  isCreating,
});

function* doFetchSub({provider, name}: any) {
  const state: IAppStore = yield select();
  const apiUrl = `/v1/orgs/${provider}/${name}/subscription`;
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, "Can't fetch subscription");
  } else {
    yield put(onSubFetched(resp.data));
  }
}

function* doUpdateSub({seatsCount}: any) {
  const state: IAppStore = yield select();
  const org = state.orgs.current;
  const sub = state.subs.current;
  const apiUrl = `/v1/orgs/${org.provider}/${org.name.toLowerCase()}/subscription`;
  const req = {
    seatsCount,
    version: sub.version,
    orgVersion: org.version,
  };
  const resp = yield call(makeApiPutRequest, apiUrl, req, state.auth.cookie);
  if (!resp || resp.error) {
    yield put(onSubUpdated(sub));
    yield* processError(apiUrl, resp, "Can't update subscription");
    return;
  }

  const maxAttempts = 15;
  const delayIncreaseCoef = 1.5;
  const initialDelayMs = 200;

  let delay = initialDelayMs;
  for (let i = 0; i < maxAttempts; i++) {
    const getResp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
    if (!getResp || getResp.error) {
      yield* processError(apiUrl, getResp, `Can't get subscription status`);
      yield put(onSubUpdated(sub));
      yield put(push(`/orgs/${org.provider}/${org.name.toLowerCase()}`));
      return;
    }

    const respSub = getResp.data;
    const status = respSub.status;
    if (status === SubStatus.Active) {
      console.info(`got active status from ${i + 1}-th attempt`);
      yield put(onSubUpdated(respSub));
      return;
    }

    yield sleep(delay);
    delay *= delayIncreaseCoef;
  }

  yield* processError("", null, `Timeouted to update subscription`);
  yield put(onSubUpdated(sub));
}

function* doPollSub({provider, name}: any) {
  const state: IAppStore = yield select();
  const org = state.orgs.current;
  const apiUrl = `/v1/orgs/${org.provider}/${org.name.toLowerCase()}/subscription`;

  const maxAttempts = 100;
  const delayIncreaseCoef = 1.5;
  const initialDelayMs = 200;

  let delay = initialDelayMs;
  for (let i = 0; i < maxAttempts; i++) {
    const getResp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
    if (!getResp || getResp.error) {
      yield sleep(delay);
      delay *= delayIncreaseCoef;
      continue;
    }

    const respSub = getResp.data;
    const status = respSub.status;
    if (status === SubStatus.Active) {
      console.info(`Polled the active subscription from ${i + 1}-th attempt`);
      yield put(onSubFetched(respSub));
      toastr.info("Success", "Thank you for the subscription!");
      return;
    }

    yield sleep(delay);
    delay *= delayIncreaseCoef;
  }

  yield* processError("", null, `Sorry, we can't check subscription status right now. Please, try again later.`);
  yield put(onSubUpdated(null));
}

function* fetchWatcher() {
  yield takeEvery(SubsAction.Fetch, doFetchSub);
}

function* pollWatcher() {
  yield takeEvery(SubsAction.Poll, doPollSub);
}

function* updateWatcher() {
  yield takeEvery(SubsAction.Update, doUpdateSub);
}

export function getWatchers() {
  return [
    fork(fetchWatcher),
    fork(pollWatcher),
    fork(updateWatcher),
  ];
}
