// redux/orebiSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

const orebiSlice = createSlice({
  name: "orebi",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = state.products.find(
        (product) => product._id === action.payload._id
      );
      if (item) {
        item.quantity += 1;
      } else {
        state.products.push({ ...action.payload, quantity: 1 });
      }
    },

    deleteItem: (state, action) => {
      state.products = state.products.filter(
        (item) => item._id !== action.payload
      );
    },

    increaseQuantity: (state, action) => {
      const item = state.products.find(
        (product) => product._id === action.payload._id
      );
      if (item) {
        item.quantity += 1;
      }
    },

    drecreaseQuantity: (state, action) => {
      const item = state.products.find(
        (product) => product._id === action.payload._id
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    resetCart: (state) => {
      state.products = [];
    },
  },
});

export const {
  addToCart,
  deleteItem,
  increaseQuantity,
  drecreaseQuantity,
  resetCart,
} = orebiSlice.actions;

export default orebiSlice.reducer;
