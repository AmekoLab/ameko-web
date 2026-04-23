import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  walletService,
  ApproveWithdrawalPayload,
  RejectWithdrawalPayload,
  WithdrawalItem,
  TransactionItem,
} from "@/src/services/wallet.service";
import { toast } from "react-toastify";

// ─── Types ───────────────────────────────────────────────
interface AdminWalletPagination {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface AdminWalletState {
  withdrawals: WithdrawalItem[];
  loading: boolean;
  pagination: AdminWalletPagination | null;
  approveLoading: boolean;
  rejectLoading: boolean;
  error: string | null;
  transactions: TransactionItem[];
  transactionsPagination: AdminWalletPagination | null;
  loadingTransactions: boolean;
  pendingWithdrawals: TransactionItem[];
  pendingPagination: AdminWalletPagination | null;
  loadingPending: boolean;
  processedWithdrawals: TransactionItem[];
  processedPagination: AdminWalletPagination | null;
  loadingProcessed: boolean;
}

const initialState: AdminWalletState = {
  withdrawals: [],
  loading: false,
  pagination: null,
  approveLoading: false,
  rejectLoading: false,
  error: null,
  transactions: [],
  transactionsPagination: null,
  loadingTransactions: false,
  pendingWithdrawals: [],
  pendingPagination: null,
  loadingPending: false,
  processedWithdrawals: [],
  processedPagination: null,
  loadingProcessed: false,
};

// ─── Async Thunk: Fetch pending withdrawals ──────────────
export const fetchPendingWithdrawals = createAsyncThunk(
  "adminWallet/fetchPendingWithdrawals",
  async (
    params: { currentPage: number; pageSize: number; status?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await walletService.getPendingWithdrawals(params);
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to fetch withdrawals");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch withdrawals");
    }
  },
);

// ─── Async Thunk: Approve a shop withdrawal ──────────────
export const approveShopWithdrawal = createAsyncThunk(
  "adminWallet/approveShopWithdrawal",
  async (
    { paymentId, data }: { paymentId: string; data: ApproveWithdrawalPayload },
    { rejectWithValue },
  ) => {
    try {
      const res = await walletService.approveWithdrawal(paymentId, data);
      if (res.success) {
        toast.success(res.message || "Withdrawal approved successfully.");
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to approve withdrawal");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to approve withdrawal");
      return rejectWithValue(err.message || "Failed to approve withdrawal");
    }
  },
);

// ─── Async Thunk: Reject a shop withdrawal ───────────────
export const rejectShopWithdrawal = createAsyncThunk(
  "adminWallet/rejectShopWithdrawal",
  async (
    { paymentId, data }: { paymentId: string; data: RejectWithdrawalPayload },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const res = await walletService.rejectWithdrawal(paymentId, data);
      if (res.success) {
        toast.success(res.message || "Withdrawal rejected successfully.");
        dispatch(fetchPendingWithdrawals({ currentPage: 1, pageSize: 10 }));
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to reject withdrawal");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to reject withdrawal");
      return rejectWithValue(err.message || "Failed to reject withdrawal");
    }
  },
);

// ─── Async Thunk: Fetch admin transactions ──────────────
export const fetchAdminTransactions = createAsyncThunk(
  "adminWallet/fetchAdminTransactions",
  async (
    { currentPage, pageSize }: { currentPage: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await walletService.getAdminTransactions(
        currentPage,
        pageSize,
      );
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to fetch transactions");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch transactions");
    }
  },
);

// ─── Async Thunk: Fetch pending withdrawal transactions ─
export const fetchPendingWithdrawalTxns = createAsyncThunk(
  "adminWallet/fetchPendingWithdrawalTxns",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await walletService.getPendingWithdrawalTxns(page, size);
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(
        res.message || "Failed to fetch pending withdrawals",
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(
        err.message || "Failed to fetch pending withdrawals",
      );
    }
  },
);

// ─── Async Thunk: Fetch processed withdrawals ─────────────
export const fetchProcessedWithdrawals = createAsyncThunk(
  "adminWallet/fetchProcessedWithdrawals",
  async (
    { pageIndex, pageSize }: { pageIndex: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await walletService.getProcessedWithdrawals(pageIndex, pageSize);
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(
        res.message || "Failed to fetch processed withdrawals",
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(
        err.message || "Failed to fetch processed withdrawals",
      );
    }
  },
);

// ─── Slice ───────────────────────────────────────────────
const adminWalletSlice = createSlice({
  name: "adminWallet",
  initialState,
  reducers: {
    resetAdminWallet: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchPendingWithdrawals
    builder
      .addCase(fetchPendingWithdrawals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals = action.payload.items;
        state.pagination = {
          totalCount: action.payload.totalCount,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          hasPreviousPage: action.payload.hasPreviousPage,
          hasNextPage: action.payload.hasNextPage,
        };
      })
      .addCase(fetchPendingWithdrawals.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // approveShopWithdrawal
    builder
      .addCase(approveShopWithdrawal.pending, (state) => {
        state.approveLoading = true;
        state.error = null;
      })
      .addCase(approveShopWithdrawal.fulfilled, (state) => {
        state.approveLoading = false;
      })
      .addCase(approveShopWithdrawal.rejected, (state, action) => {
        state.approveLoading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // rejectShopWithdrawal
    builder
      .addCase(rejectShopWithdrawal.pending, (state) => {
        state.rejectLoading = true;
        state.error = null;
      })
      .addCase(rejectShopWithdrawal.fulfilled, (state) => {
        state.rejectLoading = false;
      })
      .addCase(rejectShopWithdrawal.rejected, (state, action) => {
        state.rejectLoading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // fetchAdminTransactions
    builder
      .addCase(fetchAdminTransactions.pending, (state) => {
        state.loadingTransactions = true;
        state.error = null;
      })
      .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
        state.loadingTransactions = false;
        state.transactions = action.payload.items;
        state.transactionsPagination = {
          totalCount: action.payload.totalCount,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          hasPreviousPage: action.payload.hasPreviousPage,
          hasNextPage: action.payload.hasNextPage,
        };
      })
      .addCase(fetchAdminTransactions.rejected, (state, action) => {
        state.loadingTransactions = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // fetchPendingWithdrawalTxns
    builder
      .addCase(fetchPendingWithdrawalTxns.pending, (state) => {
        state.loadingPending = true;
        state.error = null;
      })
      .addCase(fetchPendingWithdrawalTxns.fulfilled, (state, action) => {
        state.loadingPending = false;
        state.pendingWithdrawals = action.payload.items;
        state.pendingPagination = {
          totalCount: action.payload.totalCount,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          hasPreviousPage: action.payload.hasPreviousPage,
          hasNextPage: action.payload.hasNextPage,
        };
      })
      .addCase(fetchPendingWithdrawalTxns.rejected, (state, action) => {
        state.loadingPending = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // fetchProcessedWithdrawals
    builder
      .addCase(fetchProcessedWithdrawals.pending, (state) => {
        state.loadingProcessed = true;
        state.error = null;
      })
      .addCase(fetchProcessedWithdrawals.fulfilled, (state, action) => {
        state.loadingProcessed = false;
        state.processedWithdrawals = action.payload.items;
        state.processedPagination = {
          totalCount: action.payload.totalCount,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          hasPreviousPage: action.payload.hasPreviousPage,
          hasNextPage: action.payload.hasNextPage,
        };
      })
      .addCase(fetchProcessedWithdrawals.rejected, (state, action) => {
        state.loadingProcessed = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetAdminWallet } = adminWalletSlice.actions;
export default adminWalletSlice.reducer;
