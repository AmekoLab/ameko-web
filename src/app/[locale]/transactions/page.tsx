"use client";

import { useEffect, useState, useCallback } from "react";
import { walletService } from "@/src/services/wallet.service";
import {
  Transaction,
  TransactionQueryParams,
  PaginatedTransactions,
} from "@/src/types/wallet.types";
import toast from "react-hot-toast";
import {
  Wallet,
  FilterX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";
import TransactionDetailModal from "./TransactionDetailModal";

// ─── Constants ────────────────────────────────────────────
const TRANSACTION_TYPES: { value: number }[] = [
  { value: -1 },
  { value: 0 },
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
];

const TRANSACTION_STATUSES: { value: number }[] = [
  { value: -1 },
  { value: 0 },
  { value: 1 },
  { value: 2 },
  { value: 3 },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const SORT_OPTIONS = [
  { value: "createdAt" },
  { value: "amount" },
  { value: "feeAmount" },
];

// ─── Helpers ──────────────────────────────────────────────
function getFlowConfig(flow: string) {
  switch (flow) {
    case "In":
      return {
        color: "text-green-600",
        bg: "bg-green-50/50",
        sign: "+",
        labelKey: "flowIn",
      };
    case "Out":
      return {
        color: "text-red-600",
        bg: "bg-red-50/50",
        sign: "-",
        labelKey: "flowOut",
      };
    case "Held":
      return {
        color: "text-amber-600",
        bg: "bg-amber-50/30",
        sign: "",
        labelKey: "flowHeld",
      };
    default:
      return {
        color: "text-neutral-500",
        bg: "bg-neutral-50/50",
        sign: "",
        labelKey: "flowNeutral",
      };
  }
}

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "manualadjustment":
      return "🛠️";
    case "withdrawal":
      return "🏦";
    case "salespending":
      return "🛒";
    case "orderrefund":
      return "🔄";
    case "orderpayment":
      return "💳";
    default:
      return "📄";
  }
}

