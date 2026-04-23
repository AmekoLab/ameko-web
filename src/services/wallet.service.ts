import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  TransactionDetail,
  TransactionQueryParams,
  TransactionResponse,
} from "@/src/types/wallet.types";

export interface PinStatusResponse {
  hasPin: boolean;
}

export interface SetupPinPayload {
  currentPassword: string;
  newPin: string;
}

export interface WithdrawPayload {
  amount: number;
  walletPin: string;
}

export interface ApproveWithdrawalPayload {
  reason: string;
  evidenceImageUrl: string;
}

export interface RejectWithdrawalPayload {
  reason: string;
  evidenceImageUrl: string;
}

export interface ResetPinPayload {
  otp: string;
  newPin: string;
}

export interface ChangePinPayload {
  oldPin: string;
  newPin: string;
  confirmNewPin: string;
}

export interface WithdrawalItem {
  paymentId: string;
  shopName: string;
  shopId: string;
  amount: number;
  status: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  requestedAt: string;
  processedAt: string | null;
  reason: string | null;
  evidenceImageUrl: string | null;
}

export interface WithdrawalListResponse {
  items: WithdrawalItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TransactionItem {
  id: string;
  amount: number;
  feeAmount: number;
  grossAmount?: number;
  netAmount?: number;
  flowDirection?: string; // "In" | "Out" | "Held"
  currency: string;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;

  // --- Các field thông tin ngân hàng mới ---
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;

  // --- Các field BỔ SUNG TỪ API PENDING WITHDRAWAL ---
  totalDeducted?: number;
  shopName?: string | null;
  userId?: string | null;
  requestedAt?: string | null;
  processedAt?: string | null;
  adminMessage?: string | null;
  evidenceUrl?: string | null;
}

export interface HeldTransaction {
  transactionId: string;
  amount: number;
  date: string;
  orderId: string;
  orderStatus: string;
  reason: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const walletService = {
  /**
   * Initialize a new wallet for the current user.
   * POST /wallet/init
   */
  initWallet: async (): Promise<ApiResponse<null>> => {
    return api.post<unknown, ApiResponse<null>>("/wallet/init");
  },

  /**
   * Fetch wallet details for the current user.
   * GET /wallet
   */
  getDetails: async (): Promise<
    ApiResponse<{ balance: number; heldBalance: number }>
  > => {
    return api.get("/wallet");
  },

  /**
   * Check whether the current user has set up a wallet PIN.
   * GET /wallet/pin/status
   */
  getPinStatus: async (): Promise<ApiResponse<PinStatusResponse>> => {
    return api.get("/wallet/pin/status");
  },

  /**
   * Set up a wallet PIN for the current user.
   * POST /wallet/pin/setup
   */
  setupPin: async (data: SetupPinPayload): Promise<ApiResponse<null>> => {
    return api.post<unknown, ApiResponse<null>>("/wallet/pin/setup", data);
  },

  /**
   * Request a PIN reset OTP.
   * POST /wallet/pin/forgot
   */
  forgotPin: async (): Promise<ApiResponse<null>> => {
    return api.post<unknown, ApiResponse<null>>("/wallet/pin/forgot", {});
  },

  /**
   * Reset wallet PIN with OTP.
   * POST /wallet/pin/reset
   */
  resetPin: async (payload: ResetPinPayload): Promise<ApiResponse<null>> => {
    return api.post<unknown, ApiResponse<null>>("/wallet/pin/reset", payload);
  },

  /**
   * Change wallet PIN.
   * PUT /wallet/pin/change
   */
  changePin: async (payload: ChangePinPayload): Promise<ApiResponse<null>> => {
    return api.put<unknown, ApiResponse<null>>("/wallet/pin/change", payload);
  },

  /**
   * Request a withdrawal from the wallet.
   * POST /wallet/withdraw
   */
  withdraw: async (payload: WithdrawPayload): Promise<ApiResponse<null>> => {
    return api.post<unknown, ApiResponse<null>>("/wallet/withdraw", payload);
  },

  /**
   * Fetch held (frozen) transactions for the current shop.
   * GET /wallet/held-transactions
   */
  getHeldTransactions: async (): Promise<ApiResponse<HeldTransaction[]>> => {
    return api.get("/wallet/held-transactions");
  },

  /**
   * Admin: Approve a shop withdrawal request.
   * POST /wallet/admin/withdrawals/:paymentId/approve
   */
  approveWithdrawal: async (
    paymentId: string,
    payload: ApproveWithdrawalPayload,
  ): Promise<ApiResponse<null>> => {
    return api.post<ApproveWithdrawalPayload, ApiResponse<null>>(
      `/wallet/admin/withdrawals/${paymentId}/approve`,
      payload,
    );
  },

  /**
   * Admin: Reject a shop withdrawal request.
   * POST /wallet/admin/withdrawals/:paymentId/reject
   */
  rejectWithdrawal: async (
    paymentId: string,
    payload: RejectWithdrawalPayload,
  ): Promise<ApiResponse<null>> => {
    return api.post<unknown, ApiResponse<null>>(
      `/wallet/admin/withdrawals/${paymentId}/reject`,
      payload,
    );
  },

  /**
   * Admin: Fetch pending withdrawal requests.
   * GET /wallet/admin/withdrawals
   */
  getPendingWithdrawals: async (params: {
    currentPage: number;
    pageSize: number;
    status?: string;
  }): Promise<ApiResponse<WithdrawalListResponse>> => {
    return api.get("/wallet/admin/withdrawals", { params });
  },

  /**
   * Admin: Fetch all transactions.
   * GET /wallet/admin/transactions
   */
  getAdminTransactions: async (
    currentPage: number,
    pageSize: number,
  ): Promise<ApiResponse<PaginatedResponse<TransactionItem>>> => {
    return api.get<unknown, ApiResponse<PaginatedResponse<TransactionItem>>>(
      "/wallet/admin/transactions",
      { params: { PageNumber: currentPage, PageSize: pageSize } },
    );
  },

  /**
   * Admin: Fetch pending withdrawal transactions.
   * GET /wallet/admin/withdrawals/pending
   */
  getPendingWithdrawalTxns: async (
    page = 1,
    size = 100,
  ): Promise<ApiResponse<PaginatedResponse<TransactionItem>>> => {
    return api.get<unknown, ApiResponse<PaginatedResponse<TransactionItem>>>(
      "/wallet/admin/withdrawals/pending",
      { params: { page, size } },
    );
  },

  /**
   * Admin: Fetch processed withdrawal transactions.
   * GET /Wallet/admin/withdrawals/processed
   */
  getProcessedWithdrawals: async (
    pageIndex = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<TransactionItem>>> => {
    return api.get<unknown, ApiResponse<PaginatedResponse<TransactionItem>>>(
      "/Wallet/admin/withdrawals/processed",
      { params: { pageIndex, pageSize } },
    );
  },

  /**
   * Fetch details for a specific transaction
   * GET /Wallet/transactions/{id}
   */
  getTransactionDetail: async (
    transactionId: string,
  ): Promise<ApiResponse<TransactionDetail>> => {
    return api.get(`/Wallet/transactions/${transactionId}`);
  },

  /**
   * Fetch details for a specific admin transaction
   * GET /Wallet/admin/transactions/{id}
   */
  getAdminTransactionDetail: async (
    transactionId: string,
  ): Promise<ApiResponse<TransactionDetail>> => {
    return api.get(`/Wallet/admin/transactions/${transactionId}`);
  },

  /**
   * Fetch paginated wallet transactions with filtering & sorting.
   * GET /Wallet/transactions
   */
  getTransactions: async (
    params: TransactionQueryParams,
  ): Promise<TransactionResponse> => {
    // Map camelCase → PascalCase to match API contract
    const query: Record<string, unknown> = {};
    if (params.type !== undefined) query.Type = params.type;
    if (params.status !== undefined) query.Status = params.status;
    if (params.fromDate) query.FromDate = params.fromDate;
    if (params.toDate) query.ToDate = params.toDate;
    if (params.pageNumber !== undefined) query.PageNumber = params.pageNumber;
    if (params.pageSize !== undefined) query.PageSize = params.pageSize;
    if (params.sortBy) query.SortBy = params.sortBy;
    if (params.isAscending !== undefined)
      query.IsAscending = params.isAscending;

    return api.get<unknown, TransactionResponse>("/Wallet/transactions", {
      params: query,
    });
  },
};
