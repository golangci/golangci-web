import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Row, Col, Button, Input, Icon, Form } from "antd";
import { IAppStore } from "reducers";
import { fetchOrg, IOrg, ISeat, changeSettingsSeat, addSettingsSeat, clearSettingsSeat, saveOrg } from "modules/orgs";
import { trackEvent } from "modules/utils/analytics";
import FormItem from "antd/lib/form/FormItem";
import { push } from "react-router-redux";
import { getLoader } from "components/lib/loader";
import { ISub, fetchSub } from "modules/subs";
import Helmet from "react-helmet";

interface IStateProps {
  org: IOrg;
  sub: ISub; // needed only in modules/orgs to decide where to go after submitting
  isOrgSaving: boolean;
}

interface IDispatchProps {
  fetchOrg(provider: string, name: string): void;
  changeSettingsSeat(pos: number, email: string): void;
  addSettingsSeat(): void;
  clearSettingsSeat(i: number): void;
  saveOrg(isBackground: boolean): void;

  fetchSub(provider: string, name: string): void;

  push(url: string): void;
}

interface IParams {
  provider: string;
  orgName: string;
}

interface IProps extends IStateProps, IDispatchProps, RouteComponentProps<IParams> {}

class OrgSettings extends React.Component<IProps> {
  private isLoadingOrNoData(props: IProps) {
    if (props.org === null || props.sub === null) {
      return true;
    }

    const org = props.org;
    const p = props.match.params;
    return !(org.provider === p.provider && org.name.toUpperCase() === p.orgName.toUpperCase());
  }

  public componentDidMount() {
    if (this.isLoadingOrNoData(this.props)) { // false if SSR-ed
      const p = this.props.match.params;
      this.props.fetchOrg(p.provider, p.orgName);
      this.props.fetchSub(p.provider, p.orgName);
    }

    trackEvent("view org settings");
  }

  private onEmailInputChange(i: number, v: string) {
    this.props.changeSettingsSeat(i, v);
  }

  private isValidEmailInput(email: string): boolean {
    if (!email) {
      return true;
    }

    // https://stackoverflow.com/a/46181/5774603
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  private areAllEmailInputsValid(): boolean {
    return this.props.org.settings.seats.every((s) => this.isValidEmailInput(s.email));
  }

  private renderInput(s: ISeat, i: number, seatsCount: number) {
    const suffix = s.email ?
      <Icon
        type="close-circle"
        onClick={() => {
          this.props.clearSettingsSeat(i);
          this.props.saveOrg(true);
        }}
      /> : null;

    const isValid = this.isValidEmailInput(s.email);

    return (
      <div className="orgs-seat-input" key={`seat-email-input-${i}`}>
        <FormItem
          validateStatus={isValid ? "success" : "error"}
          help={isValid ? "" : "Should be a valid email"}
        >
          <Input
            placeholder="Enter email"
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            suffix={suffix}
            value={s ? s.email : ""}
            onChange={(ev) => {
              this.onEmailInputChange(i, ev.target.value);
            }}
            onBlur={() => this.props.saveOrg(true)}
          />
        </FormItem>
      </div>
    );
  }

  public render() {
    if (this.isLoadingOrNoData(this.props)) {
      return getLoader();
    }

    const org =  this.props.org;
    const settings = org.settings;
    const seats = settings.seats.length ? settings.seats : [{email: ""}];

    return (
      <>
        <Helmet title={`Organization ${org.provider}/${org.name} Settings`} />
        <Row>
          <Col offset={6} span={12}>
            <h1>Configure Users for Organization ‘{org.provider}/{org.name}’</h1>
            <p>
              Pull Requests only from configured user emails will be analyzed.
              These settings will work only for the organization <b>{org.provider}/{org.name}</b>.
            </p>
            <Form
              onSubmit={(e) => {
                this.props.saveOrg(false);
                e.preventDefault();
                e.stopPropagation();
               }}
            >
              {seats.map((s, i) => this.renderInput(s, i, seats.length))}
              <FormItem>
                <Button
                  type="dashed"
                  onClick={() => this.props.addSettingsSeat()}
                  disabled={!seats[seats.length - 1].email || !this.areAllEmailInputsValid()}
                >
                  <Icon type="plus" /> Add User
                </Button>
              </FormItem>
              <div className="orgs-form-actions">
                <Button
                  disabled={this.props.isOrgSaving || !this.areAllEmailInputsValid()}
                  onClick={() => this.props.push("/repos/github")}
                >
                  Back to repo list
                </Button>
                <Button
                  loading={this.props.isOrgSaving}
                  disabled={!this.areAllEmailInputsValid()}
                  type="primary"
                  htmlType="submit"
                  className="orgs-form-actions-next"
                >
                  Next
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state: IAppStore, routeProps: RouteComponentProps<IParams>): IStateProps => {
  return {
    org: (state.orgs && state.orgs.current) ? state.orgs.current : null,
    sub: (state.subs && state.subs.current) ? state.subs.current : null,
    isOrgSaving: state.orgs ? state.orgs.isSaving : false,
  };
};

const mapDispatchToProps = {
  fetchOrg,
  changeSettingsSeat,
  addSettingsSeat,
  clearSettingsSeat,
  saveOrg,
  fetchSub,
  push,
};

export default connect<IStateProps, IDispatchProps, RouteComponentProps<IParams>>(mapStateToProps, mapDispatchToProps)(OrgSettings);
