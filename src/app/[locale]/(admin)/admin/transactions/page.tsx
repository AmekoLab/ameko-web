"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAdminTransactions } from "@/src/store/slices/adminWalletSlice";
import { TransactionItem } from "@/src/services/wallet.service";
import {
  parseTransactionDescription,
  ParsedTransactionInfo,
} from "@/src/utils/parseTransaction";
import Image from "next/image";
import { Store, User } from "lucide-react";
import AdminTransactionDetailModal from "@/src/components/Admin/modals/AdminTransactionDetailModal";

// ─── Filter constants ────────────────────────────────────
const TRANSACTION_TYPES: { labelKey: string; value: string }[] = [
  { labelKey: "filterTypeAll", value: "" },
  { labelKey: "filterTypeOrderPayment", value: "OrderPayment" },
  { labelKey: "filterTypeOrderRefund", value: "OrderRefund" },
  { labelKey: "filterTypeSalesRevenue", value: "SalesRevenue" },
  { labelKey: "filterTypeDeposit", value: "Deposit" },
  { labelKey: "filterTypeWithdrawal", value: "Withdrawal" },
  { labelKey: "filterTypeSalesPending", value: "SalesPending" },
  { labelKey: "filterTypeManualAdjustment", value: "ManualAdjustment" },
];

