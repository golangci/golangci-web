import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiGetRequest, processError, makeApiPutRequest,
} from "modules/api";
import { push } from "react-router-redux";

enum OrgsAction {
  Fetch = "@@GOLANGCI/ORGS/FETCH",
  Fetched = "@@GOLANGCI/ORGS/FETCHED",
  ChangeSettingsSeat = "@@GOLANGCI/ORGS/SETTINGS/SEATS/CHANGE",
  AddSettingsSeat = "@@GOLANGCI/ORGS/SETTINGS/SEATS/ADD",
  ClearSettingsSeat = "@@GOLANGCI/ORGS/SETTINGS/SEATS/CLEAR",
  Save = "@@GOLANGCI/ORGS/SAVE",
  Saved = "@@GOLANGCI/ORGS/SAVED",
}

export interface ISeat {
  email: string;
}

export interface IOrgSettings {
  seats?: ISeat[];
}

export interface IOrg {
  settings?: IOrgSettings;
  provider: string;
  name: string;
  version: number;
}

export const fetchOrg = (provider: string, name: string) => ({
  type: OrgsAction.Fetch,
  provider,
  name,
});

export const changeSettingsSeat = (pos: number, email: string) => ({
  type: OrgsAction.ChangeSettingsSeat,
  pos,
  email,
});

export const addSettingsSeat = () => ({
  type: OrgsAction.AddSettingsSeat,
});

export const clearSettingsSeat = (pos: number) => ({
  type: OrgsAction.ClearSettingsSeat,
  pos,
});

export const saveOrg = (isBackground: boolean) => ({
  type: OrgsAction.Save,
  isBackground,
});

export const onOrgSaved = (org: IOrg) => ({
  type: OrgsAction.Saved,
  org,
});

const onOrgFetched = (org: IOrg) => ({
  type: OrgsAction.Fetched,
  org,
});

export interface IOrgsStore {
  current?: IOrg;
  isSaving?: boolean;
}

const transformSeats = (org: IOrg, f: (seats: ISeat[]) => void): IOrg => {
  // copy seats
  const seats: ISeat[] = org.settings.seats.map((s) => ({...s}));

  f(seats);

  // remove empty email seats
  const mergedSeats: ISeat[] = [];
  for (const seat of seats) {
    if (seat.email) {
      mergedSeats.push(seat);
    }
  }
  if (seats.length && !seats[seats.length - 1].email) {
    // preserve last empty seat after click to "Add User"
    mergedSeats.push(seats[seats.length - 1]);
  }

  return {
    ...org,
    settings: {
      seats: mergedSeats,
    },
  };
};

const current = (state: IOrg = null, action: any): IOrg => {
  switch (action.type) {
    case OrgsAction.Fetched:
      return action.org;
    case OrgsAction.Fetch:
      return null; // remove previous to trigger loading bar
    case OrgsAction.Saved:
      return action.org; // update version in org after saving
    case OrgsAction.ChangeSettingsSeat:
      return transformSeats(state, (seats: ISeat[]) => {
        const i: number = action.pos;
        if (i === seats.length) {
          seats.push({email: action.email});
        } else {
          seats[i].email = action.email;
        }
      });
    case OrgsAction.AddSettingsSeat:
      return transformSeats(state, (seats: ISeat[]) => {
        seats.push({email: ""});
      });
    case OrgsAction.ClearSettingsSeat:
      return transformSeats(state, (seats: ISeat[]) => {
        seats.splice(action.pos, 1);
      });
    default:
      return state;
  }
};

const isSaving = (state: boolean = false, action: any): boolean => {
  switch (action.type) {
    case OrgsAction.Save:
      return true;
    case OrgsAction.Saved:
      return false;
    default:
      return state;
  }
};

export const reducer = combineReducers<IOrgsStore>({
  current,
  isSaving,
});

function* doFetchOrg({provider, name}: any) {
  const state: IAppStore = yield select();
  const apiUrl = `/v1/orgs/${provider}/${name}`;
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, "Can't fetch org");
  } else {
    yield put(onOrgFetched(resp.data));
  }
}

const prepareOrgForSaving = (org: IOrg): IOrg => {
  // TODO: deduplicate with transformSeats
  const seats = org.settings.seats;

  const mergedSeats: ISeat[] = [];
  for (const seat of seats) {
    if (seat.email) {
      mergedSeats.push(seat);
    }
  }

  return {
    ...org,
    settings: {
      seats: mergedSeats,
    },
  };
};

function* doSaveOrg({isBackground}: any) {
  const state: IAppStore = yield select();
  const org = state.orgs.current;
  const apiUrl = `/v1/orgs/${org.provider}/${org.name.toLowerCase()}`;
  const req = prepareOrgForSaving(org);
  const resp = yield call(makeApiPutRequest, apiUrl, req, state.auth.cookie);
  if (!resp || resp.error) {
    yield put(onOrgSaved(org));
    yield* processError(apiUrl, resp, "Can't save org");
  } else {
    yield put(onOrgSaved(resp.data));
    if (!isBackground) {
      yield put(push(`/orgs/${org.provider}/${org.name.toLowerCase()}/subscription`));
    }
  }
}

function* fetchOrgWatcher() {
  yield takeEvery(OrgsAction.Fetch, doFetchOrg);
}

function* saveOrgWatcher() {
  yield takeEvery(OrgsAction.Save, doSaveOrg);
}

export function getWatchers() {
  return [
    fork(fetchOrgWatcher),
    fork(saveOrgWatcher),
  ];
}
