import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Table, Tag, Alert, Tooltip, Switch } from "antd";
import { IAppStore } from "reducers";
import { IAnalysisState, IIssue, IWarning, fetchAnalysis } from "modules/analyzes";
import { capitalizeFirstLetter } from "modules/utils/strings";
import moment from "moment";
import Helmet from "react-helmet";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github as codeStyle } from "react-syntax-highlighter/styles/hljs";
import { toggle } from "modules/toggle";
import { isXsScreenWidth } from "modules/utils/device";

moment.locale("en");

const hideCodeToggleKey = "hideCode";

interface IStateProps {
  curAnalysis?: IAnalysisState;
  hideCode?: boolean;
}

interface IDispatchProps {
  fetchAnalysis(owner: string, name: string, prNumber?: number): void;
  toggle(name: string, value?: boolean): void;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class Report extends React.Component<IProps> {
  private onSwitchShowCode(): any {
    this.props.toggle(hideCodeToggleKey);
  }

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

  private prettifyFilename(filename: string): string {
    return filename.split("/").pop();
  }

  private prettifySourceLine(line: string): string {
    return line.trim();
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
                description={<div className="report-issue-desc-block">
                  <div className="report-issue-text">{this.prettifyIssueText(i.Text)}</div>
                  {i.SourceLines && i.SourceLines.length !== 0 && !this.props.hideCode && !isXsScreenWidth() && (
                  <div className="report-source-code">
                    <SyntaxHighlighter
                      language="go"
                      style={codeStyle}
                    >
                      {this.prettifySourceLine(i.SourceLines[0])}
                    </SyntaxHighlighter>
                  </div>
                  )}
                </div>}
              />
              <a target="_blank" href={`${sourceLinkBase}/${i.Pos.Filename}#L${i.Pos.Line}`}>
                <Tooltip title={`${i.Pos.Filename}:${i.Pos.Line}`}>
                  {this.prettifyFilename(i.Pos.Filename)}
                </Tooltip>
              </a>
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
        width: "30%",
      },
      {
        key: "columnB",
        dataIndex: "b",
        title: "a",
        width: "70%",
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
    const codeId = isPr ? "Pull Request" : "Repo";
    const table = [
      {
        key: "row1",
        a: codeId,
        b: (<a target="_blank" href={codeLink}>{codeName}</a>),
      },
      {
        key: "row2",
        a: "Commit",
        b: (<a target="_blank" href={commitLink}>{ca.CommitSHA.substring(0, 7)}</a>),
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
        className="report-table"
        showHeader={false}
        columns={columns}
        pagination={false}
        dataSource={table}
      />
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
        className="report-table"
        showHeader={false}
        columns={columns}
        pagination={false}
        dataSource={rows} />
    );
  }

  private renderMessages(ca: IAnalysisState) {
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

    if (!err && !warnings.length && !ca.NextAnalysisStatus && !ca.IsPreparing) {
      return null;
    }

    const statusToText: any = {
      sent_to_queue: "was sent to queue",
      processing: "is processing",
      planned: "is planned",
    };

    let nextAnalysisDesc: string;
    if (ca.NextAnalysisStatus) {
      nextAnalysisDesc = statusToText[ca.NextAnalysisStatus] ? statusToText[ca.NextAnalysisStatus] : "is running";
    }

    return (
      <div className="report-messages">
        {ca.IsPreparing && (
          <Alert
            message={`Preparing analysis...`}
            description={`Analysis of repository is being prepared`}
            type="info"
            showIcon
          />
        )}
        {ca.NextAnalysisStatus && (
          <Alert
            message={`Refreshing analysis...`}
            description={`Next analysis ${nextAnalysisDesc}`}
            type="info"
            showIcon
          />
        )}
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

  private haveAtLeastOneSourceLine(issues: IIssue[]): boolean {
    for (const i of issues) {
      if (i.SourceLines && i.SourceLines.length !== 0) {
        return true;
      }
    }

    return false;
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
        <Col xs={{span: 24}} lg={{offset: 4, span: 16}}>
          <h2>Analysis of {ca.GithubRepoName}</h2>
          {!ca.IsPreparing && (
            <div className="report-tables-container">
              <Row>
                <Col xs={24} lg={12} className="report-table-col">
                  <div className="status-table">
                    <h3>Status</h3>
                    {this.renderLeftTable(ca)}
                  </div>
                </Col>
                <Col xs={24} lg={12} className="report-table-col">
                  <div className="timings-table">
                    <h3>Timings</h3>
                    {this.renderRightTable(ca)}
                  </div>
                </Col>
              </Row>
            </div>
          )}
          {!isXsScreenWidth() && this.haveAtLeastOneSourceLine(issues) && (
            <Row type="flex" justify="end">
              <div className="report-toolbar">
                <span className="report-show-code">Show Code</span>
                <Switch checked={!this.props.hideCode} onChange={this.onSwitchShowCode.bind(this)} />
              </div>
            </Row>
          )}
          {this.renderMessages(ca)}
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
    hideCode: state.toggle.store[hideCodeToggleKey],
  };
};

const mapDispatchToProps = {
  fetchAnalysis,
  toggle,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(Report);
