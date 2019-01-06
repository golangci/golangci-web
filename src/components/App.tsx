import * as React from "react";
import Header from "components/layout/Header";
import Footer from "components/layout/Footer";
import { Helmet } from "react-helmet";
import { withRouter, RouteComponentProps } from "react-router-dom";

import { Layout, Alert, Row, Button, Icon } from "antd";

import "css/sass/main.scss";
import "css/less/main.less";

import "react-redux-toastr/src/styles/index.scss";
import ReduxToastr from "react-redux-toastr";
import { IAppStore } from "reducers";
import { connect } from "react-redux";
import { IUser } from "modules/auth";

interface IStateProps {
  lastApiHttpCode: number;
  lastApiErrorCode: string;
  lastApiErrorMessage: string;
  currentUser?: IUser;
}

interface IDispatchProps {}
interface IOwnProps {}

interface IProps extends IStateProps, IDispatchProps, IOwnProps, RouteComponentProps<any> {}

class App extends React.Component<IProps> {
  private renderContent() {
    if (this.props.lastApiErrorMessage) {
      return this.renderCustomAlert("Error", this.props.lastApiErrorMessage);
    }

    switch (this.props.lastApiHttpCode) {
    case 403:
      const isNotAuthorizedCode = this.props.lastApiErrorCode === "NOT_AUTHORIZED";
      if (this.props.currentUser && isNotAuthorizedCode) {
        return this.renderRevokedAccessTokenError();
      }

      if (isNotAuthorizedCode) {
        return this.renderNotAuthorizedError();
      }
    }

    return this.props.children;
  }

  private renderCustomAlert(header: string, description: string): JSX.Element {
    return (
      <Alert
        message={header}
        description={description}
        type="error"
        showIcon
      />
    );
  }

  private renderNotAuthorizedError(): JSX.Element {
    const body = (
      <div>
        You aren't authorized.
        <Row type="flex" justify="center">
          <a href={`${API_HOST}/v1/auth/github`}>
            <Button type="default" size="large">
              <Icon type="github" />
              Login
            </Button>
          </a>
        </Row>
      </div>
    );
    return (
      <Alert
        message={`Authorization required`}
        description={body}
        type="error"
        showIcon
      />
    );
  }

  private renderRevokedAccessTokenError(): JSX.Element {
    const body = (
      <div>
        Your repos access token was revoked. Re-login to update it.
        <Row type="flex" justify="center">
          <a href={`${API_HOST}/v1/auth/user/relogin`}>
            <Button type="default" size="large">
              <Icon type="github" />
              Re-Login
            </Button>
          </a>
        </Row>
      </div>
    );
    return (
      <Alert
        message={`Repos access token is inactive`}
        description={body}
        type="warning"
        showIcon
      />
    );
  }

  public render() {
    return (
    <>
      <Helmet>
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="golangci.com" />
        <meta
          property="og:url"
          content={`${HOST}${this.props.location.pathname}${this.props.location.search}`}
        />
        <meta charSet="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <Layout className="layout">
        <Header />
        <Layout.Content className="content">
          {this.renderContent()}
        </Layout.Content>
        <Footer />
      </Layout>

      <ReduxToastr
        timeOut={4000}
        newestOnTop={false}
        preventDuplicates
        position="top-right"
        transitionIn="fadeIn"
        transitionOut="fadeOut"
        progressBar/>
    </>
    );
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  lastApiHttpCode: state.result ? state.result.lastApiResultHttpCode : null,
  lastApiErrorCode: state.result ? state.result.lastApiResultErrorCode : null,
  lastApiErrorMessage: state.result ? state.result.lastApiResultMessage : null,
  currentUser: state.auth.currentUser,
});

export default withRouter(connect<IStateProps, IDispatchProps, IOwnProps>(mapStateToProps)(App));
