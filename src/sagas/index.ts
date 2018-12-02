import { all } from "redux-saga/effects";
import { getWatchers as authWatchers } from "modules/auth";
import { getWatchers as reposWatchers } from "modules/repos";
import { getWatchers as eventWatchers } from "modules/events";
import { getWatchers as analyzesWatchers } from "modules/analyzes";
import { getWatchers as orgsWatcher } from "modules/orgs";
import { getWatchers as subsWatcher } from "modules/subs";

export default function* root() {
  yield all([
    authWatchers(),
    reposWatchers(),
    eventWatchers(),
    analyzesWatchers(),
    orgsWatcher(),
    subsWatcher(),
  ]);
}
