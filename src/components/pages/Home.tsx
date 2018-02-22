import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Button, Icon, Row, Col, List } from 'antd';
import { Helmet } from "react-helmet";
import Octicon from 'react-component-octicons';
import Go from '../../assets/images/logo/go.svg';
import prCommentDemoImage from '../../assets/images/home/pr-comment-demo.png';
import githubStatusImage from '../../assets/images/home/github-status.png';
import reachGoal, { trackEvent } from '../../modules/utils/goals';

export default class Home extends React.Component<any> {
  private renderLintersSection() {
    const linters: any[] = [
      {
        name: "gofmt",
        desc: (<>Gofmt checks that code was gofmt-ed. We run this tool with <i>-s</i> option to check for simplification of code.</>),
        icon: <Octicon name="clippy" />,
      },
      {
        name: "goimports",
        desc: (<>Goimports does everything that gofmt does. Additionally it checks unused imports.</>),
        icon: <Octicon name="file" />,
      },
      {
        name: "golint",
        desc: (<>Golint differs from gofmt. Gofmt reformats Go source code, whereas golint prints out style mistakes.</>),
        icon: <Octicon name="checklist" />,
      },
      {
        name: "errcheck",
        desc: (<>Errcheck is a program for checking for unchecked errors in go programs. These unchecked errors can be critical bugs in some cases.</>),
        icon: <Octicon name="alert" />,
      },
    ];
    return (
      <section className="home-section home-section-linters hr-bordered-top home-section-padded">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p className="home-section-header">Linters</p>
          </Row>
          <Row type="flex" justify="center">
            <p className="home-section-linters-description">We run these linters on analyzed code:</p>
          </Row>
          <Row type="flex" justify="center">
            <List
              itemLayout="horizontal"
              dataSource={linters}
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
        </div>
      </section>
    )
  }

  private onGithubAuthClick(): boolean {
    reachGoal("auth", "go_to_github");
    trackEvent("clicked on github auth btn");
    return true;
  }

  private renderJumbotron() {
    return (
      <section className="home-jumbotron">
        <Row type="flex" justify="center">
          <h1 className="home-jumbotron-header">Automated code review for Go</h1>
        </Row>
        <Row type="flex" justify="center">
          <p className="home-jumbotron-subheader">GolangCI comments on issues in Github pull requests: bugs, style violations, anti-pattern instances</p>
        </Row>
        <Row type="flex" justify="center">
          <a href={`${API_HOST}/v1/auth/github`}>
            <Button onClick={this.onGithubAuthClick} type="primary" size="large">
              <Icon type="github" />
              Signup via Github
            </Button>
          </a>
        </Row>
      </section>
    )
  }

  private renderWhyDoYouNeedSection() {
    return (
      <section className="home-section-gradient home-section">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p className="home-section-header home-section-gradient-header">Why do you need automated code review tool?</p>
          </Row>
          <Row className="home-matter-row0">
            <Col md={2} sm={3} xs={6}>
              <div className="home-matter-column-icon home-matter-column-icon-full-svg">
                <Octicon name="watch"/>
              </div>
            </Col>
            <Col md={10} sm={9} xs={18}>
              <p className="home-matter-column-header">Reduce time spent on reviews</p>
              <p className="home-matter-column-text">GolangCI automatically detects issues instead of reviewers and writes comments in Github pull request.
              It dramatically saves time of reviewer.</p>
            </Col>

            <Col md={2} sm={3} xs={6}>
              <div className="home-matter-column-icon">
                <Octicon name="tasklist" zoom="90%"/>
              </div>
            </Col>
            <Col md={10} sm={9} xs={18}>
              <p className="home-matter-column-header">Reduce cost of code support</p>
              <p className="home-matter-column-text">When every line of code is written in the same style, the whole codebase becomes easier to read, understand and de-bug.</p>
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
              <p className="home-matter-column-text">Review faster, merge faster, deliver software faster. With competitors increasingly able to release new features within days or even hours, companies can no longer afford unpredictable, lengthy, and inefficient release processes.</p>
            </Col>
          </Row>
        </div>
      </section>
    )
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
    )
  }

  private renderPricingSection() {
    return (
      <section className="home-section-gradient home-section">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p id="pricing" className="home-section-header home-section-gradient-header">Free for Open Source. Forever</p>
          </Row>
          <Row type="flex" justify="center">
            <a href={`${API_HOST}/v1/auth/github`}>
              <Button onClick={this.onGithubAuthClick} type="primary" size="large">
                <Icon type="github" />
                Signup via Github
              </Button>
            </a>
          </Row>
        </div>
      </section>
    )
  }

  private renderWhyUsSection() {
    const lines: JSX.Element[] = [
      (<>You will get perfect Go code review because we are focused only on one language - <b>Go</b>. We are fine-tuning our tools for the best go code analysis.</>),
      (<>GolangCI is built by developers for developers. We believe in open source and GolangCI is an <a target="_blank" href="https://github.com/golangci/golangci?utm_source=golangci.com&utm_content=home_open_source">open source project</a>.</>)
    ];
    return (
      <section className="home-section home-section-padded">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p className="home-section-header">Why us?</p>
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
    )
  }

  private renderHead() {
    return <Helmet title="Automated code review for Go" />
  }

  render() {
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
    )
  }
}
