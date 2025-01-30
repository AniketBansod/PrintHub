import { createSlice } from '@reduxjs/toolkit';

const printJobSlice = createSlice({
  name: 'printJob',
  initialState: {
    cart: [],
  },
  reducers: {
    addToCart: (state, action) => {
      state.cart.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(job => job.id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = printJobSlice.actions;
export default printJobSlice.reducer; 