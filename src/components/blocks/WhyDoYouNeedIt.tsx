import * as React from "react";
import { Row, Col } from "antd";
import Octicon, {
  Bug, Checklist, Watch, Rocket,
} from "@primer/octicons-react";

const WhyDoYouNeedIt: React.StatelessComponent<any> = (props) => (
  <section className="home-section-gradient home-section">
    <div className="home-section-content">
      <Row type="flex" justify="center">
        <p className="home-section-header home-section-gradient-header">Why do you need it?</p>
      </Row>
      <Row className="home-matter-row0">
        <Col md={2} sm={3} xs={6}>
          <div className="home-matter-column-icon home-matter-column-icon-full-svg">
            <Octicon icon={Watch}/>
          </div>
        </Col>
        <Col md={10} sm={9} xs={18}>
          <p className="home-matter-column-header">Reduce time spent on reviews</p>
          <p className="home-matter-column-text">GolangCI automatically detects issues and writes comments in GitHub pull request.
          It dramatically saves a reviewer’s time.</p>
        </Col>

        <Col md={2} sm={3} xs={6}>
          <div className="home-matter-column-icon home-matter-column-icon-full-svg">
            <Octicon icon={Checklist}/>
          </div>
        </Col>
        <Col md={10} sm={9} xs={18}>
          <p className="home-matter-column-header">Reduce the cost of code support</p>
          <p className="home-matter-column-text">When every line of code is written in the same style, the whole codebase becomes easier to read, understand and debug.</p>
        </Col>
      </Row>

      <Row>
        <Col md={2} sm={3} xs={6}>
          <div className="home-matter-column-icon home-matter-column-icon-full-svg">
            <Octicon icon={Bug}/>
          </div>
        </Col>
        <Col md={10} sm={9} xs={18}>
          <p className="home-matter-column-header">Make your customers happy</p>
          <p className="home-matter-column-text">Reduce the number of bugs in production and testing environment.</p>
        </Col>

        <Col md={2} sm={3} xs={6}>
          <div className="home-matter-column-icon home-matter-column-icon-full-svg">
            <Octicon icon={Rocket}/>
          </div>
        </Col>
        <Col md={10} sm={9} xs={18}>
          <p className="home-matter-column-header">Reduce release cycle time</p>
          <p className="home-matter-column-text">Review faster, merge faster, and deliver software faster. With competitors increasingly able to release new features within days or even hours, companies can no longer afford unpredictable, lengthy, and inefficient release processes.</p>
        </Col>
      </Row>
    </div>
  </section>
);

export default WhyDoYouNeedIt;
