import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services/api';

// Async thunk for fetching the user's cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch cart' });
    }
  }
);

// Async thunk for adding an item to the cart
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (item, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(item);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add item to cart' });
    }
  }
);

// Async thunk for updating cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(id, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update cart item' });
    }
  }
);

// Async thunk for removing an item from the cart
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (id, { rejectWithValue }) => {
    try {
      await cartService.removeCartItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove cart item' });
    }
  }
);

// Async thunk for clearing the cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to clear cart' });
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalAmount: 0,
  shippingCharge: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    calculateTotals: (state) => {
      // Calculate total amount
      const total = state.items.reduce(
        (acc, item) => {
          const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/,/g, '')) 
            : Number(item.price);
          return acc + price * Number(item.quantity);
        },
        0
      );
      state.totalAmount = total;
      
      // Calculate shipping charge based on total amount
      if (total <= 200) {
        state.shippingCharge = 30;
      } else if (total <= 400) {
        state.shippingCharge = 25;
      } else {
        state.shippingCharge = 20;
      }
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch cart';
      })
      
      // Handle addItemToCart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Replace the entire cart with the updated cart from the server
        state.items = action.payload;
        state.error = null;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add item to cart';
      })
      
      // Handle updateCartItemQuantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        // Replace the entire cart with the updated cart from the server
        state.items = action.payload;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update cart item';
      })
      
      // Handle removeCartItem
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the item from the cart
        state.items = state.items.filter(item => item.id !== action.payload);
        state.error = null;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove cart item';
      })
      
      // Handle clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalAmount = 0;
        state.shippingCharge = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to clear cart';
      });
  },
});

export const { calculateTotals } = cartSlice.actions;

export default cartSlice.reducer;