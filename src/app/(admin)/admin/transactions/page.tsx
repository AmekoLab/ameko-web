"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAdminTransactions } from "@/src/store/slices/adminWalletSlice";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Receipt,
  Calendar,
  Eye,
  X,
  SlidersHorizontal,
  RotateCcw,
  Search,
} from "lucide-react";
import { TransactionItem } from "@/src/services/wallet.service";
import {
  parseTransactionDescription,
  ParsedTransactionInfo,
} from "@/src/utils/parseTransaction";
import Image from "next/image";

// ─── Filter constants ────────────────────────────────────
const TRANSACTION_TYPES: { label: string; value: string }[] = [
  { label: "All Types", value: "" },
  { label: "OrderPayment", value: "OrderPayment" },
  { label: "OrderRefund", value: "OrderRefund" },
  { label: "SalesRevenue", value: "SalesRevenue" },
  { label: "Deposit", value: "Deposit" },
  { label: "Withdrawal", value: "Withdrawal" },
  { label: "SalesPending", value: "SalesPending" },
  { label: "ManualAdjustment", value: "ManualAdjustment" },
];

const TRANSACTION_STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "" },
  { label: "Paid", value: "Paid" },
  { label: "Pending", value: "Pending" },
  { label: "Failed", value: "Failed" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Type badge config ───────────────────────────────────
const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  Withdrawal: {
    label: "Withdrawal",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  OrderPayment: {
    label: "Payment",
    className: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
  ManualAdjustment: {
    label: "Adjustment",
    className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  },
  RefundToWallet: {
    label: "Refund",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
  OrderRefund: {
    label: "Refund",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
  SalesPending: {
    label: "Pending Revenue",
    className: "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20",
  },
  SalesRevenue: {
    label: "Revenue",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  Deposit: {
    label: "Deposit",
    className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  },
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Paid: {
    label: "Success",
    className: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
  Failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-500 border border-red-500/20",
  },
  Pending: {
    label: "Pending",
    className: "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20",
  },
};

// ─── Description renderer ────────────────────────────────
function truncateText(text: string, max = 30) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}

function DescriptionCell({ parsed }: { parsed: ParsedTransactionInfo }) {
  if (!parsed.rawDescription) {
    return (
      <span className="text-[10px] font-bold text-gray-600 italic">—</span>
    );
  }

  if (!parsed.isManualAction) {
    return (
      <span
        className="text-[10px] font-bold text-gray-400"
        title={parsed.rawDescription}
      >
        {truncateText(parsed.rawDescription)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border whitespace-nowrap ${
          parsed.action === "APPROVED"
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}
      >
        {parsed.action === "APPROVED" ? "Approved" : "Rejected"}
      </span>
      {parsed.note && (
        <span
          className="text-[10px] font-bold text-gray-500"
          title={parsed.note}
        >
          {truncateText(parsed.note, 20)}
        </span>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function AdminTransactionsPage() {
  const dispatch = useAppDispatch();
  const { transactions, loadingTransactions, transactionsPagination } =
    useAppSelector((state) => state.adminWallet);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filter state ────────────────────────────────────────
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // ── Active filters (applied on submit) ──────────────────
  const [activeFilters, setActiveFilters] = useState({
    type: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  // Image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────
  const fetchData = useCallback(() => {
    dispatch(fetchAdminTransactions({ currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Client-side filtering (since the admin API only supports pagination) ──
  const filteredTransactions = transactions.filter((item: TransactionItem) => {
    if (activeFilters.type && item.type !== activeFilters.type) return false;
    if (activeFilters.status && item.status !== activeFilters.status)
      return false;
    if (activeFilters.fromDate) {
      const from = new Date(activeFilters.fromDate);
      const created = new Date(item.createdAt);
      if (created < from) return false;
    }
    if (activeFilters.toDate) {
      const to = new Date(activeFilters.toDate);
      to.setHours(23, 59, 59, 999);
      const created = new Date(item.createdAt);
      if (created > to) return false;
    }
    return true;
  });

  // ── Handlers ────────────────────────────────────────────
  const handleApplyFilters = () => {
    setActiveFilters({
      type: filterType,
      status: filterStatus,
      fromDate: filterFromDate,
      toDate: filterToDate,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterType("");
    setFilterStatus("");
    setFilterFromDate("");
    setFilterToDate("");
    setActiveFilters({ type: "", status: "", fromDate: "", toDate: "" });
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeFilters.type ||
    activeFilters.status ||
    activeFilters.fromDate ||
    activeFilters.toDate;

  // ── Rendering helpers ───────────────────────────────────
  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString("vi-VN");
    return `${amount < 0 ? "-" : ""}${formatted}₫`;
  };

  const renderTypeBadge = (type: string) => {
    const config = TYPE_BADGE[type];
    if (!config) {
      return (
        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2.5 py-1 rounded-sm">
          {type}
        </span>
      );
    }
    return (
      <span
        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm whitespace-nowrap ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const config = STATUS_BADGE[status];
    if (!config) {
      return (
        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2.5 py-1 rounded-sm">
          {status}
        </span>
      );
    }
    return (
      <span
        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm whitespace-nowrap ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const totalPages = transactionsPagination?.totalPages ?? 1;
  const totalCount = transactionsPagination?.totalCount ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-[#1e2126] pb-4 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-[#f5d800]" />
              Transaction History
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              View all wallet transactions in the system.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Total:{" "}
              <strong className="text-white">{totalCount}</strong>{" "}
              transactions
            </span>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2 rounded-sm border transition ${
                showFilters
                  ? "border-[#f5d800]/50 bg-[#f5d800]/10 text-[#f5d800]"
                  : "border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030]"
              }`}
              title="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Filters Card ──────────────────────────────── */}
        {showFilters && (
          <div className="mb-6 rounded-sm border border-[#1e2126] bg-[#151515] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Filter Transactions
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#f5d800] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  Type
                </label>
                <select
                  id="admin-filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-sm border border-[#1e2126] bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white outline-none transition-colors focus:border-[#f5d800]/50"
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  Status
                </label>
                <select
                  id="admin-filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-sm border border-[#1e2126] bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white outline-none transition-colors focus:border-[#f5d800]/50"
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  From Date
                </label>
                <input
                  id="admin-filter-from-date"
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full rounded-sm border border-[#1e2126] bg-black px-3 py-2 text-[11px] font-bold text-white outline-none transition-colors focus:border-[#f5d800]/50"
                />
              </div>

              {/* To date */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  To Date
                </label>
                <input
                  id="admin-filter-to-date"
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full rounded-sm border border-[#1e2126] bg-black px-3 py-2 text-[11px] font-bold text-white outline-none transition-colors focus:border-[#f5d800]/50"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                id="btn-admin-apply-filters"
                onClick={handleApplyFilters}
                className="rounded-sm bg-[#f5d800] px-5 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-[#f5d800]/90 active:scale-[0.97]"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Showing {filteredTransactions.length} of {transactions.length}{" "}
                  on this page
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Page Size Control ─────────────────────────── */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Per page:
          </label>
          <select
            id="admin-page-size"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="rounded-sm border border-[#1e2126] bg-[#151515] px-2 py-1 text-[11px] font-bold text-white outline-none focus:border-[#f5d800]/50"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* ── TABLE ─────────────────────────────────────── */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loadingTransactions && transactions.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading data...
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#1e2126]">
                    <th className="px-4 py-3 whitespace-nowrap">ID</th>
                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Type</th>
                    <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 whitespace-nowrap">Fee</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {filteredTransactions.map((item: TransactionItem) => {
                    const parsed = parseTransactionDescription(
                      item.description,
                    );
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#202030] transition-colors"
                      >
                        {/* ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="text-[11px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                            title={item.id}
                          >
                            {item.id.slice(0, 8)}…
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-600" />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                              <span className="ml-1.5 text-gray-600">
                                {new Date(item.createdAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 whitespace-nowrap">{renderTypeBadge(item.type)}</td>

                        {/* Amount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {item.amount >= 0 ? (
                              <ArrowDownLeft className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <span
                              className={`font-black text-[13px] tracking-wider ${
                                item.amount >= 0
                                  ? "text-green-400"
                                  : "text-red-500"
                              }`}
                            >
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-gray-500">
                            {item.feeAmount > 0
                              ? `${item.feeAmount.toLocaleString("vi-VN")}₫`
                              : "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <DescriptionCell parsed={parsed} />
                            {parsed.proofUrl && (
                              <button
                                onClick={() =>
                                  setPreviewImage(parsed.proofUrl)
                                }
                                className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] text-gray-500 hover:text-[#f5d800] hover:border-[#f5d800]/50 transition flex-shrink-0"
                                title="View evidence"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTransactions.length === 0 && !loadingTransactions && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600 italic"
                      >
                        {hasActiveFilters
                          ? "No transactions match your filters."
                          : "No transactions found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────── */}
          {transactionsPagination && transactionsPagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#1e2126] bg-black gap-3">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                Page{" "}
                <strong className="text-white">
                  {transactionsPagination.currentPage} /{" "}
                  {transactionsPagination.totalPages}
                </strong>{" "}
                — {transactionsPagination.totalCount} transactions
              </p>

              <div className="flex items-center gap-1">
                {/* First */}
                <button
                  id="btn-admin-page-first"
                  onClick={() => setCurrentPage(1)}
                  disabled={!transactionsPagination.hasPreviousPage}
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* Prev */}
                <button
                  id="btn-admin-page-prev"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!transactionsPagination.hasPreviousPage}
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {(() => {
                  const maxVisible = 5;
                  const current = transactionsPagination.currentPage;
                  const total = transactionsPagination.totalPages;
                  let start = Math.max(
                    1,
                    current - Math.floor(maxVisible / 2),
                  );
                  const end = Math.min(total, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  return Array.from(
                    { length: end - start + 1 },
                    (_, i) => start + i,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] p-2 rounded-sm border transition text-[11px] font-black uppercase tracking-widest ${
                        page === current
                          ? "border-[#f5d800]/50 bg-[#f5d800]/10 text-[#f5d800]"
                          : "border-[#1e2126] bg-[#151515] text-gray-400 hover:bg-[#202030] hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                {/* Next */}
                <button
                  id="btn-admin-page-next"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, transactionsPagination.totalPages),
                    )
                  }
                  disabled={!transactionsPagination.hasNextPage}
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Last */}
                <button
                  id="btn-admin-page-last"
                  onClick={() =>
                    setCurrentPage(transactionsPagination.totalPages)
                  }
                  disabled={!transactionsPagination.hasNextPage}
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Image Preview Modal ────────────────────────── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative max-w-2xl w-full mx-4">
            <Image
              src={previewImage}
              alt="Evidence"
              width={800}
              height={600}
              className="w-full h-auto rounded-sm shadow-2xl object-contain border border-[#1e2126]"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/80 border border-[#1e2126] hover:border-[#f5d800]/50 rounded-sm p-2 hover:bg-[#202030] transition shadow"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-[#f5d800]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
