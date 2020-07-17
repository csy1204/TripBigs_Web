import { put, takeLatest, call } from "redux-saga/effects";
import api from '../../lib/api'
import { getClickProbs, getClickProbsSuccess, getClickProbsFailure, sortByClickProb } from './hotelsSlices';

export function* fetchClickProbs() {
  try {
    put(getClickProbs());
    const predicts = yield call(api.getClickProbs);
    // console.log(predicts);
    yield put(getClickProbsSuccess({predicts})) // 클릭 예측률 가져오기
    yield put(sortByClickProb()); // 클릭 확률순 정렬
  } catch (err) {
      console.log(err);
      yield put(getClickProbsFailure(err));
  }
}

export function* hotelsEffects() {
    // news effect 연결 (getNews -> fetechNews)
    yield takeLatest(getClickProbs, fetchClickProbs);
}