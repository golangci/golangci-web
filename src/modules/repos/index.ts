import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiGetRequest, makeApiPutRequest, makeApiDeleteRequest, processError, makeApiPostRequest,
} from "modules/api";
import reachGoal from "modules/utils/analytics";
import { sleep } from "modules/utils/time";

enum ReposAction {
  FetchList = "@@GOLANGCI/REPOS/LIST/FETCH",
  FetchedList = "@@GOLANGCI/REPOS/LIST/FETCHED",
  Activate = "@@GOLANGCI/REPOS/ACTIVATE",
  Activated = "@@GOLANGCI/REPOS/ACTIVATED",
  Deactivate = "@@GOLANGCI/REPOS/DEACTIVATE",
  Deactivated = "@@GOLANGCI/REPOS/DEACTIVATED",
  UpdateSearchQuery = "@@GOLANGCI/REPOS/SEARCH/UPDATE",
}

export const activateRepo = (name: string) => ({
  type: ReposAction.Activate,
  name,
});

export const deactivateRepo = (name: string, id: number) => ({
  type: ReposAction.Deactivate,
  name,
  id,
});

export const updateSearchQuery = (q: string) => ({
  type: ReposAction.UpdateSearchQuery,
  q,
});

const onActivatedRepo = (name: string, id: number) => ({
  type: ReposAction.Activated,
  name,
  id,
});

const onDeactivatedRepo = (name: string) => ({
  type: ReposAction.Deactivated,
  name,
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
  id: number;
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
    case ReposAction.Deactivate:
      return transformRepoList(state, (r: IRepo): IRepo => {
        return {...r, isActivatingNow: r.name === action.name ? true : r.isActivatingNow};
      });
    case ReposAction.Activated:
      return transformRepoList(state, (r: IRepo): IRepo => {
        const p = (r.name === action.name) ? {
          id: action.id,
          isActivatingNow: false,
          isActivated: true,
        } : {};
        return {...r, ...p};
      });
    case ReposAction.Deactivated:
      return transformRepoList(state, (r: IRepo): IRepo => {
        const p = (r.name === action.name) ? {
          isActivatingNow: false,
          isActivated: false,
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

function* doActivateRepoRequest({name}: any) {
  const state: IAppStore = yield select();
  const postUrl = `/v1/repos`;
  const nameParts = name.split("/", 2);
  const postBody = {provider: "github.com", owner: nameParts[0], name: nameParts[1]};
  const postResp = yield call(makeApiPostRequest, postUrl, postBody, state.auth.cookie);
  if (!postResp || postResp.error) {
    yield* processError(postUrl, postResp, `Can't post activate repo request`);
    yield put(onDeactivatedRepo(name));
    return;
  }

  const repoId = (postResp.data && postResp.data.repo) ? postResp.data.repo.id : null;
  if (!repoId) {
    yield* processError(postUrl, postResp, `No repo id in response`);
    yield put(onDeactivatedRepo(name));
    return;
  }

  const maxAttempts = 15;
  const delayIncreaseCoef = 1.5;
  const initialDelayMs = 200;

  let delay = initialDelayMs;
  for (let i = 0; i < maxAttempts; i++) {
    const getUrl = `/v1/repos/${repoId}`;
    const getResp = yield call(makeApiGetRequest, getUrl, state.auth.cookie);
    if (!getResp || getResp.error) {
      yield* processError(getUrl, getResp, `Can't get repo activation status`);
      yield put(onDeactivatedRepo(name));
      return;
    }

    if (!getResp.data.repo.isCreating) {
      console.info(`got activation status from ${i + 1}-th attempt`);
      yield put(onActivatedRepo(name, repoId));
      yield call(reachGoal, "repos", "connect");
      return;
    }

    yield sleep(delay);
    delay *= delayIncreaseCoef;
  }

  yield* processError("", null, `Timeouted to get repo activation status`);
  yield put(onDeactivatedRepo(name));
}

function* doDeactivateRepoRequest({name, id}: any) {
  const state: IAppStore = yield select();
  const deleteUrl = `/v1/repos/${id}`;
  const postResp = yield call(makeApiDeleteRequest, deleteUrl, state.auth.cookie);
  if (!postResp || postResp.error) {
    yield* processError(deleteUrl, postResp, `Can't post delete repo request`);
    yield put(onActivatedRepo(name, id));
    return;
  }

  const maxAttempts = 15;
  const delayIncreaseCoef = 1.5;
  const initialDelayMs = 200;

  let delay = initialDelayMs;
  for (let i = 0; i < maxAttempts; i++) {
    const getUrl = `/v1/repos/${id}`;
    const getResp = yield call(makeApiGetRequest, getUrl, state.auth.cookie);
    if (!getResp || getResp.error) {
      yield* processError(getUrl, getResp, `Can't get repo deactivation status`);
      yield put(onActivatedRepo(name, id));
      return;
    }

    if (!getResp.data.repo.isDeleting) {
      console.info(`got activation status from ${i + 1}-th attempt`);
      yield put(onDeactivatedRepo(name));
      yield call(reachGoal, "repos", "connect");
      return;
    }

    yield sleep(delay);
    delay *= delayIncreaseCoef;
  }

  yield* processError("", null, `Timeouted to get repo activation status`);
  yield put(onActivatedRepo(name, id));
}

function* activateRepoWatcher() {
  yield takeEvery(ReposAction.Activate, doActivateRepoRequest);
}

function* deactivateRepoWatcher() {
  yield takeEvery(ReposAction.Deactivate, doDeactivateRepoRequest);
}

export function getWatchers() {
  return [
    fork(fetchReposWatcher),
    fork(activateRepoWatcher),
    fork(deactivateRepoWatcher),
  ];
}
