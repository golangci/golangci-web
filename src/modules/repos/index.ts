import { combineReducers } from 'redux';
import { put, takeEvery, call, select, fork } from 'redux-saga/effects';
import { IAppStore } from '../../reducers';
import {
  makeApiGetRequest, makeApiPostRequest, makeApiPutRequest, makeApiDeleteRequest,
  IApiResponse, getApiHttpCode, processError
} from '../api';

enum ReposAction {
  FetchList = "@@GOLANGCI/REPOS/LIST/FETCH",
  FetchedList = "@@GOLANGCI/REPOS/LIST/FETCHED",
  Activate = "@@GOLANGCI/REPOS/ACTIVATE",
  Activated = "@@GOLANGCI/REPOS/ACTIVATED",
}

export const activateRepo = (activate: boolean, name: string) => ({
  type: ReposAction.Activate,
  activate,
  name,
});

const onActivatedRepo = (name: string, isActivated: boolean) => ({
  type: ReposAction.Activated,
  name,
  isActivated,
});

export const fetchRepos = () => ({
  type: ReposAction.FetchList,
});

const onReposFetched = (repos: IRepo[]) => ({
  type: ReposAction.FetchedList,
  repos,
});

export interface IRepoStore {
  github?: IRepo[];
};

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
      for (let r of state) {
        repos.push(Object.assign({}, r, {isActivatingNow: r.name === action.name ? true : r.isActivatingNow}));
      }
      return repos;
    case ReposAction.Activated:
      repos = [];
      for (let r of state) {
        let p = (r.name === action.name) ? {
          isActivatingNow: false,
          isActivated: action.isActivated,
        } : {};
        repos.push(Object.assign({}, r, p));
      }
      return repos;
    default:
      return state;
  }
}

export const reducer = combineReducers<IRepoStore>({
  github,
})


function* doReposFetching() {
  const state: IAppStore = yield select();
  const resp = yield call(makeApiGetRequest, "/v1/repos", state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(resp, "Can't check authorization");
  } else {
    yield put(onReposFetched(resp.data.repos));
  }
}

function* fetchReposWatcher() {
  yield takeEvery(ReposAction.FetchList, doReposFetching);
}

function* doActivateRepoRequest({activate, name}: any) {
  const state: IAppStore = yield select();
  const resp = yield call(activate ? makeApiPutRequest : makeApiDeleteRequest, `/v1/repos/${name}`, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(resp, "Can't activate repo");
  } else {
    yield put(onActivatedRepo(name, activate));
  }
}

function* activateRepoWatcher() {
  yield takeEvery(ReposAction.Activate, doActivateRepoRequest);
}

export function getWatchers() {
  return [
    fork(fetchReposWatcher),
    fork(activateRepoWatcher),
  ]
}