function formatCurrency(amount: number, currency: string = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Component ────────────────────────────────────────────
export default function TransactionsPage() {
  const t = useTranslations("Wallet");
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
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Fetch ───────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await walletService.getTransactions(queryParams);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || t("loadFailed"));
      }
    } catch {
      toast.error(t("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [queryParams, t]);

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
            {t("pageTitle")}
          </h1>
          <p className="mt-2 text-sm text-neutral-500 font-medium">
            {t("pageDesc")}
          </p>
        </div>

        {/* ── Filters Card ──────────────────────────────── */}
        <div className="mb-8 rounded-2xl border border-neutral-100 bg-white shadow-sm p-6 overflow-hidden">
          <div className="mb-5 flex items-center justify-between border-b border-neutral-50 pb-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              {t("filterTitle")}
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" /> {t("clearFilters")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Type filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {t("typeLabel")}
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                {TRANSACTION_TYPES.map((typeObj) => (
                  <option key={typeObj.value} value={typeObj.value}>
                    {t(`types.${typeObj.value}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {t("statusLabel")}
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                {TRANSACTION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t(`statuses.${s.value}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* From date */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {t("fromDate")}
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
                {t("toDate")}
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
                {t("applyFilters")}
              </button>
            </div>
          </div>
        </div>

        {/* ── Sort & Page Size Controls ─────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500">
              {t("sortBy")}
            </span>
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
                  {t(`sortOptions.${opt.value}`)}
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
            <label className="text-xs font-semibold text-neutral-500">
              {t("show")}
            </label>
            <select
              id="page-size-select"
              value={queryParams.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-neutral-900 outline-none pr-1 focus:ring-0 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} {t("rows")}
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
                  <th className="px-6 py-4">{t("transactionDetails")}</th>
                  <th className="px-6 py-4 hidden md:table-cell">
                    {t("description")}
                  </th>
                  <th className="px-6 py-4 text-right">{t("amount")}</th>
                  <th className="px-6 py-4 text-center">{t("statusColumn")}</th>
                  <th className="px-6 py-4 text-right">{t("date")}</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 bg-white">
                {isLoading ? (
                  Array.from({ length: queryParams.pageSize || 10 }).map(
                    (_, i) => (
                      <tr key={`skeleton-${i}`}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td
                            key={j}
                            className={`px-6 py-5 ${j === 1 ? "hidden md:table-cell" : ""}`}
                          >
                            <div className="h-5 w-full max-w-[120px] animate-pulse rounded-md bg-neutral-100" />
                          </td>
                        ))}
                      </tr>
                    ),
                  )
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                          <Wallet className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="text-base font-semibold text-neutral-900 mb-1">
                          No transactions found
                        </p>
                        <p className="text-sm text-neutral-500">
                          Try adjusting your filters to find what you&apos;re
                          looking for.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => {
                        setSelectedTxnId(tx.id);
                        setIsModalOpen(true);
                      }}
                      className={`transition-colors border-b border-amazon-border last:border-0 hover:brightness-95 cursor-pointer ${getFlowConfig(tx.flowDirection).bg}`}
                    >
                      {/* 1. Type & Cash Flow Label */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center bg-white border shadow-sm text-lg shrink-0 ${getFlowConfig(tx.flowDirection).color}`}
                          >
                            {getTypeIcon(tx.type)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-900 capitalize text-sm">
                              {t(`types.${tx.type}`) || tx.type}
                            </span>
                            <span
                              className={`text-[10px]  tracking-wider uppercase mt-0.5 ${getFlowConfig(tx.flowDirection).color}`}
                            >
                              {t(getFlowConfig(tx.flowDirection).labelKey)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Description & Bank Details */}
                      <td className="px-6 py-4 hidden md:table-cell w-2/5">
                        <p
                          title={tx.description || ""}
                          className="text-xs font-medium text-neutral-600 line-clamp-2 leading-relaxed"
                        >
                          {tx.description || t("notAvailable")}
                        </p>
                        {tx.bankName && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 bg-white border border-neutral-200 inline-flex px-2 py-0.5 rounded-sm shadow-sm">
                            <span className="text-amazon-link">
                              {tx.bankName}
                            </span>
                            <span>• {tx.bankAccountNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Amount, Fee & Running Balance */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end justify-center">
                          <span
                            className={`text-base font-black whitespace-nowrap ${getFlowConfig(tx.flowDirection).color}`}
                          >
                            {getFlowConfig(tx.flowDirection).sign}{" "}
                            {formatCurrency(tx.amount, tx.currency)}
                          </span>
                          {tx.amount > 0 && (
                            <div className="mt-1 flex flex-col items-end gap-1">
                              <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">
                                {t("fee")} (
                                {((tx.feeAmount / tx.amount) * 100).toFixed(1)}
                                %): -{formatCurrency(tx.feeAmount, tx.currency)}
                              </span>
                              <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm">
                                {t("received")} (
                                {(
                                  100 -
                                  (tx.feeAmount / tx.amount) * 100
                                ).toFixed(1)}
                                %)
                              </span>
                            </div>
                          )}
                          {/* Running Balance */}
                          <div className="mt-1.5 pt-1.5 border-t border-neutral-200/60 w-full flex justify-end">
                            <span className="text-[11px] font-medium text-neutral-500">
                              {t("runningBalance")}:{" "}
                              <span className="font-bold text-neutral-700">
                                {formatCurrency(
                                  tx.balanceAfterTransaction,
                                  tx.currency,
                                )}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 box-border rounded-sm border shadow-sm whitespace-nowrap uppercase tracking-wide
                            ${
                              tx.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : tx.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                        >
                          {t(`status.${tx.status}`) || tx.status}
                        </span>
                      </td>

                      {/* 5. Date */}
                      <td className="px-6 py-4 text-right whitespace-nowrap text-xs font-medium text-neutral-500">
                        {new Date(tx.createdAt).toLocaleString(
                          t("localeCode").includes(".")
                            ? "vi-VN"
                            : t("localeCode"),
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>

                      {/* 6. Action Button */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent double-triggering the row click
                            setSelectedTxnId(tx.id);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center p-2 text-neutral-400 hover:text-amazon-link hover:bg-neutral-100 rounded-full transition-colors"
                          title={t("details.title") || "Xem chi tiết"}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
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
              {t("showing")}{" "}
              <span className="font-bold text-neutral-900">
                {transactions.length}
              </span>{" "}
              {t("of")}{" "}
              <span className="font-bold text-neutral-900">{totalCount}</span>{" "}
              {t("transactionsCount")}
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={!data.hasPreviousPage}
                onClick={() => handlePageChange(1)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">{t("first")}</span>
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                disabled={!data.hasPreviousPage}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">{t("previous")}</span>
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
                <span className="sr-only">{t("next")}</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                disabled={!data.hasNextPage}
                onClick={() => handlePageChange(totalPages)}
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-[0.98]"
              >
                <span className="sr-only">{t("last")}</span>
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <TransactionDetailModal
          transactionId={selectedTxnId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTxnId(null);
          }}
        />
      </div>
    </div>
  );
}
