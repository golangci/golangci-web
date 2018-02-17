import * as React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { IAppStore } from '../../reducers';
import { Layout, Menu, Popover, Icon, Row, Avatar } from 'antd';
import { MenuMode } from 'antd/lib/menu';
import Golangci from '../../assets/images/logo/golangci.svg';
import Go from '../../assets/images/logo/go.svg';
import Responsive from 'react-responsive';
import { toggle } from "../../modules/toggle";
import { checkAuth, IUser } from "../../modules/auth";
import { MobileScreen, DesktopScreen } from 'react-responsive-redux'

const isMobileMenuOpenedKey: string = "isMobileMenuOpened";

interface IStateProps {
  isMobileMenuOpened: boolean;
  currentUser?: IUser;
}

interface IDispatchProps {
  toggle(name: string, value?: boolean): void;
  checkAuth(): void;
}

interface IProps extends IStateProps, IDispatchProps {}

class MyHeader extends React.Component<IProps> {
  private handleIconClick() {
    this.props.toggle(isMobileMenuOpenedKey);
  }

  private handlePopoverVisibilityChange(visible: boolean) {
    this.props.toggle(isMobileMenuOpenedKey, visible);
  }

  componentWillMount() {
    this.props.checkAuth();
  }

  private getMenu(mode: MenuMode): JSX.Element {
    const needMenu = false;
    return needMenu ? (
      <Menu
        theme="light"
        mode={mode}
        defaultSelectedKeys={['2']}
        style={{ lineHeight: '64px' }}
      >
        {!this.props.currentUser && <Menu.Item key="1">Product</Menu.Item>}
        {!this.props.currentUser && <Menu.Item key="2">Pricing</Menu.Item>}
        <Menu.Item key="3">Documentation</Menu.Item>
        <Menu.Item key="4">FAQ</Menu.Item>
        {!this.props.currentUser && <Menu.Item key="5">About</Menu.Item>}
      </Menu>
    ) : null;
  }

  render() {
    return (
      <Layout.Header>
        <Row type="flex" className="header-row">
          <div className="logo" >
            <a href="/">
              <svg className="logo-svg" height="100%" viewBox="0 0 620 100">
                <Go x={0} height="100%" viewBox="0 0 100 100" />
                <Golangci x={120} height="100%" viewBox="0 0 500 100" />
              </svg>
            </a>
          </div>
          <DesktopScreen>{this.getMenu("horizontal")}</DesktopScreen>
          <MobileScreen>
            <Popover
                overlayClassName="popover-menu"
                placement="bottomRight"
                content={this.getMenu("inline")}
                trigger="click"
                visible={this.props.isMobileMenuOpened}
                arrowPointAtCenter
                onVisibleChange={this.handlePopoverVisibilityChange.bind(this)}
              >
                <Icon
                  className="nav-phone-icon"
                  type="menu-unfold"
                  onClick={this.handleIconClick.bind(this)}
                />
              </Popover>
          </MobileScreen>
          {this.props.currentUser && (
            <div className="header-account-block" >
              <Link to="/repos/github">
                {this.props.currentUser.avatarUrl ? (
                  <Avatar src={this.props.currentUser.avatarUrl} className="header-account-avatar" />
                ) : (
                  <Avatar icon="user" className="header-account-avatar" />
                )}
                {this.props.currentUser.name}
              </Link>
              <a className="header-account-logout" href={`${API_HOST}/v1/auth/logout`}>
                Logout
              </a>
            </div>
          )}
        </Row>
      </Layout.Header>
    )
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  isMobileMenuOpened: state.toggle.store[isMobileMenuOpenedKey],
  currentUser: state.auth.currentUser,
})

const mapDispatchToProps = {
  toggle,
  checkAuth,
};

export default connect<IStateProps, IDispatchProps, void>(mapStateToProps, mapDispatchToProps)(MyHeader);
