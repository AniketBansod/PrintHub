import { configureStore } from '@reduxjs/toolkit';
import printJobReducer from './slices/printJobSlice';

const store = configureStore({
  reducer: {
    printJobs: printJobReducer, // Changed from 'printJob' to 'printJobs'
  },
});

export default store;
