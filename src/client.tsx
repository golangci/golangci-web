import * as React from "react";
import * as ReactDOM from "react-dom";
import StackTrace from "stacktrace-js";

import configureStore from "./store/configure";

import { createBrowserHistory } from "history";
import { syncHistoryWithStore } from "react-router-redux";

import { IAppStore } from "./reducers";

import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import buildRoutes from "./routes/routes";
import rootSaga from "./sagas";
import { reportError, trackAuthorizedUser } from "./modules/utils/analytics";

export default class ClientApp {
  public run(): void {
    this.runImpl();
  }

  private sendStatHit(action: string) {
    if (__DEV__) {
      return;
    }

    const w = (window as any);
    if (w.yaCounter47296422 !== undefined) {
      w.yaCounter47296422.hit(window.location.href);
    } else {
      console.warn("history.listen: w.yaCounter is undefined, can't send hit");
    }
    if (w.ga !== undefined) {
      w.ga("send", "pageview");
    } else {
      console.warn("history.listen: w.ga is undefined, can't send hit");
    }

    if (w.yaCounter47296422 !== undefined && w.ga !== undefined) {
      console.info("history.listen: sent ya+ga hits: window.location.href is %s. History args: action is %s",
        window.location.href, action);
    }
  }

  private runImpl(): void {
    this.wrapSafe(() => {
      const history = createBrowserHistory();
      const stateFromServer = (window as any).__INITIAL_STATE__;
      const initialState: IAppStore =  stateFromServer ? stateFromServer : {
      };
      console.info("initial state is", initialState);
      const store = configureStore(initialState, history);

      history.listen((location, action) => {
        console.info("history change: %s:", action, location);
        this.sendStatHit(action);
        if (action === "PUSH") {
          window.scrollTo(0, 0);
        }
      });

      store.runSaga(rootSaga);

      syncHistoryWithStore(history, store); // XXX: fucking magic, should be a bug in react-router-redux

      if (initialState.auth && initialState.auth.currentUser) {
        trackAuthorizedUser(initialState.auth.currentUser);
      }

      ReactDOM.render(
        <Provider store={store}>
          <Router history={history}>
            {buildRoutes()}
          </Router>
        </Provider>,
        document.getElementById("react-app"),
      );
    });
  }

  private wrapSafe(f: () => void) {
    try {
      f();
    } catch (e) {
      console.error("exception occured: %o", e);
      try {
        this.onError("wrapSafe(error)", "", 0, 0, e);
      } catch (e1) {
        console.error("nested exception: %o", e1);
      }
    }
  }

  private onError(msg: string, url: string, lineNo: number, columnNo: number, error: any): boolean {
    try {
      StackTrace
        .fromError(error)
        .then((stackframes) => {
          const stack = stackframes.map((sf) => sf.toString()).join("\n");
          this.sendError({msg, url, lineNo, columnNo, error, stack});
        })
        .catch((err) => {
          this.sendError({msg: "error in stacktrace", sourceMsg: msg, url, lineNo, columnNo, sourceError: error, err});
        });
    } catch (e) {
      this.sendError({msg: "exception in stacktrace", e});
    }

    return false;
  }

  private sendError(data: object) {
    console.error("sendError:", data);
    reportError(data);
  }
}

const app = new ClientApp();
app.run();
