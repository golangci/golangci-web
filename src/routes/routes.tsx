import * as React from "react";
import { Route, Switch } from "react-router-dom";
import App from "components/App";
import Home from "components/pages/Home";
import Repos from "components/pages/Repos";

export default () => (
  <App>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/repos/github" component={Repos} />
    </Switch>
  </App>
);
