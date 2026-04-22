import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import {
  Voucher,
  PaginatedResponse,
  CreatePromotionVoucherPayload,
  CreateNegotiationVoucherPayload,
  UpdateVoucherPayload,
  VoucherUsageItem,
  VoucherUsageResponse,
  voucherService,
} from "@/src/services/voucher.service";
import {
  ApplicableVouchersData,
  ApplyVoucherPayload,
  ApplyVoucherResponseData,
} from "@/src/types/voucher.types";
import { RootState } from "@/src/store";
import { toast } from "react-toastify";

// ─── Async Thunks ────────────────────────────────────────

export const fetchShopVouchers = createAsyncThunk(
  "voucher/fetchShopVouchers",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await voucherService.getShopVouchers(page, size);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi lấy danh sách voucher",
      );
    }
  },
);

export const createPromotionVoucherThunk = createAsyncThunk(
  "voucher/createPromotionVoucher",
  async (
    payload: CreatePromotionVoucherPayload,
    { rejectWithValue, dispatch, getState },
  ) => {
    try {
      const response = await voucherService.createPromotionVoucher(payload);

      // Refresh the voucher list with current pagination
      const state = getState() as { voucher: VoucherState };
      const { currentPage, pageSize } = state.voucher.pagination;
      dispatch(fetchShopVouchers({ page: currentPage, size: pageSize }));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi tạo voucher",
      );
    }
  },
);

export const updateVoucherThunk = createAsyncThunk(
  "voucher/updateVoucher",
  async (
    { id, payload }: { id: string; payload: UpdateVoucherPayload },
    { rejectWithValue, dispatch, getState },
  ) => {
    try {
      const response = await voucherService.updateVoucher(id, payload);

      // Refresh the voucher list with current pagination
      const state = getState() as { voucher: VoucherState };
      const { currentPage, pageSize } = state.voucher.pagination;
      dispatch(fetchShopVouchers({ page: currentPage, size: pageSize }));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ||
          error?.response?.data?.message ||
          "Lỗi cập nhật voucher",
      );
    }
  },
);

export const deleteVoucherThunk = createAsyncThunk(
  "voucher/deleteVoucher",
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await voucherService.deleteVoucher(id);

      // Refresh the voucher list with current pagination
      const state = getState() as { voucher: VoucherState };
      const { currentPage, pageSize } = state.voucher.pagination;
      dispatch(fetchShopVouchers({ page: currentPage, size: pageSize }));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi xoá voucher",
      );
    }
  },
);

export const toggleVoucherStatusThunk = createAsyncThunk(
  "voucher/toggleVoucherStatus",
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await voucherService.toggleVoucherStatus(id);
      if (!response.success) {
        return rejectWithValue(
          response.message || "Không thể cập nhật trạng thái voucher",
        );
      }

      // Refresh the voucher list with current pagination
      const state = getState() as { voucher: VoucherState };
      const { currentPage, pageSize } = state.voucher.pagination;
      dispatch(fetchShopVouchers({ page: currentPage, size: pageSize }));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ||
          error?.response?.data?.message ||
          "Lỗi cập nhật trạng thái voucher",
      );
    }
  },
);

export const getVoucherDetailsThunk = createAsyncThunk(
  "voucher/getVoucherDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await voucherService.getVoucherById(id);
      if (!response.success) {
        return rejectWithValue(
          response.message || "Không thể lấy chi tiết voucher",
        );
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ||
          error?.response?.data?.message ||
          "Lỗi lấy chi tiết voucher",
      );
    }
  },
);

export const getVoucherUsageHistoryThunk = createAsyncThunk(
  "voucher/getVoucherUsageHistory",
  async (
    payload: { id: string; pageNumber: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await voucherService.getVoucherUsageHistory(
        payload.id,
        payload.pageNumber,
        payload.pageSize,
      );
      if (!response.success) {
        return rejectWithValue(
          response.message || "Không thể lấy lịch sử sử dụng voucher",
        );
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ||
          error?.response?.data?.message ||
          "Lỗi lấy lịch sử sử dụng voucher",
      );
    }
  },
);

