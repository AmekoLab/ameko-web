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
    label: "Rút tiền",
    className: "bg-blue-100 text-blue-700",
  },
  OrderPayment: {
    label: "Thanh toán",
    className: "bg-green-100 text-green-700",
  },
  ManualAdjustment: {
    label: "Điều chỉnh",
    className: "bg-orange-100 text-orange-700",
  },
  RefundToWallet: {
    label: "Hoàn tiền",
    className: "bg-purple-100 text-purple-700",
  },
  SalesPending: {
    label: "Doanh thu chờ",
    className: "bg-yellow-100 text-yellow-700",
  },
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Paid: {
    label: "Thành công",
    className: "bg-green-100 text-green-700",
  },
  Failed: {
    label: "Thất bại",
    className: "bg-red-100 text-red-700",
  },
  Pending: {
    label: "Chờ xử lý",
    className: "bg-yellow-100 text-yellow-700",
  },
};

// ─── Description renderer ────────────────────────────────
function DescriptionCell({ parsed }: { parsed: ParsedTransactionInfo }) {
  if (!parsed.rawDescription) {
    return <span className="text-xs text-gray-400 italic">—</span>;
  }

  if (!parsed.isManualAction) {
    return (
      <p className="text-xs text-gray-600 leading-relaxed max-w-xs truncate">
        {parsed.rawDescription}
      </p>
    );
  }

  return (
    <div className="space-y-1 max-w-xs">
      {/* Action tag */}
      <span
        className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
          parsed.action === "APPROVED"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {parsed.action === "APPROVED" ? "Duyệt" : "Từ chối"}
      </span>

      {/* Note / Reason */}
      {parsed.note && (
        <p className="text-xs text-gray-600 truncate">{parsed.note}</p>
      )}

      {/* Proof thumbnail */}
      {parsed.proofUrl && (
        <a
          href={parsed.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          <Eye className="w-3 h-3" /> Xem minh chứng
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
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
          {type}
        </span>
      );
    }
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-bold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const config = STATUS_BADGE[status];
    if (!config) {
      return (
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">
          {status}
        </span>
      );
    }
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase flex items-center gap-3">
              <Receipt className="w-8 h-8" />
              Lịch sử giao dịch
            </h1>
            <p className="text-gray-500">
              Xem toàn bộ giao dịch ví trên hệ thống.
            </p>
          </div>
          <span className="text-sm text-gray-500">
            Tổng: <strong>{transactionsPagination?.totalCount || 0}</strong>{" "}
            giao dịch
          </span>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingTransactions && transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                    <th className="p-4">ID</th>
                    <th className="p-4">Ngày</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Số tiền</th>
                    <th className="p-4">Phí</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((item: TransactionItem) => {
                    const parsed = parseTransactionDescription(
                      item.description,
                    );
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* ID */}
                        <td className="p-4">
                          <span className="text-xs text-gray-500 font-mono">
                            {item.id.slice(0, 8)}…
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN",
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
                              <ArrowDownLeft className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-600" />
                            )}
                            <span
                              className={`font-bold font-oswald text-base ${
                                item.amount >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="p-4">
                          <span className="text-sm text-gray-500 font-oswald">
                            {item.feeAmount > 0
                              ? `${item.feeAmount.toLocaleString("vi-VN")}₫`
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
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition flex-shrink-0"
                                title="Xem ảnh"
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
                        className="p-12 text-center text-gray-400"
                      >
                        Không có giao dịch nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {transactionsPagination && transactionsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Trang{" "}
                <strong>
                  {transactionsPagination.currentPage} /{" "}
                  {transactionsPagination.totalPages}
                </strong>{" "}
                — {transactionsPagination.totalCount} giao dịch
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!transactionsPagination.hasPreviousPage}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative max-w-2xl w-full mx-4">
            <Image
              src={previewImage}
              alt="Evidence"
              width={800}
              height={600}
              className="w-full h-auto rounded-2xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white transition shadow"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
