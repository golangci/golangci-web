import * as React from "react";
import { List } from "antd";

export const getLoader = () => <List loading={true} dataSource={[]} renderItem={(i: any) => (i)} />;
