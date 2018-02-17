import * as React from 'react';
import { Layout } from 'antd';

const MyFooter: React.StatelessComponent<any> = () => (
    <Layout.Footer style={{ textAlign: 'center' }}>
      GolangCI ©{(new Date()).getFullYear()}
    </Layout.Footer>
);

export default MyFooter;
