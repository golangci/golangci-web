import * as React from "react";
import { Row } from "antd";

const Page: React.StatelessComponent<any> = (props) => (
    <Row type="flex" justify="center">
        <div className="static-page-container">
            <h1>About Us</h1>
            <div className="increased-font">
                <p>Used by over 1000 projects, and analyzing over 1 billion lines of code monthly, GolangCI delivers the best quality analysis of Go code.</p>
            </div>
            <p>Founded in 2018 by Denis Isaev. Sepapaja 6, Tallinn 15551, Estonia.</p>
            <p>Get in touch: <a href="mailto:denis@golangci.com">denis@golangci.com</a></p>
        </div>
    </Row>
);

export default Page;
