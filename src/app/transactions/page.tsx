"use client";

import { useEffect, useState, useCallback } from "react";
import { walletService } from "@/src/services/wallet.service";
import {
  Transaction,
  TransactionQueryParams,
  PaginatedTransactions,
} from "@/src/types/wallet.types";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────
const TRANSACTION_TYPES: { label: string; value: number }[] = [
  { label: "All Types", value: -1 },
  { label: "OrderPayment", value: 0 },
  { label: "OrderRefund", value: 1 },
  { label: "SalesRevenue", value: 2 },
  { label: "Deposit", value: 3 },
  { label: "Withdrawal", value: 4 },
  { label: "SalesPending", value: 5 },
  { label: "ManualAdjustment", value: 6 },
];

const TRANSACTION_STATUSES: { label: string; value: number }[] = [
  { label: "All Statuses", value: -1 },
  { label: "Pending", value: 0 },
  { label: "Completed", value: 1 },
  { label: "Failed", value: 2 },
  { label: "Cancelled", value: 3 },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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
      return "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200";
    case "pending":
      return "text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200";
    case "failed":
      return "text-red-600 bg-red-50 px-2 py-0.5 rounded-sm border border-red-200";
    case "cancelled":
      return "text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-300";
    default:
      return "text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-300";
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
    <div className="min-h-screen bg-amazon-bgSecondary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amazon-text uppercase font-oswald tracking-widest">
            Transaction History
          </h1>
          <p className="mt-1 text-sm text-amazon-textMuted uppercase font-bold tracking-widest">
            View and filter all your wallet transactions
          </p>
        </div>

        {/* ── Filters Card ──────────────────────────────── */}
        <div className="mb-6 rounded-sm border border-amazon-border bg-white shadow-sm p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-amazon-text">
              Filters
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted transition-colors hover:text-amazon-text"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Type filter */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
                Type
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(Number(e.target.value))}
                className="w-full rounded-sm border border-amazon-border bg-white px-3 py-2 text-sm text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary"
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
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
                Status
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(Number(e.target.value))}
                className="w-full rounded-sm border border-amazon-border bg-white px-3 py-2 text-sm text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary"
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
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
                From Date
              </label>
              <input
                id="filter-from-date"
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full rounded-sm border border-amazon-border bg-white px-3 py-2 text-sm text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary"
              />
            </div>

            {/* To date */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
                To Date
              </label>
              <input
                id="filter-to-date"
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full rounded-sm border border-amazon-border bg-white px-3 py-2 text-sm text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              id="btn-apply-filters"
              onClick={handleApplyFilters}
              className="rounded-sm bg-amazon-btnPrimary px-5 py-2 text-[11px] font-black uppercase tracking-widest text-amazon-text transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Apply Filters
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
              {totalCount} transaction{totalCount !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* ── Sort & Page Size Controls ─────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">Sort by:</label>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    queryParams.sortBy === opt.value
                      ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary"
                      : "text-amazon-textMuted bg-white border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
                  }`}
                >
                  {opt.label}
                  {queryParams.sortBy === opt.value && (
                    <span className="ml-1">
                      {queryParams.isAscending ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">Show:</label>
            <select
              id="page-size-select"
              value={queryParams.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-sm border border-amazon-border bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amazon-text outline-none focus:border-amazon-btnPrimary"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────── */}
        <div className="overflow-hidden rounded-sm border border-amazon-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-amazon-border bg-neutral-50 text-left text-[10px] font-black uppercase tracking-widest text-amazon-textMuted">
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5 text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-right">Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amazon-border">
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: queryParams.pageSize || 5 }).map(
                    (_, i) => (
                      <tr key={`skeleton-${i}`}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
                          </td>
                        ))}
                      </tr>
                    ),
                  )
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-sm font-bold uppercase tracking-widest text-amazon-textMuted"
                    >
                      No transactions found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-[11px] font-bold text-amazon-text">
                          <span>{getTypeIcon(tx.type)}</span>
                          <span className="capitalize">{tx.type}</span>
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-5 py-4 text-[11px] font-medium text-amazon-textMuted">
                        {tx.description || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-black text-amazon-price">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-[11px] font-black text-amazon-textMuted ">
                        {tx.feeAmount > 0
                          ? formatCurrency(tx.feeAmount, tx.currency)
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(tx.status)}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
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
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
              Page{" "}
              <span className="font-black text-amazon-text">{currentPage}</span>{" "}
              of{" "}
              <span className="font-black text-amazon-text">{totalPages}</span>
              {" · "}
              <span className="font-black text-amazon-text">
                {totalCount}
              </span>{" "}
              total
            </p>

            <div className="flex items-center gap-1">
              {/* First */}
              <button
                id="btn-page-first"
                disabled={!data.hasPreviousPage}
                onClick={() => handlePageChange(1)}
                className="rounded-sm px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-amazon-textMuted transition-colors bg-white border border-amazon-border hover:bg-neutral-50 hover:text-amazon-text disabled:cursor-not-allowed disabled:opacity-30"
              >
                ««
              </button>
              {/* Prev */}
              <button
                id="btn-page-prev"
                disabled={!data.hasPreviousPage}
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-sm px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-amazon-textMuted transition-colors bg-white border border-amazon-border hover:bg-neutral-50 hover:text-amazon-text disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹ Prev
              </button>

              {/* Page numbers (show max 5 centered around current) */}
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
                    className={`min-w-[32px] rounded-sm border px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                      page === currentPage
                        ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary shadow-sm"
                        : "text-amazon-textMuted bg-white border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}

              {/* Next */}
              <button
                id="btn-page-next"
                disabled={!data.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-sm px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-amazon-textMuted transition-colors bg-white border border-amazon-border hover:bg-neutral-50 hover:text-amazon-text disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next ›
              </button>
              {/* Last */}
              <button
                id="btn-page-last"
                disabled={!data.hasNextPage}
                onClick={() => handlePageChange(totalPages)}
                className="rounded-sm px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-amazon-textMuted transition-colors bg-white border border-amazon-border hover:bg-neutral-50 hover:text-amazon-text disabled:cursor-not-allowed disabled:opacity-30"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
