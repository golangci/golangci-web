import React, { createRef } from "react";
import { connect } from "react-redux";
import { IAppStore } from "reducers";
import { Icon, Row, List, Button } from "antd";
import Octicon, {
    Bug, Alert, Checklist, Flame,
    Info, KebabHorizontal, PrimitiveDot, Shield,
    Server, X, Fold, Versions, GitBranch, Diff, GitCompare,
    Clippy, File, DiffRemoved, PrimitiveSquare, CircleSlash,
    Pencil, KebabVertical, Ellipsis, ShieldX, Graph, Stop,
    NoNewline, Dash, FileSubmodule,
  } from "@primer/octicons-react";
import { toggle, IStore as IToggleStore } from "modules/toggle";
import { HashLink as Link } from "react-router-hash-link";

const showLintersKey = "showLinters";

const supportedLinters: any[] = [
    {
      name: "go vet",
      desc: (<>Vet examines Go source code and reports suspicious constructs, such as <i>Printf</i> calls whose arguments do not align with the format string.</>),
      icon: Bug,
    },
    {
      name: "errcheck",
      desc: (<>Errcheck is a program for checking for unchecked errors in go programs. These unchecked errors can be critical bugs in some cases.</>),
      icon: Alert,
    },
    {
      name: "golint",
      desc: (<>Golint differs from gofmt. Gofmt reformats Go source code, whereas golint prints out style mistakes.</>),
      icon: Checklist,
    },
    {
      name: "staticcheck",
      desc: (<>Staticcheck is go vet on steroids, applying a ton of static analysis checks.</>),
      icon: Flame,
    },
    {
      name: "go-critic",
      desc: (<>The most opinionated Go source code linter.</>),
      icon: Info,
    },
    {
      name: "unused",
      desc: (<>Checks Go code for unused constants, variables, functions and types.</>),
      icon: KebabHorizontal,
    },
    {
      name: "gosimple",
      desc: (<>Linter for Go source code that specialises on simplifying code.</>),
      icon: PrimitiveDot,
    },
    {
      name: "gas",
      desc: (<>Inspects source code for security problems.</>),
      icon: Shield,
    },
    {
      name: "structcheck",
      desc: (<>Finds unused struct fields.</>),
      icon: Server,
    },
    {
      name: "varcheck",
      desc: (<>Finds unused global variables and constants.</>),
      icon: X,
    },
    {
      name: "interfacer",
      desc: (<>Linter that suggests narrower interface types.</>),
      icon: Fold,
    },
    {
      name: "unconvert",
      desc: (<>Remove unnecessary type conversions.</>),
      icon: Versions,
    },
    {
      name: "ineffassign",
      desc: (<>Detects when assignments to existing variables are not used.</>),
      icon: GitBranch,
    },
    {
      name: "goconst",
      desc: (<>Finds repeated strings that could be replaced by a constant.</>),
      icon: Diff,
    },
    {
      name: "deadcode",
      desc: (<>Finds unused code.</>),
      icon: GitCompare,
    },
    {
      name: "gofmt",
      desc: (<>Gofmt checks whether code was gofmt-ed. We run this tool with <i>-s</i> option to check for code simplification.</>),
      icon: Clippy,
    },
    {
      name: "goimports",
      desc: (<>Goimports does everything that gofmt does. Additionally it checks unused imports.</>),
      icon: File,
    },
    {
      name: "bodyclose",
      desc: (<>Checks whether HTTP response body is closed successfully.</>),
      icon: DiffRemoved,
    },
    {
      name: "gochecknoglobals",
      desc: (<>Checks that no globals are present in Go code.</>),
      icon: PrimitiveSquare,
    },
    {
      name: "gochecknoinits",
      desc: (<>Checks that no init functions are present in Go code.</>),
      icon: CircleSlash,
    },
    {
      name: "misspell",
      desc: (<>Finds commonly misspelled English words in comments.</>),
      icon: Pencil,
    },
    {
      name: "nakedret",
      desc: (<>Finds naked returns in functions greater than a specified function length.</>),
      icon: KebabVertical,
    },
    {
      name: "prealloc",
      desc: (<>Finds slice declarations that could potentially be preallocated.</>),
      icon: Ellipsis,
    },
    {
      name: "scopelint",
      desc: (<>Scopelint checks for unpinned variables in go programs.</>),
      icon: ShieldX,
    },
    {
      name: "lll",
      desc: (<>Reports long lines.</>),
      icon: KebabHorizontal,
    },
    {
      name: "maligned",
      desc: (<>Tool to detect Go structs that would take less memory if their fields were sorted.</>),
      icon: Graph,
    },
    {
      name: "dupl",
      desc: (<>Tool for code clone detection.</>),
      icon: Diff,
    },
    {
      name: "gocyclo",
      desc: (<>Computes and checks the cyclomatic complexity of functions.</>),
      icon: Stop,
    },
    {
      name: "typecheck",
      desc: (<>Like the front-end of a Go compiler, parses and type-checks Go code.</>),
      icon: NoNewline,
    },
    {
      name: "unparam",
      desc: (<>Reports unused function parameters.</>),
      icon: Dash,
    },
    {
      name: "depguard",
      desc: (<>Go linter that checks if package imports are in a list of acceptable packages.</>),
      icon: FileSubmodule,
    },
  ];

