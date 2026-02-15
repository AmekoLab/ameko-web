import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orderService } from "@/src/services/order.service";
import { CartData } from "@/src/types/order.types";

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

// ─── Async Thunk: Fetch cart from server ─────────────────
export const fetchServerCart = createAsyncThunk(
  "cart/fetchServerCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderService.getCart();
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to fetch cart");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch cart");
    }
  },
);

// ─── Async Thunk: Remove item from server cart ───────────
export const removeServerCartItem = createAsyncThunk(
  "cart/removeServerCartItem",
  async (orderItemId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await orderService.deleteCartItem(orderItemId);
      if (res.success) {
        // Re-fetch cart to get updated data
        dispatch(fetchServerCart());
        return orderItemId;
      }
      return rejectWithValue(res.message || "Failed to remove item");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to remove item");
    }
  },
);

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isCartOpen: boolean;
  note: string;
  // Server-side cart
  serverCart: CartData | null;
  serverCartLoading: boolean;
  serverCartError: string | null;
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
    0,
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
  note: "",
  serverCart: null,
  serverCartLoading: false,
  serverCartError: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.isCartOpen = action.payload;
    },

    setOrderNote(state, action: PayloadAction<string>) {
      state.note = action.payload;
    },

    addToCart(
      state,
      action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>,
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
      action: PayloadAction<{ id: string; quantity: number }>,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchServerCart.pending, (state) => {
        state.serverCartLoading = true;
        state.serverCartError = null;
      })
      .addCase(fetchServerCart.fulfilled, (state, action) => {
        state.serverCartLoading = false;
        state.serverCart = action.payload;
      })
      .addCase(fetchServerCart.rejected, (state, action) => {
        state.serverCartLoading = false;
        state.serverCartError = action.payload as string;
      })
      // removeServerCartItem: optimistically remove item from UI
      .addCase(removeServerCartItem.pending, (state, action) => {
        if (state.serverCart) {
          state.serverCart.orderItems = state.serverCart.orderItems.filter(
            (item) => item.id !== action.meta.arg,
          );
        }
      })
      .addCase(removeServerCartItem.rejected, (state, action) => {
        state.serverCartError = action.payload as string;
      });
  },
});

export const {
  setCartOpen,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  recalculateTotals,
  setOrderNote,
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
