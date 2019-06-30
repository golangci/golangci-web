import * as React from "react";
import ProductIntro from "components/blocks/ProductIntro";
import WhyUs from "components/blocks/WhyUs";
import WhyDoYouNeedIt from "components/blocks/WhyDoYouNeedIt";
import SupportedLinters from "components/blocks/SupportedLinters";
import Customers from "components/blocks/Customers";
import { Row } from "antd";
import pullSuggestedChangeImage from "assets/images/product/pull_suggested_change.png";
import repoListImage from "assets/images/product/repo_list.png";
import reportSuccessfulImage from "assets/images/product/report_successful.png";
import pullDetailLinkImage from "assets/images/product/pull_detail_link.png";
import reportForRepoImage from "assets/images/product/report_of_repo_with_issues.png";
import buildLogImage from "assets/images/product/build_log.png";
import customBuildStepsImage from "assets/images/product/custom_build_steps.png";
import Helmet from "react-helmet";

const suggestedChangeBlock = (
    <section className="home-section home-section-padded">
        <div className="home-section-content">
            <Row type="flex" justify="center">
                <p id="automated-code-fixes" className="home-section-header">Automated Code Fixes</p>
            </Row>
            <Row type="flex" justify="center">
                <div className="full-screen-image">
                    <p className="home-section-text">For some linters, we can automatically fix your source code.</p>
                    <img className="img-responsive" alt="GolangCI suggested changes in GitHub Pull Requests" src={pullSuggestedChangeImage} />
                </div>
            </Row>
        </div>
    </section>
);

const repoListBlock = (
    <section className="home-section home-section-padded home-section-gradient">
        <div className="home-section-content">
            <Row type="flex" justify="center">
                <p id="#control-panel" className="home-section-header">Convenient Control Panel</p>
            </Row>
            <Row type="flex" justify="center">
                <div className="full-screen-image">
                    <p className="home-section-text">
                        Connect or disconnect GolangCI for repos. See repository reports. Filter repos by name or language.
                    </p>
                    <img className="img-responsive" alt="GolangCI control panel" src={repoListImage} />
                </div>
            </Row>
        </div>
    </section>
);

const reportsBlock = (
    <section className="home-section home-section-padded">
        <div className="home-section-content">
            <Row type="flex" justify="center">
                <p id="analysis-reports" className="home-section-header">Analysis Reports</p>
            </Row>

            <Row type="flex" justify="center">
                <div className="full-screen-image">
                    <p className="home-section-text">
                        We provide reports for performed analyzes. See an example of a report for analysis without found issues below.
                    </p>
                    <img className="img-responsive" alt="GolangCI successful report" src={reportSuccessfulImage} />
                </div>
            </Row>

            <Row type="flex" justify="center" className="next-row-in-section">
                <div className="full-screen-image">
                    <p className="home-section-text">
                        You can click on a <b>Details</b> link in a pull request status to view a report.
                    </p>
                    <img className="img-responsive" alt="GolangCI link to report in a pull request details" src={pullDetailLinkImage} />
                </div>
            </Row>

            <Row type="flex" justify="center" className="next-row-in-section">
                <div className="full-screen-image">
                    <p className="home-section-text">
                        We do reports for pull requests and repos (default branch in GitHub settings of the repo). See an example of a repo analysis report with found issues below.
                    </p>
                    <img className="img-responsive" alt="GolangCI report for the repo with found issues" src={reportForRepoImage} />
                </div>
            </Row>

            <Row type="flex" justify="center" className="next-row-in-section">
                <div className="full-screen-image">
                    <p className="home-section-text">
                        Reports contain a build log to get insights on how an analysis was performed: all commands, environments vars, etc.
                    </p>
                    <img className="img-responsive" alt="GolangCI build log in a report" src={buildLogImage} />
                </div>
            </Row>
        </div>
    </section>
);

const customBuildStepsBlock = (
    <section className="home-section home-section-padded home-section-gradient">
        <div className="home-section-content">
            <Row type="flex" justify="center">
                <p id="custom-build-steps" className="home-section-header">Custom Build Steps</p>
            </Row>
            <Row type="flex" justify="center">
                <div className="full-screen-image">
                    <p className="home-section-text">
                    You can <a target="_blank" href="https://github.com/golangci/golangci/wiki/Configuration#service-configuration">customize via <b>.golangci.yml</b></a> how
                        we run an analysis for a repo: install needed dependencies, generate code, etc.
                    </p>
                    <img className="img-responsive" alt="GolangCI custom build steps by .golangci.yml" src={customBuildStepsImage} />
                </div>
            </Row>
        </div>
    </section>
);

const Product: React.StatelessComponent<any> = (props) => (
    <>
        <Helmet title={"GolangCI Product"} />
       <ProductIntro showLinkOnMoreDetails={false} />
       {suggestedChangeBlock}
       {repoListBlock}
       {reportsBlock}
       {customBuildStepsBlock}
       <WhyUs/>
       <WhyDoYouNeedIt/>
       <SupportedLinters showDetails={true}/>
       <Customers />
    </>
);

export default Product;
