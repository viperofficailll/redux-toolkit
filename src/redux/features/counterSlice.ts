import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incementbyamount: (state, actions) => {
      state.value += actions.payload;
    },
    decrementbyamount: (state, actions) => {
      state.value -= actions.payload;
    },
  },
});

export const { increment, decrement, incementbyamount, decrementbyamount } =
  counterSlice.actions;
export default counterSlice.reducer;
