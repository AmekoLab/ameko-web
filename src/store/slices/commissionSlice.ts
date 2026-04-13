import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { commissionService } from "@/src/services/commission.service";
import {
  CreateCommissionPayload,
  CommissionRequest,
  CommissionQuote,
  SubmitQuotePayload,
  UpdateCommissionPayload,
} from "@/src/types/commission.types";
import { toast } from "react-toastify";

interface CommissionState {
  isLoading: boolean;
  error: string | null;
  myRequests: CommissionRequest[];
  loadingMyRequests: boolean;
  currentRequest: CommissionRequest | null;
  loadingDetail: boolean;
  targetedRequests: CommissionRequest[];
  loadingTargetedRequests: boolean;
  isSubmittingQuote: boolean;
  isRevokingQuote: boolean;
  isAcceptingQuote: boolean;
  isRejectingQuote: boolean;
  isCanceling: boolean;
  isPublishingToPool: boolean;
  isUpdatingRequest: boolean;
  poolRequests: CommissionRequest[];
  loadingPool: boolean;
  shopQuotes: CommissionQuote[];
  loadingShopQuotes: boolean;
}

const initialState: CommissionState = {
  isLoading: false,
  error: null,
  myRequests: [],
  loadingMyRequests: false,
  currentRequest: null,
  loadingDetail: false,
  targetedRequests: [],
  loadingTargetedRequests: false,
  isSubmittingQuote: false,
  isRevokingQuote: false,
  isAcceptingQuote: false,
  isRejectingQuote: false,
  isCanceling: false,
  isPublishingToPool: false,
  isUpdatingRequest: false,
  poolRequests: [],
  loadingPool: false,
  shopQuotes: [],
  loadingShopQuotes: false,
};

export const createCommissionRequest = createAsyncThunk(
  "commission/create",
  async (payload: CreateCommissionPayload, { rejectWithValue }) => {
    try {
      const response = await commissionService.createCommission(payload);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to create commission request");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create commission request";
      return rejectWithValue(message);
    }
  },
);

export const fetchMyRequests = createAsyncThunk(
  "commission/fetchMyRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionService.getMyRequests();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch my requests");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch my requests";
      return rejectWithValue(message);
    }
  },
);

export const fetchCommissionDetail = createAsyncThunk(
  "commission/fetchDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await commissionService.getCommissionById(id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch commission detail");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch commission detail";
      return rejectWithValue(message);
    }
  },
);

export const fetchShopTargetedRequests = createAsyncThunk(
  "commission/fetchShopTargeted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionService.getShopTargetedRequests();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch targeted requests");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch targeted requests";
      return rejectWithValue(message);
    }
  },
);

export const fetchPoolRequests = createAsyncThunk(
  "commission/fetchPool",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionService.getPool();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch pool requests");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch pool requests";
      return rejectWithValue(message);
    }
  },
);

export const fetchShopQuotes = createAsyncThunk(
  "commission/fetchShopQuotes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionService.getShopQuotes();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(
        response.message || "Failed to fetch shop quotes",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch shop quotes";
      return rejectWithValue(message);
    }
  },
);

