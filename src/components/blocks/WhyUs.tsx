import * as React from "react";
import { Row, Col } from "antd";
import Go from "assets/images/logo/go.svg";

const lines: JSX.Element[] = [
    (<>You will get the perfect Go code review because we are focused only on one language - <b>Go</b>. We are fine-tuning our tools for the best go code analysis.</>),
    (<>GolangCI is built by developers for developers. We believe in open source and GolangCI is an <a target="_blank" href="https://github.com/golangci/golangci?utm_source=golangci.com&utm_content=home_open_source">open source project</a>.</>),
];

const WhyUs: React.StatelessComponent<any> = (props) => (
    <section className="home-section home-section-padded">
      <div className="home-section-content">
        <Row type="flex" justify="center">
          <p id="why-us" className="home-section-header">Why us?</p>
        </Row>
        <Row>
          <Col xs={0} sm={6}>
            <Row type="flex" justify="center">
              <Go x={0} height="100%" viewBox="0 0 100 100" />
            </Row>
          </Col>
          <Col xs={24} sm={18}>
            {lines.map((e: JSX.Element, i: number) => (<p key={i} className="home-section-why-us-description">{e}</p>))}
          </Col>
        </Row>
      </div>
    </section>
);

export default WhyUs;
