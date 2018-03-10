import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { IAppStore } from "../../reducers";
import { List, Row, Col, Button, Input } from "antd";
import { fetchRepos, activateRepo, updateSearchQuery, IRepo } from "../../modules/repos";
import { trackEvent } from "../../modules/utils/analytics";
import { createSelector } from "reselect";
import Highlighter from "react-highlight-words";

interface IStateProps {
  repos: IRepo[];
  isAfterLogin: boolean;
  searchQuery: string;
}

interface IDispatchProps {
  fetchRepos(refresh?: boolean): void;
  activateRepo(activate: boolean, name: string): void;
  updateSearchQuery(q: string): void;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class Repos extends React.Component<IProps> {
  public componentWillMount() {
    if (this.props.repos === null) { // false if SSR-ed
      this.props.fetchRepos();
    }

    if (this.props.isAfterLogin) {
      trackEvent("log in");
    }

    trackEvent("view repos list");
  }

  private onClick(activate: boolean, name: string) {
    this.props.activateRepo(activate, name);
    trackEvent(`${activate ? "connect" : "disconnect"} repo`, {repoName: name});
  }

  private refreshRepos() {
    this.props.fetchRepos(true);
    trackEvent("refresh repos list");
  }

  private highlightRepoName(name: string) {
    return <Highlighter
      highlightClassName="repos-highlighted-name"
      searchWords={[this.props.searchQuery]}
      autoEscape={true}
      textToHighlight={name}
    />;
  }

  private renderList() {
    return (
      <List
        loading={this.props.repos === null}
        itemLayout="horizontal"
        dataSource={this.props.repos || []}
        renderItem={(r: IRepo) => (
          <List.Item actions={[r.isActivated ?
            (<Button onClick={() => this.onClick(false, r.name)} icon="close" type="danger" loading={r.isActivatingNow}>Disconnect Repo</Button>) :
            (<Button onClick={() => this.onClick(true, r.name)} loading={r.isActivatingNow}>Connect Repo</Button>),
          ]}>
            <List.Item.Meta
              title={this.props.searchQuery ? this.highlightRepoName(r.name) : r.name}
            />
          </List.Item>
        )}
        locale={{emptyText: "No repos"}}
      />
    );
  }

  private renderToolbox() {
    return (
      <>
        <Col sm={24} md={8} className="repos-toolbox-row">
          <Button
            onClick={this.refreshRepos.bind(this)}
            className="repos-refresh-btn" icon="sync">
            Refresh list
          </Button>
        </Col>
        <Col sm={24} md={16} className="repos-toolbox-row">
          <Input.Search
            value={this.props.searchQuery}
            placeholder="Search by repo..."
            onChange={(v: any) => this.props.updateSearchQuery(v.target.value)}
          />
        </Col>
      </>
    );
  }

  public render() {
    return (
      <>
        <Row>
          <Col offset={4} span={16}>
            <Row>
              {this.renderToolbox()}
            </Row>

            {this.renderList()}
          </Col>
        </Row>
      </>
    );
  }
}

interface IParams {
}

const getAllRepos = (state: IAppStore) => state.repos.github;
const getSearchQuery = (state: IAppStore) => state.repos.searchQuery || "";
const filterReposBySearchQuery = (repos: IRepo[], q: string) => {
  if (q === "") {
    return repos;
  }

  return repos.filter((r) => r.name.toLowerCase().includes(q));
};
const getRepos = createSelector([getAllRepos, getSearchQuery], filterReposBySearchQuery);

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): any => {
  return {
    repos: getRepos(state),
    isAfterLogin: routeProps.location.search.includes("after=login"),
    searchQuery: getSearchQuery(state),
  };
};

const mapDispatchToProps = {
  fetchRepos,
  activateRepo,
  updateSearchQuery,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(Repos);
