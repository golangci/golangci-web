import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiGetRequest, processError,
} from "modules/api";

enum AnalyzesAction {
  Fetch = "@@GOLANGCI/ANALYZES/FETCH",
  Fetched = "@@GOLANGCI/ANALYZES/FETCHED",
}

export const fetchAnalysis = (owner: string, name: string, prNumber?: number) => ({
  type: AnalyzesAction.Fetch,
  owner,
  name,
  prNumber,
});

const onAnalysisFetched = (analysisState: IAnalysisState) => ({
  type: AnalyzesAction.Fetched,
  analysisState,
});

export interface IAnalysisState {
  CreatedAt: string;
  CommitSHA: string;
  GithubPullRequestNumber?: number;
  GithubRepoName: string;
  ResultJSON: IAnalysisResultJSON;
  Status: string;
  NextAnalysisStatus?: string;
  IsPreparing?: boolean;
  RepoIsNotConnected?: boolean;
}

interface IAnalysisResultJSON {
  GolangciLintRes: IGolangciLintRes;
  WorkerRes: IWorkerRes;
}

interface IWorkerRes {
  Timings: ITiming[];
  Warnings: IWarning[];
  Error: string;
}

interface ITiming {
  Name: string;
  DurationMs: number;
}

export interface IWarning {
  Tag: string;
  Text: string;
}

interface IGolangciLintRes {
  Issues: IIssue[];
  Report: {
    Warnings: IWarning[];
    Linters: ILinter[];
  };
}

interface ILinter {
  Name: string;
  Enabled: boolean;
  EnabledByDefault: boolean;
}

export interface IIssue {
  Text: string;
  HunkPos: number;
  FromLinter: string;
  Pos: IPos;
  SourceLines?: string[];
}

interface IPos {
  Line: number;
  Column: number;
  Filename: string;
}

export interface IAnalyzesStore {
  current?: IAnalysisState;
}

const current = (state: IAnalysisState = null, action: any): IAnalysisState => {
  switch (action.type) {
    case AnalyzesAction.Fetched:
      return action.analysisState;
    case AnalyzesAction.Fetch:
      return null; // remove previous analysis to trigger loading bar
    default:
      return state;
  }
};

export const reducer = combineReducers<IAnalyzesStore>({
  current,
});

function* doFetchAnalysis({prNumber, owner, name}: any) {
  const state: IAppStore = yield select();
  const apiUrl = prNumber ?
    `/v1/repos/${owner}/${name}/pulls/${prNumber}` :
    `/v1/repos/github.com/${owner}/${name}/repoanalyzes`;
  const resp = yield call(makeApiGetRequest, apiUrl, state.auth.cookie);
  if (!resp || resp.error) {
    yield* processError(apiUrl, resp, "Can't fetch analysis state");
  } else {
    yield put(onAnalysisFetched(resp.data));
  }
}

function* fetchAnalyzesWatcher() {
  yield takeEvery(AnalyzesAction.Fetch, doFetchAnalysis);
}

export function getWatchers() {
  return [
    fork(fetchAnalyzesWatcher),
  ];
}