const TRANSACTION_STATUSES: { labelKey: string; value: string }[] = [
  { labelKey: "filterStatusAll", value: "" },
  { labelKey: "filterStatusPaid", value: "Paid" },
  { labelKey: "filterStatusPending", value: "Pending" },
  { labelKey: "filterStatusFailed", value: "Failed" },
  { labelKey: "filterStatusCompleted", value: "Completed" },
  { labelKey: "filterStatusCancelled", value: "Cancelled" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Type badge config ───────────────────────────────────
const TYPE_BADGE: Record<string, { labelKey: string; className: string }> = {
  Withdrawal: {
    labelKey: "badgeTypeWithdrawal",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  OrderPayment: {
    labelKey: "badgeTypePayment",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  ManualAdjustment: {
    labelKey: "badgeTypeAdjustment",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  RefundToWallet: {
    labelKey: "badgeTypeRefund",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  OrderRefund: {
    labelKey: "badgeTypeRefund",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  SalesPending: {
    labelKey: "badgeTypePendingRevenue",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  SalesRevenue: {
    labelKey: "badgeTypeRevenue",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Deposit: {
    labelKey: "badgeTypeDeposit",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  PlatformFee: {
    labelKey: "badgeTypePlatformFee",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  }
};

const STATUS_BADGE: Record<string, { labelKey: string; className: string }> = {
  Paid: {
    labelKey: "badgeStatusSuccess",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  Failed: {
    labelKey: "badgeStatusFailed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  Pending: {
    labelKey: "badgeStatusPending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  Completed: {
    labelKey: "badgeStatusCompleted",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  Cancelled: {
    labelKey: "badgeStatusCancelled",
    className: "bg-neutral-100 text-neutral-600 border-neutral-300",
  },
};

// ─── Description renderer ────────────────────────────────
function truncateText(text: string, max = 30) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}

function DescriptionCell({
  parsed,
  approvedLabel,
  rejectedLabel,
}: {
  parsed: ParsedTransactionInfo;
  approvedLabel: string;
  rejectedLabel: string;
}) {
  if (!parsed.rawDescription) {
    return <span className="text-[10px] text-amazon-textMuted">—</span>;
  }

  if (!parsed.isManualAction) {
    return (
      <span
        className="text-[10px] font-medium text-amazon-text"
        title={parsed.rawDescription}
      >
        {truncateText(parsed.rawDescription)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border whitespace-nowrap ${
          parsed.action === "APPROVED"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}
      >
        {parsed.action === "APPROVED" ? approvedLabel : rejectedLabel}
      </span>
      {parsed.note && (
        <span
          className="text-[10px] font-medium text-amazon-textMuted"
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
  const t = useTranslations("AdminTransactionsPage");
  const locale = useLocale();
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

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

  // Detail modal
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    const formatted = Math.abs(amount).toLocaleString(numberLocale);
    return `${formatted}₫`;
  };

  const getFlowUI = (item: TransactionItem) => {
    const flow = item.flowDirection;
    if (flow === "In") return { color: "text-green-600", sign: "+" };
    if (flow === "Out") return { color: "text-red-600", sign: "-" };
    if (flow === "Held") return { color: "text-amber-600", sign: "+" };
    // Fallback: infer from amount sign
    return item.amount >= 0
      ? { color: "text-green-600", sign: "+" }
      : { color: "text-red-600", sign: "-" };
  };

  const renderTypeBadge = (type: string) => {
    const config = TYPE_BADGE[type];
    if (!config) {
      return (
        <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200 px-1.5 py-0.5 rounded-sm">
          {type || t("unknown")}
        </span>
      );
    }
    return (
      <span
        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap border ${config.className}`}
      >
        {t(config.labelKey)}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const config = STATUS_BADGE[status];
    if (!config) {
      return (
        <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200 px-1.5 py-0.5 rounded-sm">
          {status || t("unknown")}
        </span>
      );
    }
    return (
      <span
        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap border ${config.className}`}
      >
        {t(config.labelKey)}
      </span>
    );
  };

  const totalCount = transactionsPagination?.totalCount ?? 0;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text leading-tight">
              {t("title")}
            </h1>
            <p className="text-[11px] text-amazon-textMuted mt-0.5">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-amazon-textMuted">
              {t("totalLabel")}
              <strong className="text-amazon-text mx-1">
                {totalCount}
              </strong>{" "}
              {t("transactionsLabel")}
            </span>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-sm border transition-colors ${
                showFilters
                  ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary shadow-sm"
                  : "bg-white text-amazon-textMuted border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
              }`}
              title={t("toggleFiltersTitle")}
            >
              {t("filters")}
            </button>
          </div>
        </div>

        {/* ── Filters Card ──────────────────────────────── */}
        {showFilters && (
          <div className="mb-4 rounded-md border border-amazon-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-amazon-text">
                {t("filterTransactions")}
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {t("clearAll")}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Type filter */}
              <div>
                <label className="block text-[10px] font-medium text-amazon-textMuted mb-1">
                  {t("filterTypeLabel")}
                </label>
                <select
                  id="admin-filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-sm border border-amazon-border bg-white px-2 py-1.5 text-[11px] font-medium text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary"
                >
                  {TRANSACTION_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-[10px] font-medium text-amazon-textMuted mb-1">
                  {t("filterStatusLabel")}
                </label>
                <select
                  id="admin-filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-sm border border-amazon-border bg-white px-2 py-1.5 text-[11px] font-medium text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary"
                >
                  {TRANSACTION_STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              {/* From date */}
              <div>
                <label className="block text-[10px] font-medium text-amazon-textMuted mb-1">
                  {t("filterFromDate")}
                </label>
                <input
                  id="admin-filter-from-date"
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full rounded-sm border border-amazon-border bg-white px-2 py-1.5 text-[11px] font-medium text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary"
                />
              </div>

              {/* To date */}
              <div>
                <label className="block text-[10px] font-medium text-amazon-textMuted mb-1">
                  {t("filterToDate")}
                </label>
                <input
                  id="admin-filter-to-date"
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full rounded-sm border border-amazon-border bg-white px-2 py-1.5 text-[11px] font-medium text-amazon-text outline-none transition-colors focus:border-amazon-btnPrimary"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                id="btn-admin-apply-filters"
                onClick={handleApplyFilters}
                className="rounded-sm bg-amazon-btnPrimary border border-amazon-btnPrimary px-4 py-1.5 text-[11px] font-medium text-amazon-text transition-colors hover:brightness-95 shadow-sm"
              >
                {t("applyFilters")}
              </button>
              {hasActiveFilters && (
                <span className="text-[10px] text-amazon-textMuted">
                  {t("showingOnPage", {
                    filtered: filteredTransactions.length,
                    total: transactions.length,
                  })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Page Size Control ─────────────────────────── */}
        <div className="mb-3 flex items-center justify-end gap-2">
          <label className="text-[10px] font-medium text-amazon-textMuted">
            {t("perPage")}
          </label>
          <select
            id="admin-page-size"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="rounded-sm border border-amazon-border bg-white px-2 py-1 text-[10px] font-medium text-amazon-text outline-none focus:border-amazon-btnPrimary"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* ── TABLE ─────────────────────────────────────── */}
        <div className="bg-white rounded-md border border-amazon-border flex flex-col shadow-sm">
          {loadingTransactions && transactions.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-medium text-amazon-textMuted">
              {t("loading")}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-neutral-50 border-b border-amazon-border">
                  <tr className="text-left text-[10px] text-amazon-textMuted">
                    <th className="px-4 py-2 font-medium">{t("tableId")}</th>
                    <th className="px-4 py-2 font-medium">Đối tượng</th>
                    <th className="px-4 py-2 font-medium">{t("tableDate")}</th>
                    <th className="px-4 py-2 font-medium">{t("tableType")}</th>
                    <th className="px-4 py-2 font-medium">
                      {t("tableAmount")}
                    </th>
                    <th className="px-4 py-2 font-medium">
                      {t("tableStatus")}
                    </th>
                    <th className="px-4 py-2 font-medium">
                      {t("tableDetails")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border">
                  {filteredTransactions.map((item: TransactionItem) => {
                    const parsed = parseTransactionDescription(
                      item.description,
                    );
                    const ui = getFlowUI(item);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        {/* ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="text-[11px] font-mono text-amazon-textMuted cursor-pointer hover:text-amazon-text transition-colors"
                            title={item.id}
                          >
                            {item.id.slice(0, 8)}…
                          </span>
                        </td>

                        {/* Target (Đối tượng) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {item.shopName ? (
                              <>
                                <Store className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                <span className="text-[11px] font-medium text-amazon-text">
                                  {item.shopName}
                                </span>
                              </>
                            ) : (
                              <>
                                <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                                <span className="text-[11px] text-amazon-textMuted">
                                  Hệ thống/User
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-[11px] text-amazon-text">
                            {new Date(item.createdAt).toLocaleDateString(
                              dateLocale,
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            <span className="ml-1.5 text-amazon-textMuted text-[10px]">
                              {new Date(item.createdAt).toLocaleTimeString(
                                dateLocale,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderTypeBadge(item.type)}
                        </td>

                        {/* Financials (Amount + Fee merged) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col items-start">
                            <span className={`font-bold text-sm ${ui.color}`}>
                              {ui.sign} {formatCurrency(item.netAmount ?? item.amount)}
                            </span>
                            {item.feeAmount > 0 && (
                              <div className="mt-1 flex flex-col gap-0.5 opacity-80">
                                <span className="text-[10px] text-neutral-400 line-through">
                                  Gốc: {formatCurrency(item.grossAmount ?? item.amount)}
                                </span>
                                <span className="text-[10px] text-red-500 font-medium">
                                  Phí: -{formatCurrency(item.feeAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <DescriptionCell
                              parsed={parsed}
                              approvedLabel={t("manualApproved")}
                              rejectedLabel={t("manualRejected")}
                            />
                            {parsed.proofUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(parsed.proofUrl!);
                                }}
                                className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 text-[10px] font-medium flex-shrink-0 transition-colors"
                                title={t("viewEvidenceTitle")}
                              >
                                {t("view")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTransactions.length === 0 &&
                    !loadingTransactions && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-12 text-center text-[10px] text-amazon-textMuted"
                        >
                          {hasActiveFilters ? t("emptyFiltered") : t("empty")}
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────── */}
          {transactionsPagination && transactionsPagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-amazon-border bg-neutral-50/50 gap-3">
              <p className="text-[10px] text-amazon-textMuted">
                {t("pageLabel")}
                <strong className="text-amazon-text mx-0.5">
                  {transactionsPagination.currentPage} /{" "}
                  {transactionsPagination.totalPages}
                </strong>{" "}
                — {transactionsPagination.totalCount} {t("transactionsLabel")}
              </p>

              <div className="flex items-center gap-1">
                {/* First */}
                <button
                  id="btn-admin-page-first"
                  onClick={() => setCurrentPage(1)}
                  disabled={!transactionsPagination.hasPreviousPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 text-amazon-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("first")}
                </button>
                {/* Prev */}
                <button
                  id="btn-admin-page-prev"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!transactionsPagination.hasPreviousPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 text-amazon-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("prev")}
                </button>

                {/* Page numbers */}
                {(() => {
                  const maxVisible = 5;
                  const current = transactionsPagination.currentPage;
                  const total = transactionsPagination.totalPages;
                  let start = Math.max(1, current - Math.floor(maxVisible / 2));
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
                      className={`min-w-[28px] px-2 py-1 rounded-sm border transition-colors text-[10px] font-bold ${
                        page === current
                          ? "border-amazon-btnPrimary bg-amazon-btnPrimary text-amazon-text"
                          : "border-amazon-border bg-white text-amazon-text hover:bg-neutral-50"
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
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 text-amazon-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("next")}
                </button>
                {/* Last */}
                <button
                  id="btn-admin-page-last"
                  onClick={() =>
                    setCurrentPage(transactionsPagination.totalPages)
                  }
                  disabled={!transactionsPagination.hasNextPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 text-amazon-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("last")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Image Preview Modal ────────────────────────── */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-200">
            <Image
              src={previewImage}
              alt={t("evidenceAlt")}
              width={800}
              height={600}
              className="w-full h-auto rounded-md shadow-xl object-contain border border-amazon-border bg-white"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-white border border-amazon-border rounded-full px-2 py-1 text-[11px] font-medium text-amazon-text hover:bg-neutral-50 transition shadow-sm"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {/* ─── Admin Transaction Detail Modal ──────────────── */}
      <AdminTransactionDetailModal
        transactionId={selectedTransactionId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransactionId(null);
        }}
      />
    </div>
  );
}