interface IStateProps {
    toggleMap: IToggleStore;
}

interface IDispatchProps {
  toggle(name: string, value?: boolean): void;
}

interface IOwnProps {
    showDetails: boolean;
}

interface IProps extends IStateProps, IDispatchProps, IOwnProps {}

class SupportedLinters extends React.Component<IProps> {
  private headerRef = createRef<HTMLDivElement>();

  private onButtonClick() {
    if (this.props.toggleMap[showLintersKey] && this.headerRef.current) {
      this.headerRef.current.focus();
    }
    this.props.toggle(showLintersKey);
  }

  public render() {
    const lintersToShowCount = 5;
    const lintersToShow = this.props.toggleMap[showLintersKey] ? supportedLinters : supportedLinters.slice(0, lintersToShowCount);

    return (
      <section className="home-section home-section-linters hr-bordered-top home-section-padded">
        <div className="home-section-content" id="linters" ref={this.headerRef}>
          <Row type="flex" justify="center">
            <p className="home-section-header">Linters</p>
          </Row>
          <Row type="flex" justify="center">
            <div>
              <p className="home-section-linters-description">
                We support the following linters:
              </p>
            </div>
          </Row>
          <Row type="flex" justify="center">
            <List
              itemLayout="horizontal"
              dataSource={lintersToShow}
              renderItem={(linter: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Octicon icon={linter.icon}/>}
                    title={linter.name}
                    description={linter.desc}
                  />
                </List.Item>
              )}
            />
          </Row>
          <Row type="flex" justify="center">
            {this.props.showDetails ? (
              <Button onClick={() => this.onButtonClick()}>
                <Icon type={this.props.toggleMap[showLintersKey] ? "up" : "down"} />
                {`${this.props.toggleMap[showLintersKey] ? "Less linters" : `Show ${supportedLinters.length - lintersToShowCount} more linters`} `}
              </Button>
            ) : (
              <Link to="/product#linters">
                <Button>
                  <Icon type="bars" />
                  {`See all ${supportedLinters.length} linters`}
                </Button>
              </Link>
            )}
          </Row>

          {this.props.showDetails && (
          <Row>
            <div className="home-section-linters-how-are-run">
              We run the aforementioned linters by running <a target="_blank" href="https://github.com/golangci/golangci-lint">golangci-lint</a> on analyzed code in this way:
              <div className="well">
                golangci-lint run --new-from-patch=/path/to/patch/for/pull/request
              </div>
              <div>
                By default, only <a target="_blank" href="https://github.com/golangci/golangci-lint#enabled-by-default-linters">some of these linters</a> are enabled.
                You can create <a target="_blank" href="https://github.com/golangci/golangci/wiki/Configuration"><b>.golangci.yml</b></a> to
                enable additional linters, disable some of the default linters and customize their settings.
              </div>
            </div>
          </Row>
          )}
        </div>
      </section>
    );
    }
}

const mapStateToProps = (state: IAppStore): any => ({
    toggleMap: state.toggle.store,
});

const mapDispatchToProps = {
    toggle,
};

export default connect<IStateProps, IDispatchProps, IOwnProps>(mapStateToProps, mapDispatchToProps, null, { withRef: true })(SupportedLinters);
