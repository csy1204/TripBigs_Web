import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export const trackerSlice = createSlice({
  name: 'tracker',
  initialState: {
      logs: [],
      session_id: uuidv4(),
      user_id: uuidv4(),
  },
  reducers: {
      generateLog(state, action) {
          const newLog = {
              


          }
          state.logs.push(newLog)
      }
  }
});

// export const { increment, decrement, incrementByAmount } = trackerSlice.actions;

// export const selectCount = state => state.counter.value;

export default trackerSlice.reducer;
