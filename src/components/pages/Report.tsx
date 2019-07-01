import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Table, Tag, Alert, Tooltip, Switch, Button, Icon, Collapse } from "antd";
import { IAppStore } from "reducers";
import { IAnalysisState, IIssue, IWarning, fetchAnalysis, buildLogTogglePanels, IBuildLog, IBuildGroup } from "modules/analyzes";
import { processWarning } from "modules/utils/strings";
import moment from "moment";
import Helmet from "react-helmet";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github as codeStyle } from "react-syntax-highlighter/styles/hljs";
import { toggle, IStore as IToggleStore } from "modules/toggle";
import { isXsScreenWidth } from "modules/utils/device";
import { Link } from "react-router-dom";
import { getLoader } from "components/lib/loader";
import queryString from "query-string";

moment.locale("en");

const hideCodeToggleKey = "hideCode";
const showBuildLogToggleKey = "showBuildLog";
const showPrevAnalyzesToggleKey = "showPrevAnalyzes";

interface IStateProps {
  curAnalysis?: IAnalysisState;
  hideCode?: boolean;
  toggleMap: IToggleStore;
  lastApiErrorCode: string;
  buildLogActivePanels: string[];
}

interface IDispatchProps {
  fetchAnalysis(owner: string, name: string, prNumber?: number, commitSha?: string, analysisGuid?: string): void;
  toggle(name: string, value?: boolean): void;
  buildLogTogglePanels(keys: string[]): void;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class Report extends React.Component<IProps> {
  private onSwitchShowCode(): any {
    this.props.toggle(hideCodeToggleKey);
  }

  private fetchAnalysis() {
    const p = this.props.match.params;
    const qs = queryString.parse(this.props.location.search);
    this.props.fetchAnalysis(p.owner, p.name, Number(p.prNumber), qs.commit_sha, qs.analysisGuid);
  }

  public componentWillMount() {
    if (this.props.curAnalysis === null ||
        this.props.curAnalysis.GithubRepoName.toLowerCase() !==
        `${this.props.match.params.owner}/${this.props.match.params.name}`.toLowerCase()) {
      this.fetchAnalysis();
    }

    const qs = queryString.parse(this.props.location.search);
    if (qs.buildlog === "1") {
      this.props.toggle(showBuildLogToggleKey);
    }
  }

  public componentDidUpdate(prevProps: IProps) {
    if (prevProps.match.params !== this.props.match.params) {
      this.fetchAnalysis();
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

  private collapseLinterIssuesKey(linterName: string): string {
    return `linter_collapse_${linterName}`;
  }

  private onCollapseLinterIssues(linterName: string) {
    this.props.toggle(this.collapseLinterIssuesKey(linterName));
  }

  private renderIssuesFromLinterBlock(linterName: string, issues: IIssue[], sourceLinkBase: string) {
    issues = issues || [];

    const maxShownIssues = 3;
    const showCollapsing = issues.length > maxShownIssues;
    const needCollapse = !this.props.toggleMap[this.collapseLinterIssuesKey(linterName)];
    const issuesHiddenCount = showCollapsing ? issues.length - maxShownIssues : 0;

    return (
      <div className="report-linter-block">
        <List
          bordered
          itemLayout="horizontal"
          dataSource={needCollapse ? issues.slice(0, maxShownIssues) : issues}
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
        {showCollapsing && (
          <Button
            onClick={() => this.onCollapseLinterIssues(linterName)}
            icon={`${needCollapse ? "down" : "up"}-circle-o`}>
            {needCollapse ? `Show ${issuesHiddenCount} more issues` : `Show less issues`}
          </Button>
        )}
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
      status = <Tag color="red">Error</Tag>;
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
    case "not_found":
      status = <Tag color="red">Repo or branch not found</Tag>;
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
    let table = [
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
    ];

    if (ca.RepoAnalysisStatus && ca.RepoAnalysisStatus.DefaultBranch) {
      table.push({
        key: "row5",
        a: "Default Branch",
        b: <>{ca.RepoAnalysisStatus.DefaultBranch}</>,
      });
    }

    table = table.concat([
      {
        key: "row4",
        a: "Analyzed",
        b: <>{moment(ca.CreatedAt).fromNow()}</>,
      },
      {
        key: "row3",
        a: "Status",
        b: <>{status}</>,
      },
    ]);

    return (
      <Table
        className="report-table"
        showHeader={false}
        columns={columns}
        pagination={false}
        sortDirections={[]}
        dataSource={table}
      />
    );
  }

  private formatDuration(durationMs: number): string {
    return moment.duration(durationMs).asSeconds().toFixed(1) + "s";
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
        b: (<span>{this.formatDuration(t.DurationMs)}</span>),
      });
    }

    return (
      <Table
        className="report-table"
        showHeader={false}
        columns={columns}
        pagination={false}
        sortDirections={[]}
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

    if (!err && !warnings.length && !ca.NextAnalysisStatus && !ca.IsPreparing && !ca.RepoIsNotConnected && !ca.IsEmpty) {
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
            key="alert-being-prepared"
          />
        )}
        {ca.IsEmpty && (
          <Alert
            message={`Empty`}
            description={`Repo is empty`}
            type="info"
            showIcon
            key="alert-is-empty"
          />
        )}
        {ca.RepoIsNotConnected && (
          <Alert
            message={`Repo isn't connected`}
            description={`We show reports only for connected to GolangCI repos`}
            type="info"
            showIcon
            key="alert-repo-isnt-connected"
          />
        )}
        {ca.NextAnalysisStatus && (
          <Alert
            message={`Refreshing analysis...`}
            description={`Next analysis ${nextAnalysisDesc}`}
            type="info"
            showIcon
            key="alert-refreshing"
          />
        )}
        {err && (
          <Alert
            message="Error"
            description={processWarning(err, ", see build log")}
            type="error"
            showIcon
            key="alert-error"
          />
        )}
        {warnings.map((w) => (
          <Alert
            message={`Warning in ${w.Tag}`}
            description={processWarning(w.Text)}
            type="warning"
            showIcon
            key={`alert-warning-${w.Tag}`}
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

  private renderNeedAuthError(): JSX.Element {
    const body = (
      <div>
        Must be authorized to access a report for a private repo
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

  private renderNeedPrivateAccessTokenError(): JSX.Element {
    const body = (
      <div>
        We need an access to private repos to be able to show report for the private repo
        <Row type="flex" justify="center">
          <a href={`${API_HOST}/v1/auth/github/private`}>
            <Button
              type="primary"
              className="repos-grant-access-btn" icon="login">
              Grant Access
            </Button>
          </a>
        </Row>
      </div>
    );
    return (
      <Alert
        message={`Private Repos Access Required`}
        description={body}
        type="error"
        showIcon
      />
    );
  }

  private getBuildGroupText(sg: IBuildGroup): string {
    const lines: string[] = [];
    for (const step of sg.Steps) {
      lines.push(step.Description);
      if (step.OutputLines) {
        for (const line of step.OutputLines) {
          lines.push("    " + line);
        }
      }
      if (step.Error) {
        lines.push(`Error: ${step.Error}`);
      }
    }

    return lines.join("\n");
  }

  private doesGroupHaveError(sg: IBuildGroup): boolean {
    for (const step of sg.Steps) {
      if (step.Error) {
        return true;
      }
    }

    return false;
  }

  private renderNoAccessOrDoesntExistError(): JSX.Element {
    return (
      <Alert
        message={`Access Denied`}
        description="No access for the private repo or it doesn't exist"
        type="error"
        showIcon
      />
    );
  }

  private renderBuildLogArea(buildLog: IBuildLog): JSX.Element {
    return (
      <div className="report-build-log">
        <Collapse
          bordered={false}
          activeKey={this.props.buildLogActivePanels}
          onChange={(activePanels: string[]) => this.props.buildLogTogglePanels(activePanels)}
        >
          {buildLog.Groups.map((group, i) => (
            <Collapse.Panel
              header={
                <>
                  <span className="report-build-log-group-panel-text">
                    {group.Name + (group.Name !== "run goenvbuild" ? ` (${this.formatDuration(group.Duration / 1000000)})` : "")}
                  </span>
                  {this.doesGroupHaveError(group) ?
                    <span className="report-build-log-group-panel-tag"><Tag color="red">error</Tag></span> :
                    null}
                </>
              }
              key={i.toString()}
              className="report-build-log-group-panel"
            >
              <pre className="report-build-log-group-panel-text">{this.getBuildGroupText(group)}</pre>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    );
  }

  private renderToolBar(ca: IAnalysisState, issues: IIssue[], buildLog: IBuildLog, needShowBuildLog: boolean): JSX.Element {
    return (
      <Row type="flex" justify="end">
        <div className="report-toolbar">
          {buildLog && (
            <span className="report-toolbar-build-log-btn">
              <Button
                onClick={() => this.props.toggle(showBuildLogToggleKey)}
                type={ca.Status === "error" ? "danger" : "default"}
              >
                <Icon type={needShowBuildLog ? "up" : "down"} />
                {`${needShowBuildLog ? "Hide" : "Show"} Build Log`}
              </Button>
            </span>
          )}
          {(!isXsScreenWidth() && this.haveAtLeastOneSourceLine(issues)) && (
            <>
              <span className="report-show-code">Show Code</span>
              <Switch checked={!this.props.hideCode} onChange={this.onSwitchShowCode.bind(this)} />
            </>
          )}
        </div>
      </Row>
    );
  }

  private renderPrevAnalyzesTable(ca: IAnalysisState) {
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

    const rows = [];
    for (const a of ca.PreviousAnalyzes) {
      const link = (
        <Link
          onClick={() => this.props.toggle(showPrevAnalyzesToggleKey)}
          to={`/r/github.com/${ca.GithubRepoName}/pulls/${ca.GithubPullRequestNumber}?commit_sha=${a.CommitSHA}`}
        >
          {a.CommitSHA.substring(0, 7)}
        </Link>
      );
      rows.push({
        key: a.CommitSHA,
        a: moment(a.CreatedAt).fromNow(),
        b: link,
      });
    }

    return (
      <Table
        className="prev-analyzes-table"
        showHeader={false}
        columns={columns}
        pagination={false}
        sortDirections={[]}
        dataSource={rows} />
    );
  }

  private renderBody(ca: IAnalysisState, blocks: JSX.Element[], toolBar: JSX.Element, buildLogArea: JSX.Element): JSX.Element {
    const title = ca.GithubPullRequestNumber ?
      `Report for Pull Request ${ca.GithubRepoName}#${ca.GithubPullRequestNumber}` :
      `Report for Repo ${ca.GithubRepoName}`;

    const prevAnalyzes = this.props.toggleMap[showPrevAnalyzesToggleKey] && this.renderPrevAnalyzesTable(ca);

    return (
      <Row>
        <Helmet title={title} />
        <Col xs={{span: 24}} lg={{offset: 4, span: 16}}>
          <h2>Analysis of {ca.GithubRepoName}</h2>
          {!ca.IsPreparing && !ca.RepoIsNotConnected && !ca.IsEmpty && (
            <>
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
              {toolBar}
              {buildLogArea && (
                <Row>
                  <Col xs={24}>
                    {buildLogArea}
                  </Col>
                </Row>
              )}
            </>
          )}
          {this.renderMessages(ca)}
          {blocks.map((e, i) => <div key={`linter_block_${i}`}>{e}</div>)}
          {ca.GithubPullRequestNumber && (
            <Link to={`/r/github.com/${ca.GithubRepoName}`}>
              <Button
                icon="file-text">
                See repository report
              </Button>
            </Link>
          )}
          {ca.GithubPullRequestNumber && ca.PreviousAnalyzes && ca.PreviousAnalyzes.length && (
            <span className="prev-analyzes-btn">
              <Button onClick={() => this.props.toggle(showPrevAnalyzesToggleKey)}>
                <Icon type={this.props.toggleMap[showPrevAnalyzesToggleKey] ? "up" : "down"} />
                {`${this.props.toggleMap[showPrevAnalyzesToggleKey] ? "Hide" : "Show"} Previous Analyses`}
              </Button>
            </span>
          )}
          {prevAnalyzes && (
            <Row>
              <Col xs={12}>
                {prevAnalyzes}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    );
  }

  public render() {
    switch (this.props.lastApiErrorCode) {
    case "NEED_AUTH_TO_ACCESS_PRIVATE_REPO":
      return this.renderNeedAuthError();
    case "NEED_PRIVATE_ACCESS_TOKEN_TO_ACCESS_PRIVATE_REPO":
      return this.renderNeedPrivateAccessTokenError();
    case "NO_ACCESS_TO_PRIVATE_REPO_OR_DOESNT_EXIST":
      this.renderNoAccessOrDoesntExistError();
    }

    if (this.props.curAnalysis === null) {
      return getLoader();
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
    console.info("rendering ca", ca);
    const sourceLinkBase = `https://github.com/${ca.GithubRepoName}/blob/${ca.CommitSHA}`;

    const blocks: JSX.Element[] = [];
    for (const linterName of Object.keys(linterToIssues)) {
      const block = this.renderIssuesFromLinterBlock(linterName, linterToIssues[linterName], sourceLinkBase);
      blocks.push(block);
    }

    const buildLog = (ca.ResultJSON && ca.ResultJSON.BuildLog) ? ca.ResultJSON.BuildLog : null;

    const needShowBuildLog = this.props.toggleMap[showBuildLogToggleKey];
    let buildLogArea: JSX.Element = null;
    if (needShowBuildLog && buildLog) {
      buildLogArea = this.renderBuildLogArea(buildLog);
    }

    const toolBar = this.renderToolBar(ca, issues, buildLog, needShowBuildLog);

    return this.renderBody(ca, blocks, toolBar, buildLogArea);
  }
}

interface IParams {
  owner: string;
  name: string;
  prNumber: string;
}

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): IStateProps => {
  return {
    curAnalysis: (state.analyzes && state.analyzes.current) ? state.analyzes.current : null,
    hideCode: state.toggle.store[hideCodeToggleKey],
    toggleMap: state.toggle.store,
    lastApiErrorCode: state.result ? state.result.lastApiResultErrorCode : null,
    buildLogActivePanels: state.analyzes ? state.analyzes.buildLogActivePanels : null,
  };
};

const mapDispatchToProps: IDispatchProps = {
  fetchAnalysis,
  toggle,
  buildLogTogglePanels,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(Report);
