import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import { reducer as toastrReducer } from "react-redux-toastr";
import { reducer as responsiveReducer } from "react-responsive-redux";

import { IResultStore, reducer as resultReducer } from "modules/result";
import { IToggleStore, toggleReducer } from "modules/toggle";
import { IAuthStore, reducer as authReducer } from "modules/auth";
import { IRepoStore, reducer as reposReducer } from "modules/repos";
import { IAnalyzesStore, reducer as analyzesReducer } from "modules/analyzes";

export interface IAppStore {
  result?: IResultStore;
  toggle?: IToggleStore;
  auth?: IAuthStore;
  repos?: IRepoStore;
  analyzes?: IAnalyzesStore;
}

export const rootReducer = combineReducers<IAppStore>({
  routing: routerReducer,
  result: resultReducer,
  toastr: toastrReducer,
  responsive: responsiveReducer,
  toggle: toggleReducer,
  auth: authReducer,
  repos: reposReducer,
  analyzes: analyzesReducer,
});
