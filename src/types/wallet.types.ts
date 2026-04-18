// ─── Transaction Query Params ─────────────────────────────
export interface TransactionQueryParams {
  type?: number;
  status?: number;
  fromDate?: string; // ISO 8601 date-time string
  toDate?: string; // ISO 8601 date-time string
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  isAscending?: boolean;
}

// ─── Transaction ──────────────────────────────────────────
export interface Transaction {
  id: string;
  amount: number;
  feeAmount: number;
  flowDirection: string; // "In" | "Out" | "Held" | "0"
  currency: string;
  type: string;
  status: string;
  description: string | null;
  balanceAfterTransaction: number;
  shopName: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  createdAt: string;
}

export interface TransactionDetail extends Transaction {
  balanceBeforeTransaction: number;
  heldBalanceBeforeTransaction: number;
  heldBalanceAfterTransaction: number;
  relatedOrderId: string | null;
  orderGroupId: string | null;
}

// ─── Paginated Wrapper ────────────────────────────────────
export interface PaginatedTransactions {
  items: Transaction[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ─── Full API Response ────────────────────────────────────
export interface TransactionResponse {
  success: boolean;
  message: string;
  data: PaginatedTransactions;
  errors: unknown | null;
}
