import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Card, Table, Tag } from "antd";
import { IAppStore } from "reducers";
import { IAnalysisState, IIssue, fetchAnalysis } from "modules/analyzes";

interface IStateProps {
  curAnalysis?: IAnalysisState;
}

interface IDispatchProps {
  fetchAnalysis(owner: string, name: string, prNumber: number): void;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class Report extends React.Component<IProps> {
  public componentWillMount() {
    if (this.props.curAnalysis === null) { // false if SSR-ed
      const p = this.props.match.params;
      this.props.fetchAnalysis(p.owner, p.name, p.prNumber);
    }
  }

  private renderIssuesFromLinterBlock(linterName: string, issues: IIssue[], sourceLinkBase: string) {
    return (
      <div className="report-linter-block">
        <Card
          title={linterName}
          bordered
          hoverable
          >

          <List
            loading={issues === null}
            bordered
            itemLayout="horizontal"
            dataSource={issues || []}
            renderItem={(i: IIssue) => (
              <List.Item>
                <List.Item.Meta
                  title={i.Text}
                />
                <a target="_blank" href={`${sourceLinkBase}/${i.Pos.Filename}#L${i.Pos.Line}`}>{`${i.Pos.Filename}:${i.Pos.Line}`}</a>
              </List.Item>
            )}
            locale={{emptyText: "No issues!"}}
          />
        </Card>
      </div>
    );
  }

  private renderTable(ca: IAnalysisState) {
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

    const pullLink = `https://github.com/${ca.GithubRepoName}/pull/${ca.GithubPullRequestNumber}`;
    const rj = ca.ResultJSON;
    const issuesCount = (rj && rj.GolangciLintRes && rj.GolangciLintRes.Issues) ?
      ca.ResultJSON.GolangciLintRes.Issues.length : 0;
    const status = issuesCount === 0 ? (
      <Tag color="green">Success</Tag>
    ) : (<Tag color="red">Failure: found {issuesCount} issues</Tag>);

    const table = [
      {
        key: "row1",
        a: "Pull Request",
        b: (<a target="_blank" href={pullLink}>{`${ca.GithubRepoName}/${ca.GithubPullRequestNumber}`}</a>),
      },
      {
        key: "row2",
        a: "Commit",
        b: (<a target="_blank" href={`${pullLink}/commits/${ca.CommitSHA}`}>{ca.CommitSHA}</a>),
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
        dataSource={table} />
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
        <Col offset={4} span={16}>
          <h2>Analysis of {ca.GithubRepoName}</h2>
          {this.renderTable(ca)}
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
