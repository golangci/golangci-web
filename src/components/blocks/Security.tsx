import * as React from "react";
import { Row, Button } from "antd";

const Security: React.StatelessComponent<any> = (props) => (
    <section className="home-section home-section-padded">
      <div className="home-section-content">
        <Row type="flex" justify="center">
          <p id="why-us" className="home-section-header">Uncomfortable giving us access to your code?</p>
        </Row>
        <Row type="flex" justify="center">
              <div className="full-screen-image">
                <p className="home-section-text">
                  Don’t worry, we get it. Our mission is to help you maintain a clean code base, nothing more.
                  Our security documentation details what kind of access we need and why.
                </p>
              </div>
          </Row>
          <Row type="flex" justify="center" className="next-row-in-section">
            <a target="_blank" href="https://github.com/golangci/golangci/wiki/GolangCI-Security">
              <Button size="large">
                Read our security policy
              </Button>
            </a>
          </Row>
      </div>
    </section>
);

export default Security;