export const submitCommissionQuote = createAsyncThunk(
  "commission/submitQuote",
  async (
    { requestId, payload }: { requestId: string; payload: SubmitQuotePayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await commissionService.submitQuote(requestId, payload);
      if (response.success) {
        toast.success("Send quote successfully!");
        return response.data;
      }
      return rejectWithValue(response.message || "Send quote failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Send quote failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const revokeCommissionQuote = createAsyncThunk(
  "commission/revokeQuote",
  async (quoteId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await commissionService.revokeQuote(quoteId);
      if (response.success) {
        toast.success("Revoke quote successfully!");
        dispatch(fetchShopQuotes());
        return;
      }
      return rejectWithValue(response.message || "Revoke quote failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Revoke quote failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const cancelCommission = createAsyncThunk(
  "commission/cancel",
  async (requestId: string, { rejectWithValue, dispatch }) => {
    try {
      const response =
        await commissionService.cancelCommissionRequest(requestId);
      if (response.success) {
        toast.success("Cancel commission request successfully!");
        dispatch(fetchCommissionDetail(requestId));
        return;
      }
      return rejectWithValue(response.message || "Cancel commission request failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Cancel commission request failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const publishCommissionToPool = createAsyncThunk(
  "commission/publishToPool",
  async (requestId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await commissionService.publishToPool(requestId);
      if (response.success) {
        toast.success("Publish to pool successfully!");
        dispatch(fetchCommissionDetail(requestId));
        return;
      }
      return rejectWithValue(response.message || "Publish to pool failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Publish to pool failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const acceptCommissionQuote = createAsyncThunk(
  "commission/acceptQuote",
  async (quoteId: string, { rejectWithValue }) => {
    try {
      const response = await commissionService.acceptQuote(quoteId);
      if (response.success) {
        return { orderId: response.orderId };
      }
      return rejectWithValue(response.message || "Accept quote failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Accept quote failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const rejectCommissionQuote = createAsyncThunk(
  "commission/rejectQuote",
  async (
    { quoteId, requestId }: { quoteId: string; requestId: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await commissionService.rejectQuote(quoteId);
      if (response.success) {
        toast.success("Reject quote successfully!");
        dispatch(fetchCommissionDetail(requestId));
        return;
      }
      return rejectWithValue(response.message || "Reject quote failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Reject quote failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const rejectCommissionRequest = createAsyncThunk(
  "commission/rejectRequest",
  async (requestId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await commissionService.rejectCommissionRequest(requestId);
      if (response.success) {
        toast.success("Reject commission request successfully!");
        dispatch(fetchCommissionDetail(requestId));
        return;
      }
      return rejectWithValue(response.message || "Reject commission request failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Reject commission request failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const updateCommissionRequestThunk = createAsyncThunk(
  "commission/update",
  async (
    { id, payload }: { id: string; payload: UpdateCommissionPayload },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await commissionService.updateCommission(id, payload);
      if (response.success) {
        toast.success("Update commission request successfully!");
        dispatch(fetchCommissionDetail(id));
        return;
      }
      return rejectWithValue(response.message || "Update commission request failed");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Update commission request failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const commissionSlice = createSlice({
  name: "commission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCommissionRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCommissionRequest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createCommissionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Fetch My Requests ---
      .addCase(fetchMyRequests.pending, (state) => {
        state.loadingMyRequests = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loadingMyRequests = false;
        state.myRequests = [...action.payload].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loadingMyRequests = false;
        state.error = action.payload as string;
      })
      // --- Fetch Commission Detail ---
      .addCase(fetchCommissionDetail.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
        state.currentRequest = null;
      })
      .addCase(fetchCommissionDetail.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchCommissionDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload as string;
      })
      // --- Fetch Shop Targeted Requests ---
      .addCase(fetchShopTargetedRequests.pending, (state) => {
        state.loadingTargetedRequests = true;
        state.error = null;
      })
      .addCase(fetchShopTargetedRequests.fulfilled, (state, action) => {
        state.loadingTargetedRequests = false;
        state.targetedRequests = [...action.payload].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .addCase(fetchShopTargetedRequests.rejected, (state, action) => {
        state.loadingTargetedRequests = false;
        state.error = action.payload as string;
      })
      // --- Submit Quote ---
      .addCase(submitCommissionQuote.pending, (state) => {
        state.isSubmittingQuote = true;
      })
      .addCase(submitCommissionQuote.fulfilled, (state) => {
        state.isSubmittingQuote = false;
      })
      .addCase(submitCommissionQuote.rejected, (state) => {
        state.isSubmittingQuote = false;
      })
      // --- Revoke Quote ---
      .addCase(revokeCommissionQuote.pending, (state) => {
        state.isRevokingQuote = true;
      })
      .addCase(revokeCommissionQuote.fulfilled, (state) => {
        state.isRevokingQuote = false;
      })
      .addCase(revokeCommissionQuote.rejected, (state) => {
        state.isRevokingQuote = false;
      })
      // --- Accept Quote ---
      .addCase(acceptCommissionQuote.pending, (state) => {
        state.isAcceptingQuote = true;
      })
      .addCase(acceptCommissionQuote.fulfilled, (state) => {
        state.isAcceptingQuote = false;
      })
      .addCase(acceptCommissionQuote.rejected, (state) => {
        state.isAcceptingQuote = false;
      })
      // --- Reject Quote ---
      .addCase(rejectCommissionQuote.pending, (state) => {
        state.isRejectingQuote = true;
      })
      .addCase(rejectCommissionQuote.fulfilled, (state) => {
        state.isRejectingQuote = false;
      })
      .addCase(rejectCommissionQuote.rejected, (state) => {
        state.isRejectingQuote = false;
      })
      // --- Cancel Commission ---
      .addCase(cancelCommission.pending, (state) => {
        state.isCanceling = true;
      })
      .addCase(cancelCommission.fulfilled, (state) => {
        state.isCanceling = false;
      })
      .addCase(cancelCommission.rejected, (state) => {
        state.isCanceling = false;
      })
      // --- Publish to Pool ---
      .addCase(publishCommissionToPool.pending, (state) => {
        state.isPublishingToPool = true;
      })
      .addCase(publishCommissionToPool.fulfilled, (state) => {
        state.isPublishingToPool = false;
      })
      .addCase(publishCommissionToPool.rejected, (state) => {
        state.isPublishingToPool = false;
      })
      // --- Fetch Pool ---
      .addCase(fetchPoolRequests.pending, (state) => {
        state.loadingPool = true;
        state.error = null;
      })
      .addCase(fetchPoolRequests.fulfilled, (state, action) => {
        state.loadingPool = false;
        state.poolRequests = [...action.payload].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .addCase(fetchPoolRequests.rejected, (state, action) => {
        state.loadingPool = false;
        state.error = action.payload as string;
      })
      // --- Fetch Shop Quotes ---
      .addCase(fetchShopQuotes.pending, (state) => {
        state.loadingShopQuotes = true;
        state.error = null;
      })
      .addCase(fetchShopQuotes.fulfilled, (state, action) => {
        state.loadingShopQuotes = false;
        state.shopQuotes = [...action.payload].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })
      .addCase(fetchShopQuotes.rejected, (state, action) => {
        state.loadingShopQuotes = false;
        state.error = action.payload as string;
      })
      // --- Update Commission Request ---
      .addCase(updateCommissionRequestThunk.pending, (state) => {
        state.isUpdatingRequest = true;
      })
      .addCase(updateCommissionRequestThunk.fulfilled, (state) => {
        state.isUpdatingRequest = false;
      })
      .addCase(updateCommissionRequestThunk.rejected, (state) => {
        state.isUpdatingRequest = false;
      });
  },
});

export default commissionSlice.reducer;
