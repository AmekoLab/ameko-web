import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  warrantyService,
  ShopReviewPayload,
  WarrantyRequest,
} from "@/src/services/warranty.service";
import { toast } from "react-toastify";

// ─── State ───────────────────────────────────────────────
interface ShopWarrantyState {
  shopWarrantyList: WarrantyRequest[];
  shopPagination: { current: number; total: number };
  loadingShopWarranties: boolean;
  isReviewingWarranty: boolean;
  isConfirmingReceipt: boolean;
  error: string | null;
}

const initialState: ShopWarrantyState = {
  shopWarrantyList: [],
  shopPagination: { current: 1, total: 1 },
  loadingShopWarranties: false,
  isReviewingWarranty: false,
  isConfirmingReceipt: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────
export const fetchShopWarrantyRequests = createAsyncThunk(
  "shopWarranty/fetchShopWarrantyRequests",
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await warrantyService.getShopWarrantyRequests(page, pageSize);
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || "Không thể tải danh sách yêu cầu");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Không thể tải danh sách yêu cầu");
    }
  },
);

export const submitShopWarrantyReview = createAsyncThunk(
  "shopWarranty/submitShopWarrantyReview",
  async (payload: ShopReviewPayload, { rejectWithValue }) => {
    try {
      const res = await warrantyService.reviewWarrantyRequest(payload);
      if (res.success) {
        toast.success("Đã xử lý yêu cầu thành công!");
        return res.data;
      }
      return rejectWithValue(res.message || "Xử lý yêu cầu thất bại");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Xử lý yêu cầu thất bại");
      return rejectWithValue(err.message || "Xử lý yêu cầu thất bại");
    }
  },
);

export const confirmShopReceipt = createAsyncThunk(
  "shopWarranty/confirmShopReceipt",
  async (issueId: string, { rejectWithValue }) => {
    try {
      const res = await warrantyService.confirmReceiveReturnItem(issueId);
      if (res.success) {
        toast.success(
          "Xác nhận nhận hàng thành công! Đơn khiếu nại đã hoàn tất.",
        );
        return res.data;
      }
      return rejectWithValue(res.message || "Xác nhận thất bại");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Xác nhận thất bại");
      return rejectWithValue(err.message || "Xác nhận thất bại");
    }
  },
);

// ─── Slice ───────────────────────────────────────────────
const shopWarrantySlice = createSlice({
  name: "shopWarranty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchShopWarrantyRequests.pending, (state) => {
        state.loadingShopWarranties = true;
        state.error = null;
      })
      .addCase(fetchShopWarrantyRequests.fulfilled, (state, action) => {
        state.loadingShopWarranties = false;
        state.shopWarrantyList = action.payload.items;
        state.shopPagination = {
          current: action.payload.currentPage,
          total: action.payload.totalPages,
        };
      })
      .addCase(fetchShopWarrantyRequests.rejected, (state, action) => {
        state.loadingShopWarranties = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // shop review
      .addCase(submitShopWarrantyReview.pending, (state) => {
        state.isReviewingWarranty = true;
        state.error = null;
      })
      .addCase(submitShopWarrantyReview.fulfilled, (state) => {
        state.isReviewingWarranty = false;
      })
      .addCase(submitShopWarrantyReview.rejected, (state, action) => {
        state.isReviewingWarranty = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // confirm receipt
      .addCase(confirmShopReceipt.pending, (state) => {
        state.isConfirmingReceipt = true;
        state.error = null;
      })
      .addCase(confirmShopReceipt.fulfilled, (state) => {
        state.isConfirmingReceipt = false;
      })
      .addCase(confirmShopReceipt.rejected, (state, action) => {
        state.isConfirmingReceipt = false;
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

export default shopWarrantySlice.reducer;
