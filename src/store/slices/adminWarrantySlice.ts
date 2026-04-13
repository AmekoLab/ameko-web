import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  warrantyService,
  AdminDecisionPayload,
  WarrantyRequest,
} from "@/src/services/warranty.service";
import { toast } from "react-toastify";

// ─── State ───────────────────────────────────────────────
interface AdminWarrantyState {
  adminWarrantyList: WarrantyRequest[];
  adminPagination: { current: number; total: number };
  loadingAdminWarranties: boolean;
  isProcessingAdminDecision: boolean;
  error: string | null;
}

const initialState: AdminWarrantyState = {
  adminWarrantyList: [],
  adminPagination: { current: 1, total: 1 },
  loadingAdminWarranties: false,
  isProcessingAdminDecision: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────
export const fetchAllWarrantyRequests = createAsyncThunk(
  "adminWarranty/fetchAllWarrantyRequests",
  async (
    {
      page,
      pageSize,
      status,
    }: { page: number; pageSize: number; status?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await warrantyService.getAllWarrantyRequests(
        page,
        pageSize,
        status,
      );
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

export const processAdminWarrantyDecision = createAsyncThunk(
  "adminWarranty/processAdminWarrantyDecision",
  async (payload: AdminDecisionPayload, { rejectWithValue }) => {
    try {
      const res = await warrantyService.submitAdminDecision(payload);
      if (res.success) {
        toast.success("Admin decision saved successfully!");
        return res.data;
      }
      return rejectWithValue(res.message || "Admin decision failed");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Admin decision failed");
      return rejectWithValue(err.message || "Admin decision failed");
    }
  },
);

// ─── Slice ───────────────────────────────────────────────
const adminWarrantySlice = createSlice({
  name: "adminWarranty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWarrantyRequests.pending, (state) => {
        state.loadingAdminWarranties = true;
        state.error = null;
      })
      .addCase(fetchAllWarrantyRequests.fulfilled, (state, action) => {
        state.loadingAdminWarranties = false;
        state.adminWarrantyList = action.payload.items;
        state.adminPagination = {
          current: action.payload.currentPage,
          total: action.payload.totalPages,
        };
      })
      .addCase(fetchAllWarrantyRequests.rejected, (state, action) => {
        state.loadingAdminWarranties = false;
        state.error = (action.payload as string) || "Something went wrong";
      })
      // admin decision
      .addCase(processAdminWarrantyDecision.pending, (state) => {
        state.isProcessingAdminDecision = true;
        state.error = null;
      })
      .addCase(processAdminWarrantyDecision.fulfilled, (state) => {
        state.isProcessingAdminDecision = false;
      })
      .addCase(processAdminWarrantyDecision.rejected, (state, action) => {
        state.isProcessingAdminDecision = false;
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

export default adminWarrantySlice.reducer;
