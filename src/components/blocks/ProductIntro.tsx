import * as React from "react";
import { Row, Button, Icon } from "antd";
import prCommentDemoImage from "assets/images/home/pr-comment-demo.png";
import githubStatusImage from "assets/images/home/github-status.png";
import { Link } from "react-router-dom";

interface IOwnProps {
  showLinkOnMoreDetails: boolean;
}

interface IProps extends IOwnProps {}

class ProductIntro extends React.Component<IProps> {
  public render() {
    return (
      <section className="home-section home-section-padded home-section-gradient">
          <div className="home-section-content">
            <Row type="flex" justify="center">
              <p id="integrated-with-github" className="home-section-header">Integrated with GitHub</p>
            </Row>
            <Row type="flex" justify="center">
              <div className="full-screen-image">
                <p className="home-section-text">GolangCI works with GitHub pull requests. It comments lines in a changed code with found issues.</p>

                <img className="img-responsive" alt="Demo of integration of GolangCI with GitHub Pull Requests" src={prCommentDemoImage} />
              </div>
            </Row>
            <Row type="flex" justify="center">
              <div className="home-github-status-demo">
                <p className="home-section-text">GolangCI sets a GitHub pull request status: success or failure (issues were found).</p>
                <img className="img-responsive" alt="Demo of integration of GolangCI with GitHub Commit Statuses" src={githubStatusImage} />
              </div>
            </Row>

            {this.props.showLinkOnMoreDetails && (
              <Row type="flex" justify="center" className="next-row-in-section">
                <Link to="/product">
                  <Button type="primary" size="large">
                    <Icon type="deployment-unit" />
                    See all features
                  </Button>
                </Link>
              </Row>
            )}
          </div>
        </section>
    );
  }
}

export default ProductIntro;
