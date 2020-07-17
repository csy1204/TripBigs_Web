import { put, takeLatest, call } from "redux-saga/effects";
import api from '../../lib/api'
import { getClickProbs, getClickProbsSuccess, getClickProbsFailure, sortByClickProb } from './hotelsSlices';

export function* fetchClickProbs() {
  try {
    put(getClickProbs());
    const predicts = yield call(api.getClickProbs);
    // console.log(predicts);
    yield put(getClickProbsSuccess({predicts}))
    yield put(sortByClickProb());
  } catch (err) {
      console.log(err);
      yield put(getClickProbsFailure(err));
  }
}

export function* hotelsEffects() {
    // news effect 연결 (getNews -> fetechNews)
    yield takeLatest(getClickProbs, fetchClickProbs);
}