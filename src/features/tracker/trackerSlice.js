import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

let nextStepId = 1

export const trackerSlice = createSlice({
  name: 'tracker',
  initialState: {
      logs: [],
      session_id: uuidv4(),
      user_id: uuidv4(),
      current_filters: null,
      impressions: null,
      prices: null,
  },
  reducers: {
    generateLog: {
        reducer(state, action) {
        const { id, data } = action.payload
        const newLog = {
        "user_id": state.user_id, 
        "session_id": state.session_id, 
        "timestamp": ~~(Date.now() / 1000), 
        "step": id, 
        "action_type": data.action_type,
        "reference": data.reference.toString(), 
        "platform": "KR", 
        "city": "Seoul, South Korea", 
        "device": "desktop", 
        "current_filters": null, 
        "impressions": data.impressions ? data.impressions : state.impressions, 
        "prices":  data.prices ? data.prices : state.prices
        }
        state.logs.push(newLog)
        if (data.impressions && data.prices) {
            state.impressions = data.impressions;
            state.prices = data.prices;
        }
        // state.current_filters = data.current_filters;
        },
        prepare(data) {
            return { payload: { data, id: nextStepId++ } }
        }
    },
    addLastClickOut: {
        reducer(state, action) {
        const { id } = action.payload
        const newLog = {
            "user_id": state.user_id, 
            "session_id": state.session_id, 
            "timestamp": ~~(Date.now() / 1000), 
            "step": id, 
            "action_type": "clickout item",
            "reference": "0", 
            "platform": "KR", 
            "city": "Seoul, South Korea", 
            "device": "desktop", 
            "current_filters": null, 
            "impressions": state.impressions, 
            "prices":  state.prices
        }
        state.logs.push(newLog)
        // state.current_filters = data.current_filters;
        },
        prepare() {
            return { payload: { id: nextStepId++ } }
        }
    }
  }
});

export const { generateLog, addLastClickOut } = trackerSlice.actions;

// export const selectCount = state => state.counter.value;

export default trackerSlice.reducer;
