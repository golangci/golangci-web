import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { List, Row, Col, Button, Input, Modal, Tooltip, Card, Switch, Icon } from "antd";
import { createSelector } from "reselect";
import Highlighter from "react-highlight-words";
import { IAppStore } from "reducers";
import { fetchRepos, activateRepo, deactivateRepo, updateSearchQuery, IRepo, toggleShowMockForPrivateRepos, IOrganizations } from "modules/repos";
import { trackEvent } from "modules/utils/analytics";
import { toggle } from "modules/toggle";
import { postEvent } from "modules/events";
import { buildPricingPlan, Plan, payStandardPlanText } from "components/blocks/PricingTable";
import { Link } from "react-router-dom";
import { isXsScreenWidth } from "modules/utils/device";

interface IRepoGroup {
  name: string;
  repos: IRepo[];
}

interface IStateProps {
  repoGroups: IRepoGroup[];
  privateReposWereFetched: boolean;
  isAfterLogin: boolean;
  searchQuery: string;
  isModalWithPriceVisible: boolean;
  isModalNotImplementedVisible: boolean;
  showOnlyGoRepos: boolean;
  organizations: IOrganizations;
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

const toggleShowModalNotImplemented = "private repos not implemented";
const toggleShowOnlyGoRepos = "show only go repos";

class Repos extends React.Component<IProps> {
  private isLoadingOrNoData() {
    return this.props.repoGroups === null;
  }

  public componentWillMount() {
    if (this.isLoadingOrNoData()) { // false if SSR-ed
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
      trackEvent("click to activate private repo", analyticsPayload);
      this.props.postEvent("click to activate private repo", analyticsPayload);
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
    this.props.toggle(toggleShowModalNotImplemented, false);
  }

  private closeModalWithPrice() {
    trackEvent("disagreed with price while connecting private repo");
    this.props.postEvent("disagreed with price while connecting private repo");
    this.props.toggle(toggleShowMockForPrivateRepos, false);
  }

  private continueModalWithPrice() {
    trackEvent("agreed with price while connecting private repo");
    this.props.postEvent("agreed with price while connecting private repo");
    this.props.toggle(toggleShowMockForPrivateRepos, false);
    this.props.toggle(toggleShowModalNotImplemented, true);
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
            {buildPricingPlan(Plan.Standard, payStandardPlanText,
                              this.continueModalWithPrice.bind(this))}
          </div>
        </Modal>
      </>
    );
  }

  private wrapButtonWithDisablingHelp(btn: JSX.Element, isDisabled: boolean, helpText: string): JSX.Element {
    if (!isDisabled) {
      return btn;
    }

    return (
      <Tooltip placement="topLeft" title={helpText}>
        {btn}
      </Tooltip>
    );
  }

  private renderActionForRepo(r: IRepo) {
    const btnDisabled = !r.isAdmin;
    const helpText = "Only repo admins can manage the repo";

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
          {this.wrapButtonWithDisablingHelp(
            <Button
              onClick={() => this.onClick(false, r.isPrivate, r.name, r.id)}
              icon="close" type="danger"
              loading={r.isActivatingNow}
              disabled={btnDisabled}
            >
              Disconnect
            </Button>,
            btnDisabled, helpText)}
        </>
      );
    }

