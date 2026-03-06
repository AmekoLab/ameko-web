import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { commissionService } from "@/src/services/commission.service";
import {
  CreateCommissionPayload,
  CommissionRequest,
  CommissionQuote,
  SubmitQuotePayload,
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
  isUpdatingQuote: boolean;
  isAcceptingQuote: boolean;
  isCanceling: boolean;
  isPublishingToPool: boolean;
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
  isUpdatingQuote: false,
  isAcceptingQuote: false,
  isCanceling: false,
  isPublishingToPool: false,
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
      return rejectWithValue(response.message || "Tạo yêu cầu thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi gửi yêu cầu báo giá";
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
      return rejectWithValue(response.message || "Lấy danh sách thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Lỗi khi lấy danh sách yêu cầu";
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
      return rejectWithValue(response.message || "Lấy chi tiết thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi lấy chi tiết yêu cầu";
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
      return rejectWithValue(response.message || "Lấy danh sách thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Lỗi khi lấy danh sách yêu cầu chỉ định";
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
      return rejectWithValue(response.message || "Lấy danh sách thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Lỗi khi lấy danh sách chợ chung";
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
        response.message || "Lấy danh sách báo giá thất bại",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi lấy lịch sử báo giá";
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
        toast.success("Gửi báo giá thành công!");
        return response.data;
      }
      return rejectWithValue(response.message || "Gửi báo giá thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi gửi báo giá";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const updateCommissionQuote = createAsyncThunk(
  "commission/updateQuote",
  async (
    { quoteId, payload }: { quoteId: string; payload: SubmitQuotePayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await commissionService.updateQuote(quoteId, payload);
      if (response.success) {
        toast.success("Cập nhật báo giá thành công!");
        return;
      }
      return rejectWithValue(response.message || "Cập nhật báo giá thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi cập nhật báo giá";
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
        toast.success("Yêu cầu đã được hủy thành công!");
        dispatch(fetchCommissionDetail(requestId));
        return;
      }
      return rejectWithValue(response.message || "Hủy yêu cầu thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi hủy yêu cầu";
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
        toast.success("Đã đăng yêu cầu lên Chợ chung thành công!");
        dispatch(fetchCommissionDetail(requestId));
        return;
      }
      return rejectWithValue(response.message || "Đăng lên Chợ chung thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi đăng lên Chợ chung";
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
      return rejectWithValue(response.message || "Chấp nhận báo giá thất bại");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi chấp nhận báo giá";
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
      // --- Update Quote ---
      .addCase(updateCommissionQuote.pending, (state) => {
        state.isUpdatingQuote = true;
      })
      .addCase(updateCommissionQuote.fulfilled, (state) => {
        state.isUpdatingQuote = false;
      })
      .addCase(updateCommissionQuote.rejected, (state) => {
        state.isUpdatingQuote = false;
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
      });
  },
});

export default commissionSlice.reducer;
