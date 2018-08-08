import * as React from "react";
import { Row, Col } from "antd";
import PricingPlan from "components/blocks/PricingPlan";

export enum Plan {
    OpenSource = "OpenSource",
    Standard = "Standard",
    Enterprise = "Enterprise",
}

export function buildPricingPlan(plan: Plan, buttonText: string, onButtonClick: () => void): JSX.Element {
    if (plan === Plan.OpenSource) {
        return (<PricingPlan
            name="Open Source"
            insteadOfPriceText="Free"
            features={[
                "Unlimited public repositories",
                "GitHub integration",
                "Automatic comments on pull request",
            ]}
            buttonText={buttonText}
            onButtonClick={onButtonClick}
            />);
    }

    if (plan === Plan.Standard) {
        return (
                <PricingPlan
                    name="Standard"
                    highlighted
                    price={20}
                    features={[
                        "Unlimited private repositories",
                        "Higher analysis priority",
                        "Priority support",
                    ]}
                    buttonText={buttonText}
                    onButtonClick={onButtonClick}
                />
        );
    }

    if (plan === Plan.Enterprise) {
        return (
            <PricingPlan
                name="Enterprise"
                insteadOfPriceText="Self-hosted"
                features={[
                    "For GitHub Enterprise",
                ]}
                buttonText={buttonText}
                onButtonClick={onButtonClick}
            />
        );
    }

    return null;
}

interface ITableProps {
    authorized: boolean;
    onButtonClick(chosenPlan: Plan): void;
}

export default class PricingTable extends React.Component<ITableProps> {
    public render() {
        return (
            <div className="generic_price_table">
                <section>
                    <Row type="flex" justify="center" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col lg={7} md={8} sm={12} className="pricing-plan-col">
                            {buildPricingPlan(Plan.OpenSource,
                                this.props.authorized ? "My Repos" : "Signup via GitHub",
                                () => this.props.onButtonClick(Plan.OpenSource))}
                        </Col>

                        <Col lg={7} md={8} sm={12} className="pricing-plan-col">
                            {buildPricingPlan(Plan.Standard,
                                this.props.authorized ? "My Repos" : "Signup for FREE trial",
                                () => this.props.onButtonClick(Plan.Standard))}
                        </Col>

                        <Col lg={7} md={8} sm={12} className="pricing-plan-col">
                            {buildPricingPlan(Plan.Enterprise,
                                "Request a Demo",
                                () => this.props.onButtonClick(Plan.Enterprise))}
                        </Col>
                    </Row>
            </section>
        </div>
        );
    }
}
