import * as React from "react";
import { Layout, Row, Button, Icon, Col } from "antd";
import { checkAuth, IUser } from "modules/auth";
import { IAppStore } from "reducers";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Golangci from "assets/images/logo/golangci.svg";
import Go from "assets/images/logo/go.svg";

interface IStateProps {
  currentUser?: IUser;
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
    return (
      <>
        {!this.props.currentUser && (
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
                      GolangCI is Copyright © {(new Date()).getFullYear()} GolangCI LLC.
                      The names and logos for GolangCI are trademarks of GolangCI LLC.
                    </p>
                  </Row>
                </div>
              </Col>

              {this.wrapFooterCol(
              <>
                <h5>Product</h5>
                <ul>
                  <li><a href="/#integrated-with-github">Product</a></li>
                  <li><a href="/#why-us">Why GolangCI</a></li>
                  <li><a href="/#pricing">Pricing</a></li>
                </ul>
              </>)}

              {this.wrapFooterCol(
              <>
                <h5>Company</h5>
                <ul>
                  <li><a target="_blank" href="https://medium.com/golangci">Blog</a></li>
                  <li><a target="_blank" href="https://github.com/golangci/golangci">GitHub</a></li>
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
});

const mapDispatchToProps = {
  checkAuth,
};

export default connect<IStateProps, IDispatchProps, void>(mapStateToProps, mapDispatchToProps)(Footer);
