import { configureStore } from '@reduxjs/toolkit';
import printJobReducer from './slices/printJobSlice';

const store = configureStore({
  reducer: {
    printJob: printJobReducer,
  },
});

export default store; 