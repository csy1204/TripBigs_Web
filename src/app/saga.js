import { hotelsEffects } from "../features/hotels/hotelsEffect";
import { all } from "redux-saga/effects";

export default function* effects() {
  yield all([
    hotelsEffects(),
  ]);
}