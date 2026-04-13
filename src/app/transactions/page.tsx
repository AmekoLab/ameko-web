"use client";

import { useEffect, useState, useCallback } from "react";
import { walletService } from "@/src/services/wallet.service";
import {
  Transaction,
  TransactionQueryParams,
  PaginatedTransactions,
} from "@/src/types/wallet.types";
import toast from "react-hot-toast";
import { Wallet, FilterX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// ─── Constants ────────────────────────────────────────────
const TRANSACTION_TYPES: { label: string; value: number }[] = [
  { label: "All Types", value: -1 },
  { label: "Order Payment", value: 0 },
  { label: "Order Refund", value: 1 },
  { label: "Sales Revenue", value: 2 },
  { label: "Deposit", value: 3 },
  { label: "Withdrawal", value: 4 },
  { label: "Sales Pending", value: 5 },
  { label: "Manual Adjustment", value: 6 },
];

const TRANSACTION_STATUSES: { label: string; value: number }[] = [
  { label: "All Statuses", value: -1 },
  { label: "Pending", value: 0 },
  { label: "Completed", value: 1 },
  { label: "Failed", value: 2 },
  { label: "Cancelled", value: 3 },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const SORT_OPTIONS = [
  { label: "Date Created", value: "createdAt" },
  { label: "Amount", value: "amount" },
  { label: "Fee", value: "feeAmount" },
];

// ─── Helpers ──────────────────────────────────────────────
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-700 bg-green-50";
    case "pending":
      return "text-yellow-700 bg-yellow-50";
    case "failed":
      return "text-red-700 bg-red-50";
    case "cancelled":
      return "text-neutral-600 bg-neutral-100";
    default:
      return "text-neutral-600 bg-neutral-100";
  }
}

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "payment":
      return "💳";
    case "deposit":
      return "📥";
    case "withdrawal":
      return "📤";
    case "refund":
      return "🔄";
    case "fee":
      return "💸";
    case "transfer":
      return "🔀";
    default:
      return "📋";
  }
}

