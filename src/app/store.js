import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import hotelReducer from "../features/hotels/hotelsSlices";
import trackerReducer from '../features/tracker/trackerSlice';

import createSagaMiddleware from "redux-saga";
import rootEffects from './saga'


const sagaMiddleware = createSagaMiddleware();

export default configureStore({
  reducer: {
    counter: counterReducer,
    hotels: hotelReducer,
    tracker: trackerReducer,
  },
  middleware: [...getDefaultMiddleware(), sagaMiddleware]
});

sagaMiddleware.run(rootEffects);
