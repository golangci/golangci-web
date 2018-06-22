import * as React from "react";
import Header from "components/layout/Header";
import Footer from "components/layout/Footer";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router-dom";

import { Layout } from "antd";

import "css/sass/main.scss";
import "css/less/main.less";

import "react-redux-toastr/src/styles/index.scss";
import ReduxToastr from "react-redux-toastr";

const App: React.StatelessComponent<any> = (props) => (
  <>
    <Helmet
      meta={[
        {property: "og:locale", content: "en_US"},
        {property: "og:site_name", content: "golangci.com"},
        {
          property: "og:url",
          content: `${HOST}${props.location.pathname}${props.location.search}`,
        },
        {charset: "utf-8"},
        {"http-equiv": "X-UA-Compatible", "content": "IE=edge"},
        {name: "viewport", content: "width=device-width, initial-scale=1.0"},
      ]}
    />

    <Layout className="layout">
      <Header />
      <Layout.Content className="content">
        {props.children}
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

export default withRouter(App);
