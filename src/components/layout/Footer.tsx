import * as React from 'react';
import { Layout, Row } from 'antd';

const MyFooter: React.StatelessComponent<any> = () => (
    <Layout.Footer>
      <Row type="flex" justify="center">
        <div className="footer-cell">
          GolangCI ©{(new Date()).getFullYear()}
        </div>
        <div className="footer-cell">
          <a target="_blank" href="https://github.com/golangci/golangci">GitHub</a>
        </div>
        <div className="footer-cell-last">
          <a target="_blank" href="https://github.com/golangci/golangci">Support</a>
        </div>
      </Row>
    </Layout.Footer>
);

export default MyFooter;
