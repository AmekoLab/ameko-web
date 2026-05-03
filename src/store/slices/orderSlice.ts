import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/src/services/order.service";
import { OrderGroup, GetMyPaymentHistoryParams } from "@/src/types/order.types";

// ─── State ───────────────────────────────────────────────
interface OrderState {
  orderGroups: OrderGroup[];
  loadingHistory: boolean;
  hasNextPage: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orderGroups: [],
  loadingHistory: false,
  hasNextPage: false,
  error: null,
};

// ─── Async Thunk: Fetch payment history ──────────────────
export const fetchMyPaymentHistory = createAsyncThunk(
  "order/fetchMyPaymentHistory",
  async (params: GetMyPaymentHistoryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await orderService.getMyPaymentHistory(params);
      if (res.success) {
        return { data: res.data, page: params?.page || 1 };
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
        const payloadData = action.payload.data;
        
        // Backwards compatibility check
        const items = Array.isArray(payloadData) ? payloadData : (payloadData?.items || []);
        
        if (action.payload.page === 1) {
          state.orderGroups = items;
        } else {
          state.orderGroups.push(...items);
        }
        
        state.hasNextPage = payloadData?.hasNextPage || false;
      })
      .addCase(fetchMyPaymentHistory.rejected, (state, action) => {
        state.loadingHistory = false;
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

export default orderSlice.reducer;
