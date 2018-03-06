import { all } from "redux-saga/effects";
import { getWatchers as authWatchers } from "../modules/auth";
import { getWatchers as reposWatchers } from "../modules/repos";

export default function* root() {
  yield all([authWatchers(), reposWatchers()]);
}