export const fetchApplicableVouchersThunk = createAsyncThunk(
  "voucher/fetchApplicableVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await voucherService.getApplicableVouchers();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ||
          error?.response?.data?.message ||
          "Lỗi lấy voucher áp dụng",
      );
    }
  },
);

export const applyVoucherThunk = createAsyncThunk(
  "voucher/applyVoucher",
  async (payload: ApplyVoucherPayload, { rejectWithValue }) => {
    try {
      const response = await voucherService.applyVoucher(payload);
      if (!response.success) {
        return rejectWithValue(response.message || "Không thể áp dụng voucher");
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi áp dụng voucher",
      );
    }
  },
);

export const removeAllVouchersThunk = createAsyncThunk(
  "voucher/removeAllVouchers",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await voucherService.removeAllVouchers(orderId);
      if (!response.success) {
        return rejectWithValue(response.message || "Không thể xoá voucher");
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi xoá voucher",
      );
    }
  },
);

export const removeVoucherThunk = createAsyncThunk(
  "voucher/removeVoucher",
  async (payload: { orderId: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await voucherService.removeVoucher(
        payload.orderId,
        payload.code,
      );
      if (!response.success) {
        return rejectWithValue(response.message || "Không thể xoá voucher");
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi xoá voucher",
      );
    }
  },
);

export const createNegotiationVoucherThunk = createAsyncThunk(
  "voucher/createNegotiationVoucher",
  async (
    payload: CreateNegotiationVoucherPayload,
    { rejectWithValue },
  ) => {
    try {
      const response = await voucherService.createNegotiationVoucher(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Lỗi tạo voucher thương lượng",
      );
    }
  },
);

// ─── State ───────────────────────────────────────────────

interface VoucherState {
  vouchers: Voucher[];
  pagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  loadingVouchers: boolean;
  isCreatingVoucher: boolean;
  isUpdatingVoucher: boolean;
  // Applicable vouchers (cart / checkout)
  applicableVouchers: ApplicableVouchersData | null;
  isFetchingApplicable: boolean;
  // Selected vouchers for checkout
  selectedSystemVoucherCode: string | null;
  selectedShopVoucherCodes: Record<string, string[]>; // shopId -> voucherCodes
  // Apply voucher result (checkout summary)
  checkoutSummary: ApplyVoucherResponseData | null;
  isApplyingVoucher: boolean;
  isRemovingVoucher: boolean;
  // Voucher details
  selectedVoucherDetails: Voucher | null;
  isFetchingDetails: boolean;
  // Voucher usage history
  usageHistory: VoucherUsageItem[];
  usagePagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  } | null;
  isFetchingUsage: boolean;
}

const initialState: VoucherState = {
  vouchers: [],
  pagination: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  loadingVouchers: false,
  isCreatingVoucher: false,
  isUpdatingVoucher: false,
  applicableVouchers: null,
  isFetchingApplicable: false,
  selectedSystemVoucherCode: null,
  selectedShopVoucherCodes: {},
  checkoutSummary: null,
  isApplyingVoucher: false,
  isRemovingVoucher: false,
  selectedVoucherDetails: null,
  isFetchingDetails: false,
  usageHistory: [],
  usagePagination: null,
  isFetchingUsage: false,
};

// ─── Slice ───────────────────────────────────────────────

const voucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {
    setSelectedSystemVoucher(state, action: { payload: string | null }) {
      state.selectedSystemVoucherCode = action.payload;
    },
    setSelectedShopVouchers(
      state,
      action: { payload: { shopId: string; voucherCodes: string[] } },
    ) {
      state.selectedShopVoucherCodes[action.payload.shopId] =
        action.payload.voucherCodes;
    },
    clearAllSelectedVouchers(state) {
      state.selectedSystemVoucherCode = null;
      state.selectedShopVoucherCodes = {};
    },
    clearCheckoutSummary(state) {
      state.checkoutSummary = null;
    },
    clearVoucherDetails(state) {
      state.selectedVoucherDetails = null;
      state.usageHistory = [];
      state.usagePagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchShopVouchers ──
      .addCase(fetchShopVouchers.pending, (state) => {
        state.loadingVouchers = true;
      })
      .addCase(fetchShopVouchers.fulfilled, (state, action) => {
        state.loadingVouchers = false;
        const data = action.payload as PaginatedResponse<Voucher>;
        state.vouchers = data.items;
        state.pagination = {
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage,
        };
      })
      .addCase(fetchShopVouchers.rejected, (state) => {
        state.loadingVouchers = false;
      })
      // ── createPromotionVoucher ──
      .addCase(createPromotionVoucherThunk.pending, (state) => {
        state.isCreatingVoucher = true;
      })
      .addCase(createPromotionVoucherThunk.fulfilled, (state) => {
        state.isCreatingVoucher = false;
      })
      .addCase(createPromotionVoucherThunk.rejected, (state) => {
        state.isCreatingVoucher = false;
      })
      // ── updateVoucher ──
      .addCase(updateVoucherThunk.pending, (state) => {
        state.isUpdatingVoucher = true;
      })
      .addCase(updateVoucherThunk.fulfilled, (state) => {
        state.isUpdatingVoucher = false;
      })
      .addCase(updateVoucherThunk.rejected, (state) => {
        state.isUpdatingVoucher = false;
      })
      // ── deleteVoucher ──
      .addCase(deleteVoucherThunk.pending, (state) => {
        state.loadingVouchers = true;
      })
      .addCase(deleteVoucherThunk.fulfilled, (state) => {
        state.loadingVouchers = false;
      })
      .addCase(deleteVoucherThunk.rejected, (state) => {
        state.loadingVouchers = false;
      })
      // ── toggleVoucherStatus ──
      .addCase(toggleVoucherStatusThunk.pending, (state) => {
        state.loadingVouchers = true;
      })
      .addCase(toggleVoucherStatusThunk.fulfilled, (state) => {
        state.loadingVouchers = false;
      })
      .addCase(toggleVoucherStatusThunk.rejected, (state) => {
        state.loadingVouchers = false;
      })
      // ── getVoucherDetails ──
      .addCase(getVoucherDetailsThunk.pending, (state) => {
        state.isFetchingDetails = true;
        state.selectedVoucherDetails = null;
        state.usageHistory = [];
        state.usagePagination = null;
      })
      .addCase(getVoucherDetailsThunk.fulfilled, (state, action) => {
        state.isFetchingDetails = false;
        state.selectedVoucherDetails = action.payload.data;
      })
      .addCase(getVoucherDetailsThunk.rejected, (state) => {
        state.isFetchingDetails = false;
      })
      // ── getVoucherUsageHistory ──
      .addCase(getVoucherUsageHistoryThunk.pending, (state) => {
        state.isFetchingUsage = true;
      })
      .addCase(getVoucherUsageHistoryThunk.fulfilled, (state, action) => {
        state.isFetchingUsage = false;
        const data = action.payload.data as VoucherUsageResponse;
        state.usageHistory = data.items;
        state.usagePagination = {
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage,
        };
      })
      .addCase(getVoucherUsageHistoryThunk.rejected, (state) => {
        state.isFetchingUsage = false;
      })
      // ── fetchApplicableVouchers ──
      .addCase(fetchApplicableVouchersThunk.pending, (state) => {
        state.isFetchingApplicable = true;
      })
      .addCase(fetchApplicableVouchersThunk.fulfilled, (state, action) => {
        state.isFetchingApplicable = false;
        state.applicableVouchers = action.payload.data;
      })
      .addCase(fetchApplicableVouchersThunk.rejected, (state) => {
        state.isFetchingApplicable = false;
      })
      // ── applyVoucher ──
      .addCase(applyVoucherThunk.pending, (state) => {
        state.isApplyingVoucher = true;
      })
      .addCase(applyVoucherThunk.fulfilled, (state, action) => {
        state.isApplyingVoucher = false;
        state.checkoutSummary = action.payload.data;
        toast.success("Voucher applied successfully");
      })
      .addCase(applyVoucherThunk.rejected, (state, action) => {
        state.isApplyingVoucher = false;
        toast.error((action.payload as string) || "Lỗi áp dụng voucher");
      })
      // ── removeAllVouchers ──
      .addCase(removeAllVouchersThunk.pending, (state) => {
        state.isRemovingVoucher = true;
      })
      .addCase(removeAllVouchersThunk.fulfilled, (state) => {
        state.isRemovingVoucher = false;
        state.isApplyingVoucher = false;
        state.checkoutSummary = null;
        state.selectedSystemVoucherCode = null;
        state.selectedShopVoucherCodes = {};
        toast.success("All vouchers removed successfully");
      })
      .addCase(removeAllVouchersThunk.rejected, (state, action) => {
        state.isRemovingVoucher = false;
        toast.error((action.payload as string) || "Lỗi xoá voucher");
      })
      // ── removeVoucher (single) ──
      .addCase(removeVoucherThunk.pending, (state) => {
        state.isApplyingVoucher = true;
      })
      .addCase(removeVoucherThunk.fulfilled, (state, action) => {
        state.isApplyingVoucher = false;
        state.checkoutSummary = action.payload.data;
        toast.success("Voucher removed successfully");
      })
      .addCase(removeVoucherThunk.rejected, (state, action) => {
        state.isApplyingVoucher = false;
        toast.error((action.payload as string) || "Lỗi xoá voucher");
      });
  },
});

