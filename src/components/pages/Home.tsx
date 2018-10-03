import * as React from "react";
import { Button, Icon, Row, Col, List } from "antd";
import { Helmet } from "react-helmet";
import Octicon from "react-component-octicons";
import Go from "assets/images/logo/go.svg";
import prCommentDemoImage from "assets/images/home/pr-comment-demo.png";
import githubStatusImage from "assets/images/home/github-status.png";
import reachGoal, { trackEvent } from "modules/utils/analytics";
import { connect } from "react-redux";
import { IAppStore } from "reducers";
import { checkAuth, IUser } from "modules/auth";
import { Link } from "react-router-dom";
import PricingTable, { Plan } from "components/blocks/PricingTable";
import { push, LocationAction } from "react-router-redux";

interface IStateProps {
  currentUser?: IUser;
}

interface IDispatchProps {
  checkAuth(): void;
  push: LocationAction;
}

interface IProps extends IStateProps, IDispatchProps {}

class Home extends React.Component<IProps> {
  public componentWillMount() {
    this.props.checkAuth();
  }

  private renderLintersSection() {
    const enabledLinters: any[] = [
      {
        name: "go vet",
        desc: (<>Vet examines Go source code and reports suspicious constructs, such as <i>Printf</i> calls whose arguments do not align with the format string.</>),
        icon: <Octicon name="bug" />,
      },
      {
        name: "errcheck",
        desc: (<>Errcheck is a program for checking for unchecked errors in go programs. These unchecked errors can be critical bugs in some cases.</>),
        icon: <Octicon name="alert" />,
      },
      {
        name: "golint",
        desc: (<>Golint differs from gofmt. Gofmt reformats Go source code, whereas golint prints out style mistakes.</>),
        icon: <Octicon name="checklist" />,
      },
      {
        name: "staticcheck",
        desc: (<>Staticcheck is go vet on steroids, applying a ton of static analysis checks.</>),
        icon: <Octicon name="flame" />,
      },
      {
        name: "unused",
        desc: (<>Checks Go code for unused constants, variables, functions and types.</>),
        icon: <Octicon name="kebab-horizontal" />,
      },
      {
        name: "gosimple",
        desc: (<>Linter for Go source code that specialises on simplifying code.</>),
        icon: <Octicon name="primitive-dot" />,
      },
      {
        name: "gas",
        desc: (<>Inspects source code for security problems.</>),
        icon: <Octicon name="shield" />,
      },
      {
        name: "structcheck",
        desc: (<>Finds unused struct fields.</>),
        icon: <Octicon name="server" />,
      },
      {
        name: "varcheck",
        desc: (<>Finds unused global variables and constants.</>),
        icon: <Octicon name="x" />,
      },
      {
        name: "interfacer",
        desc: (<>Linter that suggests narrower interface types.</>),
        icon: <Octicon name="fold" />,
      },
      {
        name: "unconvert",
        desc: (<>Remove unnecessary type conversions.</>),
        icon: <Octicon name="versions" />,
      },
      {
        name: "ineffassign",
        desc: (<>Detects when assignments to existing variables are not used.</>),
        icon: <Octicon name="git-branch" />,
      },
      {
        name: "goconst",
        desc: (<>Finds repeated strings that could be replaced by a constant.</>),
        icon: <Octicon name="diff" />,
      },
      {
        name: "deadcode",
        desc: (<>Finds unused code.</>),
        icon: <Octicon name="git-compare" />,
      },
      {
        name: "gofmt",
        desc: (<>Gofmt checks whether code was gofmt-ed. We run this tool with <i>-s</i> option to check for code simplification.</>),
        icon: <Octicon name="clippy" />,
      },
      {
        name: "goimports",
        desc: (<>Goimports does everything that gofmt does. Additionally it checks unused imports.</>),
        icon: <Octicon name="file" />,
      },
    ];

    return (
      <section className="home-section home-section-linters hr-bordered-top home-section-padded">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p className="home-section-header">Linters</p>
          </Row>
          <Row type="flex" justify="center">
            <div>
              <p className="home-section-linters-description">
                By default next linters are used:
              </p>
            </div>
          </Row>
          <Row type="flex" justify="center">
            <List
              itemLayout="horizontal"
              dataSource={enabledLinters}
              renderItem={(linter: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={linter.icon}
                    title={linter.name}
                    description={linter.desc}
                  />
                </List.Item>
              )}
            />
          </Row>

          <Row>
            <div className="home-section-linters-how-are-run">
              We use all aforementioned linters by running <a target="_blank" href="https://github.com/golangci/golangci-lint">golangci-lint</a> on analyzed code in this way:
              <div className="well">
                golangci-lint run --new-from-patch=/path/to/patch/for/pull/request
              </div>
              <div>
                Some additional linters are disabled by default: dupl, gocyclo, typecheck, maligned, misspell, lll, unparam, nakedret, prealloc.
              </div>
              You can create <a target="_blank" href="https://github.com/golangci/golangci-lint#config-file"><b>.golangci.yml</b></a> to
              enable additional linters, disable some of default linters and customize their settings.
            </div>
          </Row>
        </div>
      </section>
    );
  }

