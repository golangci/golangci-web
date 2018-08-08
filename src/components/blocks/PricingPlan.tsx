import * as React from "react";
import classNames from "classnames";

interface IPlanProps {
    name: string;

    price?: number;
    insteadOfPriceText?: string;

    features: string[];

    onButtonClick(): void;
    buttonText: string;

    highlighted?: boolean;
}

export default class PricingPlan extends React.Component<IPlanProps> {
    public render() {
        return (
            <div className={classNames("generic_content", "clearfix", {active: this.props.highlighted})}>
                <div className="generic_head_price clearfix">
                    <div className="generic_head_content clearfix">
                        <div className="head_bg"></div>
                        <div className="head">
                            <span>{this.props.name}</span>
                        </div>
                    </div>
                    <div className="generic_price_tag clearfix">
                        <span className="price">
                            {this.props.insteadOfPriceText ? (
                                <span className="month">{this.props.insteadOfPriceText}</span>
                            ) : (
                                <>
                                    <span className="sign">$</span>
                                    <span className="currency">{this.props.price}</span>
                                    <span className="month">user/mo</span>
                                </>
                            )}
                        </span>
                    </div>
                </div>
                <div className="generic_feature_list">
                    <ul>
                        {this.props.features.map((f) => <li>{f}</li>)}
                    </ul>
                </div>
                <div className="generic_price_btn pricing-plan-button clearfix">
                    <a className="" href="#" onClick={() => { this.props.onButtonClick(); return false; }}>{this.props.buttonText}</a>
                </div>
            </div>
        );
    }
}
