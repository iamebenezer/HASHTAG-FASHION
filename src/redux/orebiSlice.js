// redux/orebiSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  orders: [], // Adding orders array to the initial state
  preorders: [], // Adding preorders array to the initial state
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

    ADD_ORDER: (state, action) => {
      state.orders.push(action.payload);
    },

    ADD_PREORDER: (state, action) => {
      state.preorders.push(action.payload);
    },

    SET_ORDERS: (state, action) => {
      state.orders = action.payload;
    },

    SET_PREORDERS: (state, action) => {
      state.preorders = action.payload;
    },

    CLEAN_INVALID_ORDERS: (state) => {
      // Remove orders with no customer data or total amount
      state.orders = state.orders.filter(order =>
        order &&
        order.total_amount > 0 &&
        (order.customerName || order.customerEmail)
      );
    },
  },
});

export const {
  addToCart,
  deleteItem,
  increaseQuantity,
  drecreaseQuantity,
  resetCart,
  ADD_ORDER,
  ADD_PREORDER,
  SET_ORDERS,
  SET_PREORDERS,
  CLEAN_INVALID_ORDERS,
} = orebiSlice.actions;

export default orebiSlice.reducer;
