import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isCartOpen: boolean;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load cart from storage:", error);
    return [];
  }
};

// Calculate totals from items
const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { totalQuantity, totalAmount };
};

// Initialize with saved cart data
const savedItems = loadCartFromStorage();
const { totalQuantity, totalAmount } = calculateTotals(savedItems);

const initialState: CartState = {
  items: savedItems,
  totalQuantity,
  totalAmount,
  isCartOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.isCartOpen = action.payload;
    },

    addToCart(
      state,
      action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>
    ) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
        state.totalQuantity += newItem.quantity || 1;
        state.totalAmount += newItem.price * (newItem.quantity || 1);
      } else {
        state.items.push({
          ...newItem,
          quantity: newItem.quantity || 1,
        });
        state.totalQuantity += newItem.quantity || 1;
        state.totalAmount += newItem.price * (newItem.quantity || 1);
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== id);
      }
    },

    updateQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;

      // Validation
      if (quantity < 1 || quantity > 99) return;

      const item = state.items.find((i) => i.id === id);
      if (item) {
        const diff = quantity - item.quantity;
        state.totalQuantity += diff;
        state.totalAmount += item.price * diff;
        item.quantity = quantity;
      }
    },

    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },

    recalculateTotals(state) {
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;
    },
  },
});

export const {
  setCartOpen,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  recalculateTotals,
} = cartSlice.actions;

export default cartSlice.reducer;

// Middleware to save cart to localStorage
export const cartMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);

  if (action.type.startsWith("cart/") && action.type !== "cart/setCartOpen") {
    const { items } = store.getState().cart;
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  }

  return result;
};
