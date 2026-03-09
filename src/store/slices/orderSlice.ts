import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/src/services/order.service";
import { OrderGroup } from "@/src/types/order.types";

// ─── State ───────────────────────────────────────────────
interface OrderState {
  orderGroups: OrderGroup[];
  loadingHistory: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orderGroups: [],
  loadingHistory: false,
  error: null,
};

// ─── Async Thunk: Fetch payment history ──────────────────
export const fetchMyPaymentHistory = createAsyncThunk(
  "order/fetchMyPaymentHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderService.getMyPaymentHistory();
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to fetch payment history");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch payment history");
    }
  },
);

// ─── Slice ───────────────────────────────────────────────
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPaymentHistory.pending, (state) => {
        state.loadingHistory = true;
        state.error = null;
      })
      .addCase(fetchMyPaymentHistory.fulfilled, (state, action) => {
        state.loadingHistory = false;
        state.orderGroups = action.payload;
      })
      .addCase(fetchMyPaymentHistory.rejected, (state, action) => {
        state.loadingHistory = false;
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

export default orderSlice.reducer;
