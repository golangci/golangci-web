import { combineReducers } from "redux";
import { put, takeEvery, call, select, fork } from "redux-saga/effects";
import { IAppStore } from "reducers";
import {
  makeApiGetRequest, processError,
} from "modules/api";
import { string } from "prop-types";

enum AnalyzesAction {
  Fetch = "@@GOLANGCI/ANALYZES/FETCH",
  Fetched = "@@GOLANGCI/ANALYZES/FETCHED",
  BuildLogTogglePanels = "@@GOLANGCI/BUILDLOG/PANELS/TOGGLE",
}

export const fetchAnalysis = (owner: string, name: string, prNumber?: number, commitSha?: string,  analysisGuid?: string) => ({
  type: AnalyzesAction.Fetch,
  owner,
  name,
  prNumber,
  commitSha,
  analysisGuid,
});

export const buildLogTogglePanels = (keys: string[]) => ({
  type: AnalyzesAction.BuildLogTogglePanels,
  keys,
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
  IsEmpty?: boolean;
  RepoAnalysisStatus?: IRepoAnalysisStatus;

  PreviousAnalyzes?: IAnalysisStateLink[];
}

interface  IAnalysisStateLink {
  CommitSHA: string;
  CreatedAt: string;
}

interface IRepoAnalysisStatus {
  DefaultBranch: string;
}

interface IAnalysisResultJSON {
  GolangciLintRes: IGolangciLintRes;
  WorkerRes: IWorkerRes;
  BuildLog: IBuildLog;
}

export interface IBuildLog {
  Groups: IBuildGroup[];
}

export interface IBuildGroup {
  Name: string;
  Duration: number; // nanoseconds from time.Duration
  Steps: IBuildStep[];
}

interface IBuildStep {
  Description: string;
  Error: string;
  OutputLines: string[];
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
  buildLogActivePanels?: string[];
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

const buildLogActivePanels = (state: string[] = [], action: any): string[] => {
  switch (action.type) {
    case AnalyzesAction.Fetch:
      return [];
    case AnalyzesAction.Fetched:
      return [];
    case AnalyzesAction.BuildLogTogglePanels:
      return action.keys;
    default:
      return state;
  }
};

export const reducer = combineReducers<IAnalyzesStore>({
  current,
  buildLogActivePanels,
});

function* doFetchAnalysis({prNumber, owner, name, commitSha, analysisGuid}: any) {
  const state: IAppStore = yield select();

  const apiUrlBase = `/v1/repos/github.com/${owner}/${name}`;
  const apiUrlQs = (commitSha || analysisGuid) ? `?commit_sha=${commitSha}&analysisguid=${analysisGuid}` : "";
  const apiUrl = prNumber ? `${apiUrlBase}/pulls/${prNumber}${apiUrlQs}` : `${apiUrlBase}/repoanalyzes${apiUrlQs}`;

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
