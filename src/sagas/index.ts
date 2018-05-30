import { all, fork } from "redux-saga/effects";
import { getWatchers as authWatchers } from "modules/auth";
import { getWatchers as reposWatchers } from "modules/repos";
import { getWatchers as eventWatchers } from "modules/events";

export default function* root() {
  yield all([authWatchers(), reposWatchers(), eventWatchers()]);
}
