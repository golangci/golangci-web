import * as React from "react";
import { Route, Switch } from "react-router-dom";
import App from "components/App";
import Home from "components/pages/Home";
import Repos from "components/pages/Repos";
import Report from "components/pages/Report";
import Terms from "components/pages/static/Terms";
import Privacy from "components/pages/static/Privacy";

export default () => (
  <App>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/repos/github" component={Repos} />
      <Route exact path="/r/:owner/:name/pulls/:prNumber" component={Report} />
      <Route exact path="/r/github.com/:owner/:name/pulls/:prNumber" component={Report} />
      <Route exact path="/r/github.com/:owner/:name" component={Report} />
      <Route exact path="/terms" component={Terms} />
      <Route exact path="/privacy" component={Privacy} />
    </Switch>
  </App>
);