  private onGithubAuthClick(): boolean {
    reachGoal("auth", "go_to_github");
    trackEvent("clicked on github auth btn");
    return true;
  }

  private renderPrimaryButton() {
    return this.props.currentUser ? (
      <Link to="/repos/github">
        <Button onClick={this.onGithubAuthClick} type="primary" size="large">
          <Icon type="bars" />
          My Repos
        </Button>
      </Link>
    ) : (
      <a href={`${API_HOST}/v1/auth/github`}>
        <Button onClick={this.onGithubAuthClick} type="primary" size="large">
          <Icon type="github" />
          Signup via GitHub
        </Button>
      </a>
    );
  }

  private renderJumbotron() {
    return (
      <section className="home-jumbotron">
        <Row type="flex" justify="center">
          <h1 className="home-jumbotron-header">Continuous Code Quality for Go</h1>
        </Row>
        <Row type="flex" justify="center">
          <p className="home-jumbotron-subheader">GolangCI detects and comments issues in GitHub pull requests: bugs, style violations, anti-pattern instances</p>
        </Row>
        <Row type="flex" justify="center">
          {this.renderPrimaryButton()}
        </Row>
      </section>
    );
  }

  private renderWhyDoYouNeedSection() {
    return (
      <section className="home-section-gradient home-section">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p className="home-section-header home-section-gradient-header">Why do you need it?</p>
          </Row>
          <Row className="home-matter-row0">
            <Col md={2} sm={3} xs={6}>
              <div className="home-matter-column-icon home-matter-column-icon-full-svg">
                <Octicon name="watch"/>
              </div>
            </Col>
            <Col md={10} sm={9} xs={18}>
              <p className="home-matter-column-header">Reduce time spent on reviews</p>
              <p className="home-matter-column-text">GolangCI automatically detects issues and writes comments in GitHub pull request.
              It dramatically saves reviewer’s time.</p>
            </Col>

            <Col md={2} sm={3} xs={6}>
              <div className="home-matter-column-icon">
                <Octicon name="tasklist" zoom="90%"/>
              </div>
            </Col>
            <Col md={10} sm={9} xs={18}>
              <p className="home-matter-column-header">Reduce cost of code support</p>
              <p className="home-matter-column-text">When every line of code is written in the same style, the whole codebase becomes easier to read, understand and debug.</p>
            </Col>
          </Row>

          <Row>
            <Col md={2} sm={3} xs={6}>
              <div className="home-matter-column-icon home-matter-column-icon-full-svg">
                <Octicon name="bug"/>
              </div>
            </Col>
            <Col md={10} sm={9} xs={18}>
              <p className="home-matter-column-header">Make your customers happy</p>
              <p className="home-matter-column-text">Reduce number of bugs in production and testing environment.</p>
            </Col>

            <Col md={2} sm={3} xs={6}>
              <div className="home-matter-column-icon home-matter-column-icon-full-svg">
                <Octicon name="rocket"/>
              </div>
            </Col>
            <Col md={10} sm={9} xs={18}>
              <p className="home-matter-column-header">Reduce release cycle time</p>
              <p className="home-matter-column-text">Review faster, merge faster, and deliver software faster. With competitors increasingly able to release new features within days or even hours, companies can no longer afford unpredictable, lengthy, and inefficient release processes.</p>
            </Col>
          </Row>
        </div>
      </section>
    );
  }

