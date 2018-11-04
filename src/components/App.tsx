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
  lastApiCode: number;
  currentUser?: IUser;
}

interface IDispatchProps {}
interface IOwnProps {}

interface IProps extends IStateProps, IDispatchProps, IOwnProps, RouteComponentProps<any> {}

class App extends React.Component<IProps> {
  public render() {
    let content = this.props.children;
    if (this.props.currentUser && this.props.lastApiCode === 403) {
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
      content = (
        <Alert
          message={`Repos access token is inactive`}
          description={body}
          type="warning"
          showIcon
        />
      );
    }
    return (
    <>
      <Helmet
        meta={[
          {property: "og:locale", content: "en_US"},
          {property: "og:site_name", content: "golangci.com"},
          {
            property: "og:url",
            content: `${HOST}${this.props.location.pathname}${this.props.location.search}`,
          },
          {charset: "utf-8"},
          {"http-equiv": "X-UA-Compatible", "content": "IE=edge"},
          {name: "viewport", content: "width=device-width, initial-scale=1.0"},
        ]}
      />

      <Layout className="layout">
        <Header />
        <Layout.Content className="content">
          {content}
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
  lastApiCode: state.result ? state.result.apiResultHttpCode : null,
  currentUser: state.auth.currentUser,
});

export default withRouter(connect<IStateProps, IDispatchProps, IOwnProps>(mapStateToProps)(App));
