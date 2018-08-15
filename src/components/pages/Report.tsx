import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Table, Tag, Alert } from "antd";
import { IAppStore } from "reducers";
import { IAnalysisState, IIssue, IWarning, fetchAnalysis } from "modules/analyzes";
import { capitalizeFirstLetter } from "modules/utils/strings";
import moment from "moment";
import Helmet from "react-helmet";

moment.locale("en");

interface IStateProps {
  curAnalysis?: IAnalysisState;
}

interface IDispatchProps {
  fetchAnalysis(owner: string, name: string, prNumber?: number): void;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class Report extends React.Component<IProps> {
  public componentWillMount() {
    if (this.props.curAnalysis === null) { // false if SSR-ed
      const p = this.props.match.params;
      this.props.fetchAnalysis(p.owner, p.name, p.prNumber);
    }
  }

  private prettifyIssueText(text: string): JSX.Element {
    let desc = <>{text}</>;
    const splitDesc = text.split("`");
    if (splitDesc.length === 3) {
      desc = (
        <>
          {splitDesc[0]}
          <span className="var-name">{splitDesc[1]}</span>
          {splitDesc[2]}
        </>
      );
    }

    return desc;
  }

  private renderIssuesFromLinterBlock(linterName: string, issues: IIssue[], sourceLinkBase: string) {
    return (
      <div className="report-linter-block">
        <List
          loading={issues === null}
          bordered
          itemLayout="horizontal"
          dataSource={issues || []}
          header={<b>{linterName}</b>}
          renderItem={(i: IIssue) => (
            <List.Item>
              <List.Item.Meta
                description={this.prettifyIssueText(i.Text)}
              />
              <a target="_blank" href={`${sourceLinkBase}/${i.Pos.Filename}#L${i.Pos.Line}`}>{`${i.Pos.Filename}:${i.Pos.Line}`}</a>
            </List.Item>
          )}
          locale={{emptyText: "No issues!"}}
        />
      </div>
    );
  }

  private renderLeftTable(ca: IAnalysisState) {
    const columns = [
      {
        key: "columnA",
        dataIndex: "a",
        title: "a",
      },
      {
        key: "columnB",
        dataIndex: "b",
        title: "a",
      },
    ];

    const rj = ca.ResultJSON;
    const issuesCount = (rj && rj.GolangciLintRes && rj.GolangciLintRes.Issues) ?
      ca.ResultJSON.GolangciLintRes.Issues.length : 0;
    let status: JSX.Element;
    switch (ca.Status) {
    case "sent_to_queue":
      status = <Tag color="yellow">Sent to queue</Tag>;
      break;
    case "processing":
      status = <Tag color="yellow">Processing...</Tag>;
      break;
    case "processed/failure":
      status = <Tag color="red">Failure: found {issuesCount} issues</Tag>;
      break;
    case "processed/error":
    case "error":
      status = <Tag color="red">Internal Error</Tag>;
      break;
    case "processed/success":
      status = <Tag color="green">Success, no issues!</Tag>;
      break;
    case "processed":
      status = (issuesCount === 0) ?
        <Tag color="green">Success, no issues!</Tag> :
        <Tag color="red">Failure: found {issuesCount} issues</Tag>;
      break;
    case "forced_stale":
      status = <Tag color="red">Processing Timeout</Tag>;
      break;
    default:
      status = <Tag color="yellow">Unknown</Tag>;
      break;
    }

    const isPr = ca.GithubPullRequestNumber;
    const repoLink = `https://github.com/${ca.GithubRepoName}`;
    const codeLink = isPr ?
      `${repoLink}/pull/${ca.GithubPullRequestNumber}` :
      repoLink;
    const commitLink = isPr ?
      `${codeLink}/commits/${ca.CommitSHA}` :
      `${codeLink}/commit/${ca.CommitSHA}`;
    const codeName = isPr ? `${ca.GithubRepoName}#${ca.GithubPullRequestNumber}` : ca.GithubRepoName;
    const codeId = isPr ? "Pull Request" : "Repository";
    const table = [
      {
        key: "row1",
        a: codeId,
        b: (<a target="_blank" href={codeLink}>{codeName}</a>),
      },
      {
        key: "row2",
        a: "Commit",
        b: (<a target="_blank" href={commitLink}>{ca.CommitSHA}</a>),
      },
      {
        key: "row4",
        a: "Created",
        b: moment(ca.CreatedAt).fromNow(),
      },
      {
        key: "row3",
        a: "Status",
        b: status,
      },
    ];

    return (
      <Table
        showHeader={false}
        columns={columns}
        pagination={false}
        dataSource={table} />
    );
  }

  private renderRightTable(ca: IAnalysisState) {
    const columns = [
      {
        key: "columnA",
        dataIndex: "a",
        title: "a",
      },
      {
        key: "columnB",
        dataIndex: "b",
        title: "a",
      },
    ];

    const rj = ca.ResultJSON;
    const timings = (rj && rj.WorkerRes && rj.WorkerRes.Timings) ? rj.WorkerRes.Timings : [];
    const rows = [];
    for (const t of timings) {
      rows.push({
        key: t.Name,
        a: t.Name,
        b: (<span>{moment.duration(t.DurationMs).asSeconds().toFixed(1)}s</span>),
      });
    }

    return (
      <Table
        showHeader={false}
        columns={columns}
        pagination={false}
        dataSource={rows} />
    );
  }

  private renderWarningsErrors(ca: IAnalysisState) {
    let warnings: IWarning[] = [];
    const rj = ca.ResultJSON;
    if (rj && rj.WorkerRes && rj.WorkerRes.Warnings) {
      warnings = warnings.concat(rj.WorkerRes.Warnings);
    }
    if (rj && rj.GolangciLintRes && rj.GolangciLintRes.Report && rj.GolangciLintRes.Report.Warnings) {
      warnings = warnings.concat(rj.GolangciLintRes.Report.Warnings.map((w) => ({
        Tag: `golangci-lint/${w.Tag}`,
        Text: w.Text,
      })));
    }

    const err = (rj && rj.WorkerRes && rj.WorkerRes.Error) ? rj.WorkerRes.Error : null;

    if (!err && !warnings.length) {
      return null;
    }

    return (
      <div className="report-messages">
        {err && (
          <Alert
            message="Error"
            description={capitalizeFirstLetter(err)}
            type="error"
            showIcon
          />
        )}
        {warnings.map((w) => (
          <Alert
            message={`Warning in ${w.Tag}`}
            description={capitalizeFirstLetter(w.Text)}
            type="warning"
            showIcon
          />
        ))}
      </div>
    );
  }

  public render() {
    if (this.props.curAnalysis === null) {
      return this.renderIssuesFromLinterBlock("loading...", null, "");
    }

    const rj = this.props.curAnalysis.ResultJSON;
    const issues = (rj && rj.GolangciLintRes && rj.GolangciLintRes.Issues) ? rj.GolangciLintRes.Issues : [];

    const linterToIssues: any = {};
    for (const i of issues) {
      if (!linterToIssues[i.FromLinter]) {
        linterToIssues[i.FromLinter] = [];
      }

      linterToIssues[i.FromLinter].push(i);
    }

    const ca = this.props.curAnalysis;
    const sourceLinkBase = `https://github.com/${ca.GithubRepoName}/blob/${ca.CommitSHA}`;

    const blocks: JSX.Element[] = [];
    for (const linterName of Object.keys(linterToIssues)) {
      const block = this.renderIssuesFromLinterBlock(linterName, linterToIssues[linterName], sourceLinkBase);
      blocks.push(block);
    }

    return (
      <Row>
        <Helmet title={`Report for Pull Request ${ca.GithubRepoName}#${ca.GithubPullRequestNumber}`} />
        <Col offset={4} span={16}>
          <h2>Analysis of {ca.GithubRepoName}</h2>
          <div className="report-tables-container">
            <Row>
              <Col span={12}>
                <div className="status-table">
                  <h3>Status</h3>
                  {this.renderLeftTable(ca)}
                </div>
              </Col>
              <Col span={12}>
                <div className="timings-table">
                  <h3>Timings</h3>
                  {this.renderRightTable(ca)}
                </div>
              </Col>
            </Row>
          </div>
          {this.renderWarningsErrors(ca)}
          {blocks.map((e, i) => <div key={`linter_block_${i}`}>{e}</div>)}
        </Col>
      </Row>
    );
  }
}

interface IParams {
  owner: string;
  name: string;
  prNumber: number;
}

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): any => {
  return {
    curAnalysis: (state.analyzes && state.analyzes.current) ? state.analyzes.current : null,
  };
};

const mapDispatchToProps = {
  fetchAnalysis,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(Report);
