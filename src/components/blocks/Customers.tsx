import * as React from "react";
import { Row, Col } from "antd";
import classNames from "classnames";
import googleLogo from "assets/images/customers/google_logo.png";
import facebookLogo from "assets/images/customers/facebook_logo.png";
import redHatLogo from "assets/images/customers/red_hat_logo.png";
import yahooLogo from "assets/images/customers/yahoo_logo.png";
import ibmLogo from "assets/images/customers/ibm_logo.png";
import xiaomiLogo from "assets/images/customers/xiaomi_logo.png";
import samsungLogo from "assets/images/customers/samsung_logo.png";
import nytLogo from "assets/images/customers/nyt_logo.png";
import istioLogo from "assets/images/customers/istio_logo.png";
import zalandoLogo from "assets/images/customers/zalando_logo.png";
import awsLogo from "assets/images/customers/aws_logo.png";
import netflixLogo from "assets/images/customers/netflix_logo.png";

const usesCI = "usesCI";
const usesLint = "usesLint";

const customers = [
  ["Google", googleLogo, "google/keytransparency", usesCI],
  ["Facebook", facebookLogo, "facebookincubator/magma", usesLint],
  ["AWS", awsLogo, "aws/aws-xray-sdk-go", usesLint],
  ["Netflix", netflixLogo, "Netflix/titus-executor", usesLint, "img-responsive-80"],
  ["Yahoo!", yahooLogo, "yahoo/yfuzz", usesCI, "img-responsive-80"],
  ["IBM", ibmLogo, "ibm-developer/ibm-cloud-env-golang", usesLint, "img-responsive-80"],

  // second row
  ["Xiaomi", xiaomiLogo, "XiaoMi/soar", usesLint, "img-responsive-80"],
  ["Samsung", samsungLogo, "samsung-cnct/cluster-api-provider-ssh", usesLint, "img-responsive-100"],
  ["Istio", istioLogo, "istio/istio", usesCI, "img-responsive-80"],
  ["Zalando", zalandoLogo, "zalando/postgres-operator", usesCI, "img-responsive-80"],
  ["Red Hat", redHatLogo, "openshift/odo", usesCI],
  ["The New York Times", nytLogo, "NYTimes/encoding-wrapper", usesLint, "img-responsive-100"],
];

const mostStarredRepos = [
  "avelino/awesome-go",
  "syncthing/syncthing",
  "istio/istio",
  "ncw/rclone",
  "jesseduffield/lazygit",
  "tsenart/vegeta",
  "dgraph-io/dgraph",
  "future-architect/vuls",
  "dgraph-io/badger",
  "loadimpact/k6",
  "developer-learning/reading-go",
  "go-swagger/go-swagger",
  "gaia-pipeline/gaia",
  "montferret/ferret",
  "appleboy/gorush",
  "smallnest/rpcx",
  "michaelmure/git-bug",
  "tendermint/tendermint",
  "ovh/cds",
];

const renderCustomer = (cust: any) => (
  <Col xs={4}>
    <div className="flex-row-for-vertical-align">
      <a target="_blank" href={cust[3] === usesCI ? `https://golangci.com/r/github.com/${cust[2]}` : `https://github.com/${cust[2]}`}>
        <img
          className={classNames(cust[4] ? cust[4] : "img-responsive-50", "flex-vertical-align")}
          alt={`${cust[0]} Logo`}
          src={cust[1]}
        />
      </a>
    </div>
  </Col>
);

const getRandomConnectedRepos = (n: number) => {
  const shuffled = mostStarredRepos.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map((repo) => (
    <a target="_blank" href={`https://golangci.com/r/github.com/${repo}`}><b>{repo}</b></a>
  )).reduce((result, item) => <>{result}, {item}</>);
};

const Customers: React.StatelessComponent<any> = (props) => (
    <section className="home-section home-section-padded home-section-gradient">
      <div className="home-section-content">
        <Row type="flex" justify="center">
          <p id="customers" className="home-section-header">Thousands of companies trust GolangCI</p>
        </Row>
        <Row type="flex" align="middle">
          {customers.slice(0, customers.length / 2).map(renderCustomer)}
        </Row>
        <Row type="flex" align="middle" className="next-row-in-section">
          {customers.slice(customers.length / 2).map(renderCustomer)}
        </Row>
        <Row type="flex" justify="center" className="next-row-in-section">
          <div className="full-screen-image">
            <p className="home-section-text">Some random connected to GolangCI repos: {getRandomConnectedRepos(3)}</p>
          </div>
        </Row>
      </div>
    </section>
);

export default Customers;
