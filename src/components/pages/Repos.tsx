import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Button, Input, Modal, Tooltip } from "antd";
import { createSelector } from "reselect";
import Highlighter from "react-highlight-words";
import { IAppStore } from "reducers";
import { fetchRepos, activateRepo, deactivateRepo, updateSearchQuery, IRepo } from "modules/repos";
import { trackEvent } from "modules/utils/analytics";
import { toggle } from "modules/toggle";
import { postEvent } from "modules/events";
import { buildPricingPlan, Plan } from "components/blocks/PricingTable";
import { Link } from "react-router-dom";
import { isXsScreenWidth } from "modules/utils/device";

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
  activateRepo(name: string): void;
  deactivateRepo(name: string, id: number): void;
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

  private onClick(activate: boolean, isPrivate: boolean, name: string, id: number) {
    const analyticsPayload = {repoName: name};
    if (isPrivate) {
      this.props.toggle(modalWithPriceToggleName, true);
      trackEvent("click to activate private repo", analyticsPayload);
      this.props.postEvent("click to activate private repo", analyticsPayload);
      return;
    }

    if (activate) {
      this.props.activateRepo(name);
    } else {
      this.props.deactivateRepo(name, id);
    }
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
          <div className="generic_price_table">
            {buildPricingPlan(Plan.Standard, "Start FREE trial",
                              this.continueModalWithPrice.bind(this))}
          </div>
        </Modal>
      </>
    );
  }

  private wrapConnectButtonWithDisablingHelp(btn: JSX.Element, isDisabled: boolean): JSX.Element {
    if (!isDisabled) {
      return btn;
    }

    return (
      <Tooltip placement="topLeft" title="Only repo admins can manage the repo">
        {btn}
      </Tooltip>
    );
  }

  private renderActionForRepo(r: IRepo) {
    const btnDisabled = !r.isAdmin;

    if (r.isActivated) {
      return (
        <>
          {!r.isActivatingNow && !isXsScreenWidth() && (
            <Link to={`/r/github.com/${r.name}`}>
              <Button
                className="repos-report-btn"
                icon="file-text">
                Report
              </Button>
            </Link>
          )}
          {this.wrapConnectButtonWithDisablingHelp(
            <Button
              onClick={() => this.onClick(false, r.isPrivate, r.name, r.id)}
              icon="close" type="danger"
              loading={r.isActivatingNow}
              disabled={btnDisabled}
            >
              Disconnect
            </Button>,
            btnDisabled)}
        </>
      );
    }

    return this.wrapConnectButtonWithDisablingHelp(
      <Button
        onClick={() => this.onClick(true, r.isPrivate, r.name, null)}
        loading={r.isActivatingNow}
        disabled={btnDisabled}
      >
        Connect
      </Button>,
      btnDisabled);
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
  deactivateRepo,
  updateSearchQuery,
  toggle,
  postEvent,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(Repos);