// ─── Component ────────────────────────────────────────────
export default function TransactionsPage() {
  // ── Data state ──────────────────────────────────────────
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Query params (single source of truth) ───────────────
  const [queryParams, setQueryParams] = useState<TransactionQueryParams>({
    pageNumber: 1,
    pageSize: 10,
    isAscending: false,
    sortBy: "createdAt",
  });

  // ── Filter UI state (local, applied on submit) ──────────
  const [filterType, setFilterType] = useState<number>(-1);
  const [filterStatus, setFilterStatus] = useState<number>(-1);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // ── Fetch ───────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await walletService.getTransactions(queryParams);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || "Failed to load transactions");
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Handlers ────────────────────────────────────────────
  const handleApplyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      type: filterType >= 0 ? filterType : undefined,
      status: filterStatus >= 0 ? filterStatus : undefined,
      fromDate: filterFromDate
        ? new Date(filterFromDate).toISOString()
        : undefined,
      toDate: filterToDate ? new Date(filterToDate).toISOString() : undefined,
      pageNumber: 1, // Reset to page 1 when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilterType(-1);
    setFilterStatus(-1);
    setFilterFromDate("");
    setFilterToDate("");
    setQueryParams({
      pageNumber: 1,
      pageSize: queryParams.pageSize,
      isAscending: queryParams.isAscending,
      sortBy: queryParams.sortBy,
    });
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setQueryParams((prev) => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
  };

  const handleSortChange = (field: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: field,
      isAscending: prev.sortBy === field ? !prev.isAscending : false,
      pageNumber: 1,
    }));
  };

  // ── Derived values ──────────────────────────────────────
  const transactions: Transaction[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.currentPage ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8 font-sans w-full">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hidden sm:block shadow-sm border border-blue-100">
               <Wallet className="w-6 h-6" />
             </div>
             Transaction History
           </h1>
           <p className="mt-2 text-sm text-neutral-500 font-medium">
             Track and manage your wallet balances, deposits, and financial activity.
           </p>
        </div>

        {/* ── Filters Card ──────────────────────────────── */}
        <div className="mb-8 rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 overflow-hidden">
          <div className="mb-5 flex items-center justify-between border-b border-neutral-50 pb-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Filter Transactions
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Type filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Type
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Status
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                {TRANSACTION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* From date */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                From Date
              </label>
              <input
                id="filter-from-date"
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* To date */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                To Date
              </label>
              <input
                id="filter-to-date"
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            
            <div className="w-full sm:col-span-2 lg:col-span-4 mt-2">
               <button
                 id="btn-apply-filters"
                 onClick={handleApplyFilters}
                 className="w-full bg-neutral-900 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
               >
                 Apply Filters
               </button>
            </div>
          </div>
        </div>

        {/* ── Sort & Page Size Controls ─────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500">Sort By</span>
            <div className="flex gap-2 bg-neutral-100/50 p-1 rounded-xl">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    queryParams.sortBy === opt.value
                      ? "bg-white text-neutral-900 shadow-sm border border-neutral-200"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-white/50 border border-transparent"
                  }`}
                >
                  {opt.label}
                  {queryParams.sortBy === opt.value && (
                    <span className="ml-1 font-bold">
                      {queryParams.isAscending ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-sm">
            <label className="text-xs font-semibold text-neutral-500">Show</label>
            <select
              id="page-size-select"
              value={queryParams.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-neutral-900 outline-none pr-1 focus:ring-0 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4 hidden md:table-cell">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 bg-white">
                {isLoading ? (
                  Array.from({ length: queryParams.pageSize || 10 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className={`px-6 py-5 ${j === 1 ? 'hidden md:table-cell' : ''}`}>
                          <div className="h-5 w-full max-w-[120px] animate-pulse rounded-md bg-neutral-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-20 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8 text-neutral-300" />
                         </div>
                         <p className="text-base font-semibold text-neutral-900 mb-1">No transactions found</p>
                         <p className="text-sm text-neutral-500">Try adjusting your filters to find what you're looking for.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-neutral-50/50 group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 text-[15px] shrink-0">
                               {getTypeIcon(tx.type)}
                           </div>
                           <span className="font-semibold text-neutral-900 capitalize block">
                              {tx.type}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                         <p className="max-w-[240px] truncate text-xs font-medium text-neutral-500 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100/50">
                           {tx.description || "N/A"}
                         </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-amazon-price whitespace-nowrap bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                               {formatCurrency(tx.amount, tx.currency)}
                            </span>
                            {tx.feeAmount > 0 && (
                               <span className="text-xs font-medium text-neutral-400">
                                  Fee: {formatCurrency(tx.feeAmount, tx.currency)}
                               </span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 box-border rounded-md border shadow-sm whitespace-nowrap ${getStatusColor(tx.status)}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap text-xs font-medium text-neutral-500">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ──────────────────────────────────  */}
        {data && totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-1">
            <p className="text-sm font-medium text-neutral-500">
              Showing <span className="font-bold text-neutral-900">{transactions.length}</span> of{" "}
              <span className="font-bold text-neutral-900">{totalCount}</span> transactions
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={!data.hasPreviousPage}
                onClick={() => handlePageChange(1)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">First</span>
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                disabled={!data.hasPreviousPage}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page numbers (show max 5 centered around current) */}
              <div className="flex items-center gap-1 mx-2">
                  {(() => {
                    const maxVisible = 5;
                    let start = Math.max(
                      1,
                      currentPage - Math.floor(maxVisible / 2),
                    );
                    const end = Math.min(totalPages, start + maxVisible - 1);
                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    return Array.from(
                      { length: end - start + 1 },
                      (_, i) => start + i,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[36px] h-[36px] rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                          page === currentPage
                            ? "bg-neutral-900 text-white shadow-md cursor-default"
                            : "text-neutral-600 bg-white hover:bg-neutral-50 border border-transparent hover:border-neutral-200 active:scale-[0.98]"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
              </div>

              <button
                disabled={!data.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                disabled={!data.hasNextPage}
                onClick={() => handlePageChange(totalPages)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">Last</span>
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
