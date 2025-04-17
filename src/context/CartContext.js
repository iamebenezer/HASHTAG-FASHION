import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create cart context
const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem('hashtagFashionCart');
    return storedCart ? JSON.parse(storedCart) : initialState;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return initialState;
  }
};

// Cart reducer
const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'ADD_TO_CART':
      // Check for existing item with same ID, color variant, and size variant
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
               item.color === action.payload.color &&
               (item.color_variant_id === action.payload.color_variant_id) &&
               (item.size_variant_id === action.payload.size_variant_id)
      );
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        
        newState = {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + action.payload.quantity,
          totalPrice: state.totalPrice + (parseFloat(action.payload.price.toString().replace(/,/g, '')) * action.payload.quantity)
        };
      } else {
        // Add new item - ensure color_variant_id and size_variant_id are included if present
        const newItem = {
          ...action.payload,
          color_variant_id: action.payload.color_variant_id || null,
          size: action.payload.size || null,
          size_variant_id: action.payload.size_variant_id || null
        };
        
        newState = {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + action.payload.quantity,
          totalPrice: state.totalPrice + (parseFloat(action.payload.price.toString().replace(/,/g, '')) * action.payload.quantity)
        };
      }
      break;
      
    case 'REMOVE_FROM_CART':
      const itemToRemove = state.items.find(item => 
        item.id === action.payload.id && 
        item.color === action.payload.color &&
        (action.payload.color_variant_id ? item.color_variant_id === action.payload.color_variant_id : true) &&
        (action.payload.size_variant_id ? item.size_variant_id === action.payload.size_variant_id : true)
      );
      
      if (!itemToRemove) return state;
      
      newState = {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && 
            item.color === action.payload.color &&
            (action.payload.color_variant_id ? item.color_variant_id === action.payload.color_variant_id : true) &&
            (action.payload.size_variant_id ? item.size_variant_id === action.payload.size_variant_id : true))
        ),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (parseFloat(itemToRemove.price.toString().replace(/,/g, '')) * itemToRemove.quantity)
      };
      break;
      
    case 'UPDATE_QUANTITY':
      const itemIndex = state.items.findIndex(item => 
        item.id === action.payload.id && 
        item.color === action.payload.color &&
        (action.payload.color_variant_id ? item.color_variant_id === action.payload.color_variant_id : true) &&
        (action.payload.size_variant_id ? item.size_variant_id === action.payload.size_variant_id : true)
      );
      
      if (itemIndex === -1) return state;
      
      const item = state.items[itemIndex];
      const quantityDiff = action.payload.quantity - item.quantity;
      
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = {
        ...item,
        quantity: action.payload.quantity
      };
      
      newState = {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalPrice: state.totalPrice + (parseFloat(item.price.toString().replace(/,/g, '')) * quantityDiff)
      };
      break;
      
    case 'CLEAR_CART':
      newState = initialState;
      break;
      
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
  
  // Save to localStorage
  localStorage.setItem('hashtagFashionCart', JSON.stringify(newState));
  
  return newState;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadCartFromStorage);
  
  // Recalculate totals when items change
  useEffect(() => {
    const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = state.items.reduce((total, item) => {
      const price = parseFloat(item.price.toString().replace(/,/g, ''));
      return total + (price * item.quantity);
    }, 0);
    
    if (totalItems !== state.totalItems || totalPrice !== state.totalPrice) {
      const updatedState = {
        ...state,
        totalItems,
        totalPrice
      };
      localStorage.setItem('hashtagFashionCart', JSON.stringify(updatedState));
    }
  }, [state.items]);
  
  // Cart actions
  const addToCart = (item) => {
    if (!item.quantity) item.quantity = 1;
    
    // Ensure color_variant_id and size_variant_id are included if available
    const cartItem = {
      ...item,
      color_variant_id: item.color_variant_id || null,
      size: item.size || null,
      size_variant_id: item.size_variant_id || null
    };
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: cartItem
    });
  };
  
  const removeFromCart = (id, color, color_variant_id = null, size_variant_id = null) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id, color, color_variant_id, size_variant_id }
    });
  };
  
  const updateQuantity = (id, color, quantity, color_variant_id = null, size_variant_id = null) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, color, quantity, color_variant_id, size_variant_id }
    });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