  private renderGithubIntegrationSection() {
    return (
      <section className="home-section home-section-padded">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p id="integrated-with-github" className="home-section-header">Integrated with GitHub</p>
          </Row>
          <Row type="flex" justify="center">
            <div className="home-pr-comment-demo">
              <p>GolangCI works with GitHub pull requests. It comments lines in changed code with found issues.</p>

              <img className="home-pr-comment-demo-img" alt="Demo of integration of GolangCI with GitHub Pull Requests" src={prCommentDemoImage} />
            </div>
          </Row>
          <Row type="flex" justify="center">
            <div className="home-github-status-demo">
              <p>GolangCI sets GitHub pull request status: success or failure (issues were found).</p>
              <img className="home-github-status-demo-img" alt="Demo of integration of GolangCI with GitHub Commit Statuses" src={githubStatusImage} />
            </div>
          </Row>
        </div>
      </section>
    );
  }

  private onPricingPlanChoose(chosenPlan: Plan) {
    if (chosenPlan === Plan.Enterprise) {
      window.location.replace(`mailto:denis@golangci.com`);
      return;
    }

    if (!this.props.currentUser) {
      window.location.replace(`${API_HOST}/v1/auth/github`);
      return;
    }

    this.props.push("/repos/github");
  }

  private renderPricingSection() {
    return (
      <section className="home-section-gradient home-section">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p id="pricing" className="home-section-header home-section-gradient-header">Pricing</p>
          </Row>

          <PricingTable
            authorized={this.props.currentUser ? true : false}
            onButtonClick={this.onPricingPlanChoose.bind(this)}
          />

        </div>
      </section>
    );
  }

  private renderWhyUsSection() {
    const lines: JSX.Element[] = [
      (<>You will get perfect Go code review because we are focused only on one language - <b>Go</b>. We are fine-tuning our tools for the best go code analysis.</>),
      (<>GolangCI is built by developers for developers. We believe in open source and GolangCI is an <a target="_blank" href="https://github.com/golangci/golangci?utm_source=golangci.com&utm_content=home_open_source">open source project</a>.</>),
    ];
    return (
      <section className="home-section home-section-padded">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p id="why-us" className="home-section-header">Why us?</p>
          </Row>
          <Row>
            <Col xs={0} sm={6}>
              <Row type="flex" justify="center">
                <Go x={0} height="100%" viewBox="0 0 100 100" />
              </Row>
            </Col>
            <Col xs={24} sm={18}>
              {lines.map((e: JSX.Element, i: number) => (<p key={i} className="home-section-why-us-description">{e}</p>))}
            </Col>
          </Row>
        </div>
      </section>
    );
  }

  private renderHead() {
    return <Helmet title="Automated code review for Go" />;
  }

  public render() {
    return (
      <>
        {this.renderHead()}
        {this.renderJumbotron()}
        {this.renderWhyDoYouNeedSection()}
        {this.renderGithubIntegrationSection()}
        {this.renderPricingSection()}
        {this.renderWhyUsSection()}
        {this.renderLintersSection()}
      </>
    );
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = {
  checkAuth,
  push,
};

export default connect<IStateProps, IDispatchProps, void>(mapStateToProps, mapDispatchToProps)(Home);
