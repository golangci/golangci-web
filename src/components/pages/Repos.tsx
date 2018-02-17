import * as React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { IAppStore } from '../../reducers';
import { List, Icon, Row, Col, Button } from 'antd';
import { fetchRepos, activateRepo, IRepo } from "../../modules/repos";
import { MobileScreen, DesktopScreen } from 'react-responsive-redux'

interface IStateProps {
  repos: IRepo[];
}

interface IDispatchProps {
  fetchRepos(): void;
  activateRepo(activate: boolean, name: string): void;
}

interface IProps extends IStateProps, IDispatchProps {}

class Repos extends React.Component<IProps> {
  private handleRefreshClick() {
    this.props.fetchRepos();
  }

  componentWillMount() {
    if (this.props.repos === null) { // false if SSR-ed
      this.props.fetchRepos();
    }
  }

  private onClick(activate: boolean, name: string) {
    this.props.activateRepo(activate, name);
  }

  private renderRepo(): JSX.Element {
    return (
      <div/>
    );
  }

  private renderList() {
    return (
      <List
        loading={this.props.repos === null}
        itemLayout="horizontal"
        dataSource={this.props.repos || []}
        renderItem={(r: IRepo) => (
          <List.Item actions={[r.isActivated ?
            (<Button onClick={() => this.onClick(false, r.name)} icon="close" type="danger" loading={r.isActivatingNow}>Disconnect Repo</Button>) :
            (<Button onClick={() => this.onClick(true, r.name)} loading={r.isActivatingNow}>Connect Repo</Button>)
          ]}>
            <List.Item.Meta
              title={r.name}
            />
          </List.Item>
        )}
      />
    );
  }

  render() {
    return (
      <Row>
        <Col offset={4} span={16}>
          {this.renderList()}
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = (state: IAppStore): any => ({
  repos: state.repos.github,
})

const mapDispatchToProps = {
  fetchRepos,
  activateRepo,
};

export default connect<IStateProps, IDispatchProps, void>(mapStateToProps, mapDispatchToProps)(Repos);
