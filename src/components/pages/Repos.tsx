import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Button, Input, Modal } from "antd";
import { createSelector } from "reselect";
import Highlighter from "react-highlight-words";
import { IAppStore } from "reducers";
import { fetchRepos, activateRepo, updateSearchQuery, IRepo } from "modules/repos";
import { trackEvent } from "modules/utils/analytics";
import { toggle } from "modules/toggle";
import { postEvent } from "modules/events";

interface IStateProps {
  publicRepos: IRepo[];
  privateRepos: IRepo[];
  privateReposWereFetched: boolean;
  isAfterLogin: boolean;
  searchQuery: string;
  isModalWithPriceVisible: boolean;
  isModalNotImplementedVisible: boolean;
}

interface IDispatchProps {
  fetchRepos(refresh?: boolean): void;
  activateRepo(activate: boolean, name: string): void;
  updateSearchQuery(q: string): void;
  toggle(name: string, value?: boolean): void;
  postEvent(name: string, payload?: object): void;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

const modalNotImplementedToggleName = "private repos not implemented";
const modalWithPriceToggleName = "price for private repos";

class Repos extends React.Component<IProps> {
  public componentWillMount() {
    if (this.props.publicRepos === null) { // false if SSR-ed
      this.props.fetchRepos();
    }

    if (this.props.isAfterLogin) {
      trackEvent("log in");
    }

    trackEvent("view repos list");
  }

  private onClick(activate: boolean, isPrivate: boolean, name: string) {
    const analyticsPayload = {repoName: name};
    if (isPrivate) {
      this.props.toggle(modalWithPriceToggleName, true);
      trackEvent("click to activate private repo", analyticsPayload);
      this.props.postEvent("click to activate private repo", analyticsPayload);
      return;
    }

    this.props.activateRepo(activate, name);
    trackEvent(`${activate ? "connect" : "disconnect"} repo`, analyticsPayload);
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

  private closeModalNotImplemented() {
    this.props.toggle(modalNotImplementedToggleName, false);
  }

  private closeModalWithPrice() {
    trackEvent("disagreed with price while connecting private repo");
    this.props.postEvent("disagreed with price while connecting private repo");
    this.props.toggle(modalWithPriceToggleName, false);
  }

  private continueModalWithPrice() {
    trackEvent("agreed with price while connecting private repo");
    this.props.postEvent("agreed with price while connecting private repo");
    this.props.toggle(modalWithPriceToggleName, false);
    this.props.toggle(modalNotImplementedToggleName, true);
  }

  private renderModals() {
    return (
      <>
        <Modal
          title="Sorry, not implemented"
          visible={this.props.isModalNotImplementedVisible}
          onCancel={this.closeModalNotImplemented.bind(this)}
          onOk={this.closeModalNotImplemented.bind(this)}
        >
          <p>Private repos aren't supported now :( We will inform you when it will be supported.</p>
          <p>Progress on this feature can be tracked via <a href="https://github.com/golangci/golangci/issues/4" target="_blank">GitHub Issue</a>.</p>
        </Modal>

        <Modal
          title="Pricing"
          visible={this.props.isModalWithPriceVisible}
          onCancel={this.closeModalWithPrice.bind(this)}
          onOk={this.continueModalWithPrice.bind(this)}
          okText="Continue"
        >
          <p className="repos-modal-pricing-text">Private repos support costs <b>$20</b> for 1 user per month. Repos count is unlimited.</p>
        </Modal>
      </>
    );
  }

  private renderActionForRepo(r: IRepo) {
    if (!r.isAdmin) {
      return <span>Only repo admins can connect repo</span>;
    }

    if (r.isActivated) {
      return (
        <Button
          onClick={() => this.onClick(false, r.isPrivate, r.name)}
          icon="close" type="danger"
          loading={r.isActivatingNow}>
          Disconnect
        </Button>
      );
    }

    return (
      <Button
        onClick={() => this.onClick(true, r.isPrivate, r.name)}
        loading={r.isActivatingNow}>
        Connect
      </Button>
    );
  }

  private renderList(repos: IRepo[]) {
    return (
      <List
        loading={repos === null}
        itemLayout="horizontal"
        dataSource={repos || []}
        renderItem={(r: IRepo) => (
          <List.Item actions={[this.renderActionForRepo(r)]}>
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

  private renderGrantAccessBtn() {
    return (
      <>
        <span>We need access to private repos in GitHub to show them</span>
        <a href={`${API_HOST}/v1/auth/github/private`}>
          <Button
            type="primary"
            className="repos-grant-access-btn" icon="login">
            Grant Access
          </Button>
        </a>
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

            <h1 className="hr-title">Public Repos</h1>
            {this.renderList(this.props.publicRepos)}
            <h1 className="hr-title">Private Repos</h1>
            {this.props.privateReposWereFetched === false ?
              this.renderGrantAccessBtn() :
              this.renderList(this.props.privateRepos)
            }

            {this.renderModals()}
          </Col>
        </Row>
      </>
    );
  }
}

interface IParams {
}

const getAllPublicRepos = (state: IAppStore) => state.repos.list ? state.repos.list.public : null;
const getAllPrivateRepos = (state: IAppStore) => state.repos.list ? state.repos.list.private : null;
const getSearchQuery = (state: IAppStore) => state.repos.searchQuery || "";
const filterReposBySearchQuery = (repos: IRepo[], q: string) => {
  if (q === "") {
    return repos;
  }

  return repos.filter((r) => r.name.toLowerCase().includes(q));
};
const getPublicRepos = createSelector([getAllPublicRepos, getSearchQuery], filterReposBySearchQuery);
const getPrivateRepos = createSelector([getAllPrivateRepos, getSearchQuery], filterReposBySearchQuery);

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): any => {
  return {
    publicRepos: getPublicRepos(state),
    privateRepos: getPrivateRepos(state),
    privateReposWereFetched: state.repos.list ? state.repos.list.privateReposWereFetched : null,
    isAfterLogin: routeProps.location.search.includes("after=login"),
    searchQuery: getSearchQuery(state),
    isModalNotImplementedVisible: state.toggle.store[modalNotImplementedToggleName],
    isModalWithPriceVisible: state.toggle.store[modalWithPriceToggleName],
  };
};

const mapDispatchToProps = {
  fetchRepos,
  activateRepo,
  updateSearchQuery,
  toggle,
  postEvent,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(Repos);
