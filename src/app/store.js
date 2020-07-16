import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import hotelReducer from "../features/hotels/hotelsSlices";


export default configureStore({
  reducer: {
    counter: counterReducer,
    hotels: hotelReducer,
  },
});
