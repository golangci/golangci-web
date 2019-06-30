import * as React from "react";
import AllPricingPlans from "components/blocks/AllPricingPlans";
import { Row, Button } from "antd";
import Helmet from "react-helmet";

const faqBlock = (
    <section className="home-section home-section-padded">
        <div className="home-section-content">
            <Row type="flex" justify="center">
                <p id="#faq" className="home-section-header">FAQ</p>
            </Row>
            <Row type="flex" justify="center">
                <div className="full-screen-image">
                    <h2>Is my code secure?</h2>
                    <p className="home-section-text">
                        Yes, it is secure. Code security is one of the most important aspects to us.
                        Learn more about <a target="_blank" href="https://github.com/golangci/golangci/wiki/GolangCI-Security">security in GolangCI</a>.
                    </p>

                    <h2>Which payment methods do you accept?</h2>
                    <p className="home-section-text">
                        We use <a target="_blank" href="https://paddle.com">Paddle</a> so we currently accept Visa, Mastercard, American Express, and PayPal.
                        Please <a href="mailto:denis@golangci.com">contact us</a> if your payment method is not supported.
                    </p>

                    <h2>Can I change or cancel my plan anytime?</h2>
                    <p className="home-section-text">
                        Yes, your plan can be canceled anytime from the "subscription" page in your account.
                        You can change your plan only manually by <a href="mailto:denis@golangci.com">contacting us</a>.
                    </p>

                    <h2>What is a user?</h2>
                    <p className="home-section-text">
                        A use is a unique GitHub committer (determined by Git commit author's email).
                    </p>
                </div>
            </Row>

            <Row type="flex" justify="center" className="next-row-in-section">
                <a href="mailto:denis@golangci.com">
                    <Button type="primary" size="large">
                    More questions? Contact us
                    </Button>
                </a>
            </Row>
        </div>
    </section>
);

const Pricing: React.StatelessComponent<any> = (props) => (
    <>
        <Helmet title={"GolangCI Pricing"} />
        <AllPricingPlans showLinkOnMoreDetails={false} />
        {faqBlock}
    </>
);

export default Pricing;
