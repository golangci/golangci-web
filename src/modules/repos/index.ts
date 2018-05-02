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

const onReposFetched = (publicRepos: IRepo[], privateRepos: IRepo[], privateReposWereFetched: boolean) => ({
  type: ReposAction.FetchedList,
  publicRepos,
  privateRepos,
  privateReposWereFetched,
});

interface IRepoList {
  public?: IRepo[];
  private?: IRepo[];
  privateReposWereFetched?: boolean;
}

export interface IRepoStore {
  list?: IRepoList;
  searchQuery?: string;
}

export interface IRepo {
  name: string;
  isAdmin: boolean;
  isPrivate: boolean;
  isActivated: boolean;
  isActivatingNow?: boolean;
}

const transformRepos = (repos: IRepo[], f: (r: IRepo) => IRepo): IRepo[] => {
  let ret: IRepo[] = []; // tslint:disable-line
  for (const r of repos) {
    ret.push(f(r));
  }

  return ret;
};

const transformRepoList = (repoList: IRepoList, f: (r: IRepo) => IRepo): IRepoList => {
  return {
    public: transformRepos(repoList.public, f),
    private: transformRepos(repoList.private, f),
    privateReposWereFetched: repoList.privateReposWereFetched,
  };
};

const list = (state: IRepoList = null, action: any): IRepoList => {
  switch (action.type) {
    case ReposAction.FetchedList:
      return {
        public: action.publicRepos,
        private: action.privateRepos,
        privateReposWereFetched: action.privateReposWereFetched,
      };
    case ReposAction.FetchList:
      return null;
    case ReposAction.Activate:
      return transformRepoList(state, (r: IRepo): IRepo => {
        return {...r, isActivatingNow: r.name === action.name ? true : r.isActivatingNow};
      });
    case ReposAction.Activated:
      return transformRepoList(state, (r: IRepo): IRepo => {
        const p = (r.name === action.name) ? {
          isActivatingNow: false,
          isActivated: action.isActivated,
        } : {};
        return {...r, ...p};
      });
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
  list,
  searchQuery,
});

function* doReposFetching({refresh}: any) {
  const state: IAppStore = yield select();
  const apiUrl = `/v1/repos?refresh=${refresh ? 1 : 0}`;
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, "Can't fetch repo list");
  } else {
    yield put(onReposFetched(resp.data.repos,
      resp.data.privateRepos, resp.data.privateReposWereFetched));
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
