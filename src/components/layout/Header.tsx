import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { IAppStore } from "reducers";
import { Layout, Menu, Popover, Icon, Row, Avatar } from "antd";
import { MenuMode } from "antd/lib/menu";
import Golangci from "assets/images/logo/golangci.svg";
import Go from "assets/images/logo/go.svg";
import { toggle } from "modules/toggle";
import { checkAuth, IUser } from "modules/auth";
import { MobileScreen, DesktopScreen } from "react-responsive-redux";

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

  public componentWillMount() {
    this.props.checkAuth();
  }

  private getMenu(mode: MenuMode): JSX.Element {
    const menuItems = [];
    if (!this.props.currentUser) {
      menuItems.push(<Menu.Item key="1"><a href="/#integrated-with-github">Product</a></Menu.Item>);
      menuItems.push(<Menu.Item key="2"><a href="/#pricing">Pricing</a></Menu.Item>);
      menuItems.push(<Menu.Item key="3"><a target="_blank" href="https://medium.com/golangci">Blog</a></Menu.Item>);
      menuItems.push(<Menu.Item key="4"><a href={`${API_HOST}/v1/auth/github`}>Login</a></Menu.Item>);
    } else if (mode === "inline") {
      menuItems.push(<Menu.Item key="3"><Link to="/repos/github">Repos</Link></Menu.Item>);
      menuItems.push(<Menu.Item key="4">
        <a className="header-account-logout" href={`${API_HOST}/v1/auth/logout`}>
          Logout
        </a>
      </Menu.Item>);
    }
    return (
      <Menu theme="light" mode={mode} style={{ lineHeight: "64px" }}>
        {menuItems}
      </Menu>
    );
  }

  public render() {
    return (
      <Layout.Header>
        <Row type="flex" className="header-row">
          <div className="logo" >
            <Link to="/">
              <svg className="logo-svg" height="100%" viewBox="0 0 620 100">
                <Go x={0} height="100%" viewBox="0 0 100 100" />
                <Golangci x={120} height="100%" viewBox="0 0 500 100" />
              </svg>
            </Link>
          </div>
          <DesktopScreen>
            {this.getMenu("horizontal")}
          </DesktopScreen>
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
          <DesktopScreen>
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
          </DesktopScreen>
        </Row>
      </Layout.Header>
    );
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  isMobileMenuOpened: state.toggle.store[isMobileMenuOpenedKey],
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = {
  toggle,
  checkAuth,
};

export default connect<IStateProps, IDispatchProps, void>(mapStateToProps, mapDispatchToProps)(MyHeader);