    return this.wrapButtonWithDisablingHelp(
      <Button
        onClick={() => this.onClick(true, r.isPrivate, r.name, null)}
        loading={r.isActivatingNow}
        disabled={btnDisabled}
      >
        Connect
      </Button>,
      btnDisabled, helpText);
  }

  private renderRepo(r: IRepo) {
    const title = this.props.searchQuery ?
      this.highlightRepoName(r.name) :
      r.name;

    return (
      <List.Item actions={[this.renderActionForRepo(r)]}>
        <List.Item.Meta title={title} />
      </List.Item>
    );
  }

  private renderList(repos: IRepo[]) {
    return (
      <List
        loading={repos === null}
        itemLayout="horizontal"
        dataSource={repos || []}
        renderItem={this.renderRepo.bind(this)}
        locale={{emptyText: "No repos"}}
      />
    );
  }

  private renderRepos() {
    if (this.isLoadingOrNoData()) {
      // TODO: use normal loader
      return <List loading={true} dataSource={[]} renderItem={(i: any) => (i)} />;
    }

    const ret = new Array<JSX.Element>();
    for (const group of this.props.repoGroups) {
      const org = this.props.organizations ? this.props.organizations[group.name] : null;
      const card = (
        <div className="org-card" key={`group-${group.name}`}>
          <Card
            title={group.name}
            type="inner"
            extra={org && org.hasActiveSubscription && this.wrapButtonWithDisablingHelp(
              <Link to={`/orgs/${org.provider}/${org.name}`}>
                <Button disabled={!org.isAdmin}><Icon type="setting" />Active Subscription</Button>
              </Link>,
              !org.isAdmin,
              "Only organization admins can manage it's subscription",
            )}
          >
            {this.renderList(group.repos)}
          </Card>
        </div>
      );
      ret.push(card);
    }

    return ret;
  }

  private onSwitchShowOnlyGoRepos() {
    this.props.toggle(toggleShowOnlyGoRepos, !this.props.showOnlyGoRepos);
  }

  private renderToolbox() {
    return (
      <>
        <Col sm={24} md={16} lg={12} xl={10} className="repos-toolbox-row">
          <Button
            onClick={this.refreshRepos.bind(this)}
            className="repos-refresh-btn"
            icon="sync"
            disabled={this.isLoadingOrNoData()}
          >
            Refresh list
          </Button>
          {!this.props.searchQuery && (
            <>
              <span className="report-show-code">Only Go Repos</span>
              <Switch
                checked={this.props.showOnlyGoRepos}
                onChange={this.onSwitchShowOnlyGoRepos.bind(this)}
                disabled={this.isLoadingOrNoData()}
              />
            </>
          )}
        </Col>
        <Col sm={24} md={8} lg={12} xl={14} className="repos-toolbox-row">
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

            {this.props.privateReposWereFetched === false ? (
              <>
                <h1 className="hr-title">Public Repos</h1>
                {this.renderRepos()}

                <h1 className="hr-title">Private Repos</h1>
                {this.renderGrantAccessBtn()}
              </>
            ) : this.renderRepos()}

            {this.renderModals()}
          </Col>
        </Row>
      </>
    );
  }
}

interface IParams {
}

const trueIfUndef = (v: boolean): boolean => v === undefined ? true : v;

const getAllRepos = (state: IAppStore) => state.repos.list ? state.repos.list.public.concat(state.repos.list.private) : null;
const getSearchQuery = (state: IAppStore) => state.repos.searchQuery || "";
const getLanguageFilter = (state: IAppStore) => trueIfUndef(state.toggle.store[toggleShowOnlyGoRepos]);
const filterReposBySearchQuery = (repos: IRepo[], q: string) => {
  if (repos === null) {
    return null;
  }

  if (q === "") {
    return repos;
  }

  return repos.filter((r) => r.name.toLowerCase().includes(q));
};
const filterReposByLanguage = (repos: IRepo[], needFilter: boolean, q: string) => {
  if (repos === null || !needFilter || q !== "") {
    return repos;
  }

  return repos.filter((r) => !r.language || r.language.toLowerCase() === "go");
};
const getSearchFilteredRepos = createSelector([getAllRepos, getSearchQuery], filterReposBySearchQuery);
const getAllFilteredRepos = createSelector([getSearchFilteredRepos, getLanguageFilter, getSearchQuery], filterReposByLanguage);
const splitReposByOrganization = (repos: IRepo[]): IRepoGroup[] => {
  if (repos === null) {
    return null;
  }

  const reposByOrg = new Map<string, IRepo[]>();
  for (const repo of repos) {
    const orgRepos = reposByOrg.get(repo.organization) || new Array<IRepo>();
    orgRepos.push(repo);
    reposByOrg.set(repo.organization, orgRepos);
  }

  const groups = new Array<IRepoGroup>();
  reposByOrg.forEach((orgRepos, org) => {
    groups.push({
      name: org,
      repos: orgRepos,
    });
  });

  groups.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return groups;
};
const getRepoGroups = createSelector(getAllFilteredRepos, splitReposByOrganization);

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): any => {
  return {
    repoGroups: getRepoGroups(state),
    privateReposWereFetched: state.repos.list ? state.repos.list.privateReposWereFetched : null,
    isAfterLogin: routeProps.location.search.includes("after=login"),
    searchQuery: getSearchQuery(state),
    isModalNotImplementedVisible: state.toggle.store[toggleShowModalNotImplemented],
    isModalWithPriceVisible: state.toggle.store[toggleShowMockForPrivateRepos],
    showOnlyGoRepos: trueIfUndef(state.toggle.store[toggleShowOnlyGoRepos]),
    organizations: state.repos.organizations,
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
