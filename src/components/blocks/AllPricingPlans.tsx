import * as React from "react";
import { HashLink as Link } from "react-router-hash-link";
import { connect } from "react-redux";
import { IAppStore } from "reducers";
import { Icon, Row, Button } from "antd";
import { checkAuth, IUser } from "modules/auth";

import PricingTable, { Plan } from "components/blocks/PricingTable";
import { push, LocationAction } from "react-router-redux";

interface IStateProps {
  currentUser?: IUser;
}

interface IDispatchProps {
  checkAuth(): void;
  push: LocationAction;
}

interface IOwnProps {
  showLinkOnMoreDetails: boolean;
}

interface IProps extends IStateProps, IDispatchProps, IOwnProps {}

class AllPricingPlans extends React.Component<IProps> {
  public componentWillMount() {
    this.props.checkAuth();
  }

  private onPricingPlanChoose(chosenPlan: Plan) {
    if (chosenPlan === Plan.Enterprise) {
      window.location.replace(`mailto:denis@golangci.com`);
      return;
    }

    if (!this.props.currentUser) {
      window.location.replace(`${API_HOST}/v1/auth/github`);
      return;
    }

    this.props.push("/repos/github");
  }

  public render() {
    return (
      <section className="home-section-gradient home-section">
        <div className="home-section-content">
          <Row type="flex" justify="center">
            <p id="pricing" className="home-section-header home-section-gradient-header">Pricing</p>
          </Row>

          <PricingTable
            authorized={this.props.currentUser ? true : false}
            onButtonClick={this.onPricingPlanChoose.bind(this)}
          />

          {this.props.showLinkOnMoreDetails && (
            <Row type="flex" justify="center" className="next-row-in-section">
              <Link to="/pricing">
                <Button type="primary" size="large">
                  <Icon type="info-circle" />
                  Learn more about pricing
                </Button>
              </Link>
            </Row>
          )}
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = {
  checkAuth,
  push,
};

export default connect<IStateProps, IDispatchProps, IOwnProps>(mapStateToProps, mapDispatchToProps)(AllPricingPlans);
