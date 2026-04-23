"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchProcessedWithdrawals } from "@/src/store/slices/adminWalletSlice";
import { TransactionItem } from "@/src/services/wallet.service";
import { toast } from "react-toastify";
import Image from "next/image";
import { ExternalLink, CheckCircle } from "lucide-react";

export default function ProcessedWithdrawalsPage() {
  // You can create a new JSON namespace or fallback to the pending one
  const t = useTranslations("AdminPendingWithdrawalsPage");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";

  const formatCurrency = (amount: number, currency?: string) => {
    const safeCurrency =
      currency && /^[A-Z]{3}$/.test(currency) ? currency : "VND";
    return new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dispatch = useAppDispatch();
  const { processedWithdrawals, loadingProcessed, processedPagination } =
    useAppSelector((state) => state.adminWallet);

  const [page, setPage] = useState(1);
  const size = 10; // Following the API requirement

  useEffect(() => {
    dispatch(fetchProcessedWithdrawals({ pageIndex: page, pageSize: size }));
  }, [dispatch, page]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("copySuccess") || "Copied to clipboard!");
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text leading-tight flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
            {t("titleProcessed")}
            </h1>
            <p className="text-[11px] text-amazon-textMuted mt-0.5">
              {t("descriptionProcessed")}
            </p>
          </div>
          <span className="text-[10px] text-amazon-textMuted">
            {t("totalLabel")}
            <strong className="text-amazon-text mx-1">
              {processedPagination?.totalCount || 0}
            </strong>{" "}
            {t("transactionsLabel")}
          </span>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-md border border-amazon-border overflow-hidden flex flex-col shadow-sm">
          {loadingProcessed && processedWithdrawals.length === 0 ? (
            <div className="p-12 text-center text-[11px] text-amazon-textMuted">
              {t("loading") || "Đang tải dữ liệu..."}
            </div>
          ) : processedWithdrawals.length === 0 && !loadingProcessed ? (
            /* ─── Empty State ─────────────────────────── */
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <h3 className="text-[13px] font-bold text-amazon-text mb-1">
                Không có dữ liệu
              </h3>
              <p className="text-[11px] text-amazon-textMuted max-w-xs">
                Chưa có yêu cầu rút tiền nào được xử lý.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-neutral-50 border-b border-amazon-border">
                  <tr className="text-left text-[10px] font-medium text-amazon-textMuted">
                    <th className="px-4 py-2">{t("requestedAt")}</th>
                    <th className="px-4 py-2">{t("shopName")}</th>
                    <th className="px-4 py-2">{t("amount")}</th>
                    <th className="px-4 py-2">{t("bankInfo")}</th>
                    <th className="px-4 py-2">{t("statusAndNote")}</th>
                    <th className="px-4 py-2 text-center">{t("proof")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border">
                  {processedWithdrawals.map((tx: TransactionItem) => {
                    const totalDeducted =
                      tx.totalDeducted ?? tx.amount + tx.feeAmount;
                    const hasBankDetails = !!(
                      tx.bankName ||
                      tx.bankAccountNumber ||
                      tx.bankAccountName
                    );

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        {/* Timestamps */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 text-[10px]">
                            <span className="text-amazon-textMuted">
                              {t("requestedAt")}: {formatDateTime(tx.requestedAt)}
                            </span>
                            <span className="text-amazon-text font-medium">
                              {t("processedAt")}: {formatDateTime(tx.processedAt)}
                            </span>
                          </div>
                        </td>

                        {/* Shop */}
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-medium text-amazon-text">
                            {tx.shopName || t("noInformation")}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-[11px] text-amazon-text">
                              {t("received")}: {formatCurrency(tx.amount, tx.currency)}
                            </span>
                            <span className="text-[10px] text-red-500">
                              {t("totalDeducted")}: {formatCurrency(totalDeducted, tx.currency)}
                            </span>
                          </div>
                        </td>

                        {/* Bank Details */}
                        <td className="px-4 py-3">
                          {hasBankDetails ? (
                            <div className="space-y-0.5 max-w-[200px] truncate">
                              <p className="text-[11px] font-medium text-amazon-text truncate">
                                {tx.bankName ?? "—"}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-amazon-textMuted">
                                <span>{tx.bankAccountNumber ?? "—"}</span>
                                <button
                                  onClick={() =>
                                    handleCopy(tx.bankAccountNumber ?? "")
                                  }
                                  className="text-blue-600 hover:underline transition-colors"
                                  title="Copy tài khoản"
                                >
                                  {t("copy")}
                                </button>
                              </div>
                              <p className="text-[10px] text-amazon-textMuted truncate">
                                {tx.bankAccountName ?? "—"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amazon-textMuted">
                              {t("noInformation")}
                            </span>
                          )}
                        </td>

                        {/* Status & Message */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            <span className="inline-flex w-fit px-2 py-0.5 rounded-sm text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                              {tx.status}
                            </span>
                            <span className="text-[10px] text-amazon-textMuted whitespace-normal line-clamp-2">
                              {tx.adminMessage || "Không có lời nhắn"}
                            </span>
                          </div>
                        </td>

                        {/* Evidence */}
                        <td className="px-4 py-3 text-center">
                          {tx.evidenceUrl ? (
                            <a
                              href={tx.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-1 rounded-sm border border-amazon-border hover:border-amazon-link hover:text-amazon-link transition-colors group"
                              title="Xem bill chuyển khoản"
                            >
                              <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-neutral-100">
                                <Image
                                  src={tx.evidenceUrl}
                                  alt="Evidence"
                                  fill
                                  className="object-cover group-hover:opacity-80 transition-opacity"
                                />
                              </div>
                              <ExternalLink className="w-3 h-3 ml-1 text-neutral-400 group-hover:text-amazon-link" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Không có</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {processedPagination && processedPagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-amazon-border bg-neutral-50/50">
              <p className="text-[10px] text-amazon-textMuted">
                {t("pageLabel") || "Trang"}
                <strong className="text-amazon-text mx-0.5">
                  {processedPagination.currentPage} /{" "}
                  {processedPagination.totalPages}
                </strong>{" "}
                — {processedPagination.totalCount} {t("transactionsLabel")}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!processedPagination.hasPreviousPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("prev") || "Trước"}
                </button>
                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, processedPagination.totalPages),
                    )
                  }
                  disabled={!processedPagination.hasNextPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("next") || "Sau"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
