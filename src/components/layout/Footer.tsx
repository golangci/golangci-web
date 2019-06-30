import * as React from "react";
import { Layout, Row, Button, Icon, Col } from "antd";
import { checkAuth, IUser } from "modules/auth";
import { IAppStore } from "reducers";
import { connect } from "react-redux";
import Golangci from "assets/images/logo/golangci.svg";
import Go from "assets/images/logo/go.svg";
import { HashLink as Link } from "react-router-hash-link";

interface IStateProps {
  currentUser?: IUser;
  lastApiHttpCode?: number;
}

interface IDispatchProps {
  checkAuth(): void;
}

interface IProps extends IStateProps, IDispatchProps {}

class Footer extends React.Component<IProps> {
  public componentWillMount() {
    this.props.checkAuth();
  }

  private wrapFooterCol(col: JSX.Element): JSX.Element {
    return (<Col lg={4} md={12} sm={12} xs={12}><div className="footer-col">{col}</div></Col>);
  }

  public render() {
    const wasOk = this.props.lastApiHttpCode === 200 || !this.props.lastApiHttpCode;
    return (
      <>
        {!this.props.currentUser && wasOk && (
        <section className="footer-section-call-to-action">
          <div>
            <Row type="flex" justify="center">
              <p className="home-section-header section-shadowed-header">Sign up and try GolangCI for free</p>
            </Row>
            <Row type="flex" justify="center">
              <a href={`${API_HOST}/v1/auth/github`}>
                <Button type="default" size="large">
                  <Icon type="github" />
                  Signup via GitHub
                </Button>
              </a>
            </Row>
          </div>
        </section>
        )}
        <Layout.Footer>
          <Row type="flex" justify="center" className="footer-row">
              <Col lg={6} md={24} sm={24} xs={24}>
                <div className="footer-col">
                  <Row type="flex" justify="center">
                    <div className="logo footer-logo" >
                      <Link to="/">
                        <svg className="logo-svg-responsive" viewBox="0 0 620 100">
                          <Go x={0} height="100%" viewBox="0 0 100 100" />
                          <Golangci x={120} height="100%" viewBox="0 0 500 100" />
                        </svg>
                      </Link>
                    </div>
                  </Row>
                  <Row type="flex" justify="center">
                    <p>
                      GolangCI is Copyright © {(new Date()).getFullYear()} Golangci OÜ.
                      The names and logos for GolangCI are trademarks of Golangci OÜ.
                    </p>
                  </Row>
                </div>
              </Col>

              {this.wrapFooterCol(
              <>
                <h5>Product</h5>
                <ul>
                  <li><Link to="/product#integrated-with-github">GitHub Integration</Link></li>
                  <li><Link to="/product#automated-code-fixes">Automated Code Fixes</Link></li>
                  <li><Link to="/product#control-panel">Control Panel</Link></li>
                  <li><Link to="/product#analysis-reports">Analysis Reports</Link></li>
                  <li><Link to="/product#custom-build-steps">Custom Build Steps</Link></li>
                  <li><Link to="/pricing">Pricing</Link></li>
                </ul>
              </>)}

              {this.wrapFooterCol(
              <>
                <h5>Company</h5>
                <ul>
                  <li><Link to="/about">About</Link></li>
                  <li><a target="_blank" href="https://medium.com/golangci">Blog</a></li>
                  <li><a target="_blank" href="https://github.com/golangci/golangci">GitHub</a></li>
                  <li><a target="_blank" href="https://github.com/golangci/golangci/wiki/GolangCI-Security">Security</a></li>
                </ul>
               </>)}

              {this.wrapFooterCol(
              <>
                <h5>Support</h5>
                <ul>
                  <li><a href="https://github.com/golangci/golangci/wiki" target="_blank">Documentation</a></li>
                  <li><a target="_blank" href="https://github.com/golangci/golangci/issues">Issue Tracker</a></li>
                  <li><Link to="/terms">Terms of Use</Link></li>
                  <li><Link to="/privacy">Privacy Policy</Link></li>
                </ul>
              </>)}

              {this.wrapFooterCol(
              <>
                <h5>Get In Touch</h5>
                <ul>
                  <li><a href="mailto:denis@golangci.com">Contact Us</a></li>
                  <li><a target="_blank" href="https://twitter.com/golangci">Twitter</a></li>
                  <li><a target="_blank" href="https://www.facebook.com/golangci/">Facebook</a></li>
                  <li><a target="_blank" href="https://github.com/golangci/golangci">GitHub</a></li>
                </ul>
              </>)}
          </Row>
        </Layout.Footer>
      </>
    );
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  currentUser: state.auth.currentUser,
  lastApiHttpCode: state.result ? state.result.lastApiResultHttpCode : null,
});

const mapDispatchToProps = {
  checkAuth,
};

export default connect<IStateProps, IDispatchProps, void>(mapStateToProps, mapDispatchToProps)(Footer);
