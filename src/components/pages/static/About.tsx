import * as React from "react";
import { Row } from "antd";
import Helmet from "react-helmet";
import Customers from "components/blocks/Customers";

const Page: React.StatelessComponent<any> = (props) => (
    <>
        <Helmet title={"About GolangCI"} />
        <Row type="flex" justify="center">
            <div className="static-page-container">
                <h1>About Us</h1>
                <div className="increased-font">
                    <p>Used by over thousands of projects, and analyzing over 1 billion lines of code monthly, GolangCI delivers the best quality analysis of Go code.</p>
                </div>
                <p>Founded in 2018 by Denis Isaev. Golangci OÜ, Sepapaja 6, Tallinn 15551, Estonia.</p>
                <p>Get in touch: <a href="mailto:denis@golangci.com">denis@golangci.com</a></p>
            </div>
        </Row>
        <Customers />
    </>
);

export default Page;
