"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAdminTransactions } from "@/src/store/slices/adminWalletSlice";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import { TransactionItem } from "@/src/services/wallet.service";
import {
  parseTransactionDescription,
  ParsedTransactionInfo,
} from "@/src/utils/parseTransaction";
import Image from "next/image";

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
  SalesPending: {
    label: "Pending Revenue",
    className: "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20",
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
function DescriptionCell({ parsed }: { parsed: ParsedTransactionInfo }) {
  if (!parsed.rawDescription) {
    return <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 italic">—</span>;
  }

  if (!parsed.isManualAction) {
    return (
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed max-w-xs truncate">
        {parsed.rawDescription}
      </p>
    );
  }

  return (
    <div className="space-y-1.5 max-w-xs">
      {/* Action tag */}
      <span
        className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
          parsed.action === "APPROVED"
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}
      >
        {parsed.action === "APPROVED" ? "Approved" : "Rejected"}
      </span>

      {/* Note / Reason */}
      {parsed.note && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{parsed.note}</p>
      )}

      {/* Proof thumbnail */}
      {parsed.proofUrl && (
        <a
          href={parsed.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View evidence
        </a>
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
  const pageSize = 10;

  // Image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminTransactions({ currentPage, pageSize }));
  }, [dispatch, currentPage]);

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
        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${config.className}`}
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
        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Receipt className="w-8 h-8 text-[#f5d800]" />
              Transaction History
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              View all wallet transactions in the system.
            </p>
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Total: <strong className="text-white">{transactionsPagination?.totalCount || 0}</strong>{" "}
            transactions
          </span>
        </div>

        {/* TABLE */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loadingTransactions && transactions.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#1e2126]">
                    <th className="p-4">ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {transactions.map((item: TransactionItem) => {
                    const parsed = parseTransactionDescription(
                      item.description,
                    );
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#202030] transition-colors"
                      >
                        {/* ID */}
                        <td className="p-4">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            {item.id.slice(0, 8)}…
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="p-4">{renderTypeBadge(item.type)}</td>

                        {/* Amount */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {item.amount >= 0 ? (
                              <ArrowDownLeft className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
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
                        <td className="p-4">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            {item.feeAmount > 0
                              ? `${item.feeAmount.toLocaleString("en-US")}₫`
                              : "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Description */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <DescriptionCell parsed={parsed} />
                            {parsed.proofUrl && (
                              <button
                                onClick={() => setPreviewImage(parsed.proofUrl)}
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

                  {transactions.length === 0 && !loadingTransactions && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600 italic"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {transactionsPagination && transactionsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#1e2126] bg-black">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                Page{" "}
                <strong className="text-white">
                  {transactionsPagination.currentPage} /{" "}
                  {transactionsPagination.totalPages}
                </strong>{" "}
                — {transactionsPagination.totalCount} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!transactionsPagination.hasPreviousPage}
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
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