export const {
  setSelectedSystemVoucher,
  setSelectedShopVouchers,
  clearAllSelectedVouchers,
  clearCheckoutSummary,
  clearVoucherDetails,
} = voucherSlice.actions;

export default voucherSlice.reducer;

// ─── Memoized Selectors ──────────────────────────────────

/** Base selector – raw applicable data */
export const selectApplicableData = (state: RootState) =>
  state.voucher.applicableVouchers;

/** System-wide vouchers */
export const selectSystemVouchers = createSelector(
  selectApplicableData,
  (data): Voucher[] => data?.systemVouchers ?? [],
);

/** All shop voucher groups */
export const selectShopVoucherGroups = createSelector(
  selectApplicableData,
  (data) => data?.shopVoucherGroups ?? [],
);

/**
 * Selector factory – returns vouchers for a specific shopId.
 * Usage: `useAppSelector((state) => selectShopVouchersByShopId(state, shopId))`
 */
export const selectShopVouchersByShopId = createSelector(
  [selectShopVoucherGroups, (_state: RootState, shopId: string) => shopId],
  (groups, shopId): Voucher[] =>
    groups.find((g) => g.shopId === shopId)?.vouchers ?? [],
);

export const selectIsFetchingApplicable = (state: RootState) =>
  state.voucher.isFetchingApplicable;

/** Currently selected system voucher code */
export const selectSelectedSystemVoucherCode = (state: RootState) =>
  state.voucher.selectedSystemVoucherCode;

/** Currently selected shop voucher codes for a given shop */
export const selectSelectedShopVoucherCodes = (
  state: RootState,
  shopId: string,
) => state.voucher.selectedShopVoucherCodes[shopId] ?? [];

/** Checkout summary from apply-voucher response */
export const selectCheckoutSummary = (state: RootState) =>
  state.voucher.checkoutSummary;

/** Whether a voucher is currently being applied */
export const selectIsApplyingVoucher = (state: RootState) =>
  state.voucher.isApplyingVoucher;

/** Whether vouchers are currently being removed */
export const selectIsRemovingVoucher = (state: RootState) =>
  state.voucher.isRemovingVoucher;
