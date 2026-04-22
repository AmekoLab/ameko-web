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
        toast.success("Warranty request submitted successfully!");
        return res.data;
      }
      return rejectWithValue(res.message || "Submit warranty request failed");
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
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
        toast.success("Return shipment submitted successfully!");
        return res.data;
      }
      return rejectWithValue(res.message || "Return shipment submitted failed");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Return shipment submitted failed");
      return rejectWithValue(err.message || "Return shipment submitted failed");
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
      return rejectWithValue(res.message || "Failed to fetch warranty requests");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch warranty requests");
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
        toast.success("Update warranty request successfully!");
        return res.data;
      }
      return rejectWithValue(res.message || "Update warranty request failed");
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "Update warranty request failed";
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
        toast.success("Withdraw warranty request successfully!");
        return res.data;
      }
      return rejectWithValue(res.message || "Withdraw warranty request failed");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Withdraw warranty request failed");
      return rejectWithValue(err.message || "Withdraw warranty request failed");
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
