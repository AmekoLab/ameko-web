import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  warrantyService,
  CreateWarrantyPayload,
  CustomerShipPayload,
  UpdateWarrantyPayload,
  WarrantyRequest,
} from "@/src/services/warranty.service";
import { toast } from "react-toastify";

// ─── State ───────────────────────────────────────────────
interface WarrantyState {
  isSubmittingWarranty: boolean;
  isSubmittingShipment: boolean;
  isWithdrawing: boolean;
  isUpdatingWarranty: boolean;
  warrantyList: WarrantyRequest[];
  pagination: { current: number; total: number };
  loadingWarranties: boolean;
  error: string | null;
}

const initialState: WarrantyState = {
  isSubmittingWarranty: false,
  isSubmittingShipment: false,
  isWithdrawing: false,
  isUpdatingWarranty: false,
  warrantyList: [],
  pagination: { current: 1, total: 1 },
  loadingWarranties: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────
export const submitWarrantyRequest = createAsyncThunk(
  "warranty/submitWarrantyRequest",
  async (
    {
      orderGroupId,
      payload,
    }: { orderGroupId: string; payload: CreateWarrantyPayload },
    { rejectWithValue },
  ) => {
    try {
      const res = await warrantyService.createWarrantyRequest(
        orderGroupId,
        payload,
      );
      if (res.success) {
        toast.success("Yêu cầu bảo hành đã được gửi thành công!");
        return res.data;
      }
      return rejectWithValue(res.message || "Gửi yêu cầu thất bại");
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi tạo yêu cầu bảo hành.";
      return rejectWithValue(msg);
    }
  },
);

export const submitWarrantyReturnShipment = createAsyncThunk(
  "warranty/submitWarrantyReturnShipment",
  async (payload: CustomerShipPayload, { rejectWithValue }) => {
    try {
      const res = await warrantyService.submitReturnShipment(payload);
      if (res.success) {
        toast.success("Đã gửi thông tin trả hàng thành công!");
        return res.data;
      }
      return rejectWithValue(res.message || "Gửi thông tin thất bại");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Gửi thông tin thất bại");
      return rejectWithValue(err.message || "Gửi thông tin thất bại");
    }
  },
);

export const fetchMyWarrantyRequests = createAsyncThunk(
  "warranty/fetchMyWarrantyRequests",
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await warrantyService.getMyWarrantyRequests(page, pageSize);
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

export const updateWarranty = createAsyncThunk(
  "warranty/updateWarranty",
  async (
    { issueId, payload }: { issueId: string; payload: UpdateWarrantyPayload },
    { rejectWithValue },
  ) => {
    try {
      const res = await warrantyService.updateWarrantyRequest(issueId, payload);
      if (res.success) {
        toast.success("Cập nhật yêu cầu thành công!");
        return res.data;
      }
      return rejectWithValue(res.message || "Cập nhật yêu cầu thất bại");
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi cập nhật yêu cầu.";
      return rejectWithValue(msg);
    }
  },
);

export const withdrawWarranty = createAsyncThunk(
  "warranty/withdrawWarranty",
  async (issueId: string, { rejectWithValue }) => {
    try {
      const res = await warrantyService.withdrawWarrantyRequest(issueId);
      if (res.success) {
        toast.success("Đã rút lại yêu cầu khiếu nại thành công.");
        return res.data;
      }
      return rejectWithValue(res.message || "Rút lại yêu cầu thất bại");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Rút lại yêu cầu thất bại");
      return rejectWithValue(err.message || "Rút lại yêu cầu thất bại");
    }
  },
);

// ─── Slice ───────────────────────────────────────────────
const warrantySlice = createSlice({
  name: "warranty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // submit
      .addCase(submitWarrantyRequest.pending, (state) => {
        state.isSubmittingWarranty = true;
        state.error = null;
      })
      .addCase(submitWarrantyRequest.fulfilled, (state) => {
        state.isSubmittingWarranty = false;
      })
      .addCase(submitWarrantyRequest.rejected, (state, action) => {
        state.isSubmittingWarranty = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // shipment
      .addCase(submitWarrantyReturnShipment.pending, (state) => {
        state.isSubmittingShipment = true;
        state.error = null;
      })
      .addCase(submitWarrantyReturnShipment.fulfilled, (state) => {
        state.isSubmittingShipment = false;
      })
      .addCase(submitWarrantyReturnShipment.rejected, (state, action) => {
        state.isSubmittingShipment = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // fetch list
      .addCase(fetchMyWarrantyRequests.pending, (state) => {
        state.loadingWarranties = true;
        state.error = null;
      })
      .addCase(fetchMyWarrantyRequests.fulfilled, (state, action) => {
        state.loadingWarranties = false;
        state.warrantyList = action.payload.items;
        state.pagination = {
          current: action.payload.currentPage,
          total: action.payload.totalPages,
        };
      })
      .addCase(fetchMyWarrantyRequests.rejected, (state, action) => {
        state.loadingWarranties = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // withdraw
      .addCase(withdrawWarranty.pending, (state) => {
        state.isWithdrawing = true;
        state.error = null;
      })
      .addCase(withdrawWarranty.fulfilled, (state) => {
        state.isWithdrawing = false;
      })
      .addCase(withdrawWarranty.rejected, (state, action) => {
        state.isWithdrawing = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // update
      .addCase(updateWarranty.pending, (state) => {
        state.isUpdatingWarranty = true;
        state.error = null;
      })
      .addCase(updateWarranty.fulfilled, (state) => {
        state.isUpdatingWarranty = false;
      })
      .addCase(updateWarranty.rejected, (state, action) => {
        state.isUpdatingWarranty = false;
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

export default warrantySlice.reducer;
