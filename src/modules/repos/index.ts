import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "../../reducers";
import {
  makeApiGetRequest, makeApiPutRequest, makeApiDeleteRequest, processError,
} from "../api";
import reachGoal from "../utils/analytics";

enum ReposAction {
  FetchList = "@@GOLANGCI/REPOS/LIST/FETCH",
  FetchedList = "@@GOLANGCI/REPOS/LIST/FETCHED",
  Activate = "@@GOLANGCI/REPOS/ACTIVATE",
  Activated = "@@GOLANGCI/REPOS/ACTIVATED",
  UpdateSearchQuery = "@@GOLANGCI/REPOS/SEARCH/UPDATE",
}

export const activateRepo = (activate: boolean, name: string) => ({
  type: ReposAction.Activate,
  activate,
  name,
});

export const updateSearchQuery = (q: string) => ({
  type: ReposAction.UpdateSearchQuery,
  q,
});

const onActivatedRepo = (name: string, isActivated: boolean) => ({
  type: ReposAction.Activated,
  name,
  isActivated,
});

export const fetchRepos = (refresh?: boolean) => ({
  type: ReposAction.FetchList,
  refresh,
});

const onReposFetched = (repos: IRepo[]) => ({
  type: ReposAction.FetchedList,
  repos,
});

export interface IRepoStore {
  github?: IRepo[];
  searchQuery?: string;
}

export interface IRepo {
  name: string;
  isActivated: boolean;
  isActivatingNow?: boolean;
}

const github = (state: IRepo[] = null, action: any): IRepo[] => {
  switch (action.type) {
    case ReposAction.FetchedList:
      return action.repos;
    case ReposAction.FetchList:
      return null;
    case ReposAction.Activate:
      let repos: IRepo[] = [];
      for (const r of state) {
        repos.push({...r, isActivatingNow: r.name === action.name ? true : r.isActivatingNow});
      }
      return repos;
    case ReposAction.Activated:
      repos = [];
      for (const r of state) {
        const p = (r.name === action.name) ? {
          isActivatingNow: false,
          isActivated: action.isActivated,
        } : {};
        repos.push({...r, ...p});
      }
      return repos;
    default:
      return state;
  }
};

const searchQuery = (state: string = null, action: any): string => {
  switch (action.type) {
    case ReposAction.UpdateSearchQuery:
      return action.q.toLowerCase();
    default:
      return state;
  }
};

export const reducer = combineReducers<IRepoStore>({
  github,
  searchQuery,
});

function* doReposFetching({refresh}: any) {
  const state: IAppStore = yield select();
  const apiUrl = `/v1/repos?refresh=${refresh ? 1 : 0}`;
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, "Can't fetch repo list");
  } else {
    yield put(onReposFetched(resp.data.repos));
  }
}

function* fetchReposWatcher() {
  yield takeEvery(ReposAction.FetchList, doReposFetching);
}

function* doActivateRepoRequest({activate, name}: any) {
  const state: IAppStore = yield select();
  const apiUrl = `/v1/repos/${name}`;
  const resp = yield call(activate ? makeApiPutRequest : makeApiDeleteRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, `Can't ${activate ? "" : "de"}activate repo`);
    yield put(onActivatedRepo(name, !activate));
  } else {
    yield put(onActivatedRepo(name, activate));
    yield call(reachGoal, "repos", activate ? "connect" : "disconnect");
  }
}

function* activateRepoWatcher() {
  yield takeEvery(ReposAction.Activate, doActivateRepoRequest);
}

export function getWatchers() {
  return [
    fork(fetchReposWatcher),
    fork(activateRepoWatcher),
  ];
}
