import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Row, Col, Button } from "antd";
import { IAppStore } from "reducers";
import { fetchOrg, IOrg } from "modules/orgs";
import { trackEvent, reportError } from "modules/utils/analytics";
import { push, goBack } from "react-router-redux";
import { getLoader } from "components/lib/loader";
import { ISub, fetchSub, pollSub, updateSub, SubStatus } from "modules/subs";
import { checkAuth, IUser } from "modules/auth";
import { buildPricingPlan, Plan } from "components/blocks/PricingTable";
import { toastr } from "react-redux-toastr";
import { Decimal } from "decimal.js";

interface IStateProps {
  org: IOrg;
  sub: ISub;
  isSubUpdating: boolean;
  isSubCreating: boolean;

  // payment
  currentUser?: IUser;
}

interface IDispatchProps {
  fetchOrg(provider: string, name: string): void;
  fetchSub(provider: string, name: string): void;
  pollSub(provider: string, name: string): void;
  updateSub(seatsCount: number): void;

  checkAuth(): void;
  push(url: string): void;
  goBack(): void;
}

interface IParams {
  provider: string;
  orgName: string;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class SubUpdater extends React.Component<IProps> {
  private isLoadingOrNoData(props: IProps) {
    if (props.org === null || props.sub === null || props.currentUser === null) {
      return true;
    }

    const org = props.org;
    const p = props.match.params;
    return !(org.provider === p.provider && org.name === p.orgName);
  }

  public componentDidMount() {
    trackEvent("view subscription page");

    const p = this.props.match.params;
    if (this.isLoadingOrNoData(this.props)) { // false if SSR-ed
      this.props.fetchOrg(p.provider, p.orgName);
      this.props.fetchSub(p.provider, p.orgName);
      this.props.checkAuth();
      return;
    }
  }

  private openCheckoutOverlay() {
    const w: any = window;
    if (w === undefined) {
      return; // SSR
    }

    if (w.Paddle === undefined) {
      console.error("window.Paddle isn't defined");
      reportError("no paddle window property");
      toastr.error("Error", "Can't load Paddle payment form, please check that it's not blocked by ad blocking plugin");
      return;
    }

    const {org, sub} = this.props;
    const seatsCount = org.settings.seats.length;
    const checkoutConfig: any = {
      product: __DEV__ ? 547218 : 546200,
      quantity: seatsCount,
      email: this.props.currentUser.email,
      passthrough: JSON.stringify({
        userId: this.props.currentUser.id,
        orgProvider: org.provider,
        orgName: org.name,
      }),
    };
    if (sub.trialAllowanceInDays) {
      checkoutConfig.trialDays = sub.trialAllowanceInDays;
      checkoutConfig.trialDaysAuth = sub.paddleTrialDaysAuth;
    }

    w.Paddle.Checkout.open({
      ...checkoutConfig,
      loadCallback: () => {
        console.info("loaded paddle");
      },
      closeCallback: () => {
        console.warn("closed paddle");
        this.props.pollSub(org.provider, org.name); // user may close accidently, need to show created subscription
      },
      successCallback: (e: any) => {
        trackEvent("successfully subscribed");
        console.info("Successfully subscribed:", e);
        this.props.pollSub(org.provider, org.name);
      },
    });
  }

  public render() {
    if (this.props.isSubCreating) {
      return this.wrapBody(
        <>
          <h2>The payment is processing...</h2>
          {getLoader()}
        </>);
    }

    if (this.isLoadingOrNoData(this.props)) {
      return getLoader();
    }

    return this.wrapBody(this.renderBody());
  }

  private wrapBody(body: JSX.Element): JSX.Element {
    return (
      <>
        <Row>
          <Col offset={6} span={12}>
            {body}
          </Col>
        </Row>
      </>
    );
  }

  private renderActiveSubStatus(): JSX.Element {
    const {org, sub} = this.props;
    const priceTotal = new Decimal(sub.pricePerSeat).mul(sub.seatsCount);
    return <div>
      <p className="lead-font">
        Subscription for organization <b>{org.provider}/{org.name}</b> is active for {sub.seatsCount} seats, price is ${priceTotal.toString()}/month
      </p>
      <p className="unsubscribe-link">
        <a href={sub.cancelUrl} target="_blank">Stop subscription</a>
      </p>
    </div>;
  }

  private renderGoBackButton(): JSX.Element {
    return <Button disabled={this.props.isSubUpdating} onClick={() => this.props.goBack()}>Back</Button>;
  }

  private renderInactiveSubscription(): JSX.Element {
    const org = this.props.org;
    const orgSeatsCount = org.settings.seats.length;
    if (orgSeatsCount === 0) {
      return <>
          <p>You haven't set any user emails for the organization. Need to set at least one email to subscribe.</p>
          {this.renderGoBackButton()}
        </>;
    }

    const sub = this.props.sub;
    const buyText = sub.trialAllowanceInDays ? `Start ${sub.trialAllowanceInDays}-day free trial` : `Subscribe now`;

    return <>
        <h1>Configure Users for Organization ‘{org.provider}/{org.name}’</h1>
        <p>
          Pull Requests only from configured user emails will be analyzed.
          These settings will work only for the organization <b>{org.provider}/{org.name}</b>.
        </p>
        <div className="generic_price_table">
          {buildPricingPlan(Plan.Standard, buyText,
                            this.openCheckoutOverlay.bind(this), orgSeatsCount)}
        </div>
        <div>{this.renderGoBackButton()}</div>
      </>;
  }

  private renderActiveSubscription(): JSX.Element {
    const {org, sub} = this.props;
    const settings = org.settings;
    const orgSeatsCount = settings.seats.length;

    if (orgSeatsCount === sub.seatsCount) {
      // if user returned back or get to url manually
      return <>
          {this.renderActiveSubStatus()}
          <Button onClick={() => this.props.push(`/orgs/${org.provider}/${org.name}`)}>
            Back
          </Button>
        </>;
    }

    const priceTotal = new Decimal(sub.pricePerSeat).mul(orgSeatsCount);
    const seatsDiff = orgSeatsCount - sub.seatsCount;
    return <>
        {this.renderActiveSubStatus()}
        <p className="lead-font">You've configured {orgSeatsCount} ({seatsDiff > 0 ? "+" : ""}{seatsDiff}) users, the new price will be ${priceTotal.toString()}/month</p>
        <Button className="subscription-update-btn" type="primary" loading={this.props.isSubUpdating} onClick={() => this.props.updateSub(orgSeatsCount)}>
          Update subscription
        </Button>
        {this.renderGoBackButton()}
      </>;
  }

  private renderBody(): JSX.Element {
    const sub = this.props.sub;

    if (sub.status === SubStatus.Inactive) {
      return this.renderInactiveSubscription();
    }

    return this.renderActiveSubscription();
  }
}

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): IStateProps => {
  return {
    org: (state.orgs && state.orgs.current) ? state.orgs.current : null,
    sub: (state.subs && state.subs.current) ? state.subs.current : null,
    isSubUpdating: state.subs ? state.subs.isUpdating : false,
    isSubCreating: state.subs ? state.subs.isCreating : false,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = {
  checkAuth,
  fetchOrg,
  fetchSub,
  pollSub,
  updateSub,
  push,
  goBack,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(SubUpdater);
