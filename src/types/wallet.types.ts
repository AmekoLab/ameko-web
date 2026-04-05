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
  currency: string;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;
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
