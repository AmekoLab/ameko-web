"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchPendingWithdrawals } from "@/src/store/slices/adminWalletSlice";
import {
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  Eye,
} from "lucide-react";
import ApproveWithdrawalModal from "@/src/components/Admin/ApproveWithdrawalModal";
import RejectWithdrawalModal from "@/src/components/Admin/RejectWithdrawalModal";
import { WithdrawalItem } from "@/src/services/wallet.service";
import Image from "next/image";

// ─── Status filter tabs ──────────────────────────────────
const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Paid" },
  { label: "Rejected", value: "Rejected" },
];

export default function AdminWalletPage() {
  const dispatch = useAppDispatch();
  const { withdrawals, loading, pagination } = useAppSelector(
    (state) => state.adminWallet,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const pageSize = 10;

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<WithdrawalItem | null>(
    null,
  );

  // Evidence preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Reject confirm
  const [rejectTarget, setRejectTarget] = useState<WithdrawalItem | null>(null);

  useEffect(() => {
    const params: { currentPage: number; pageSize: number; status?: string } = {
      currentPage,
      pageSize,
    };
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchPendingWithdrawals(params));
  }, [dispatch, currentPage, statusFilter]);

  const refetch = () => {
    const params: { currentPage: number; pageSize: number; status?: string } = {
      currentPage,
      pageSize,
    };
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchPendingWithdrawals(params));
  };

  // ─── Status badge ──────────────────────────────────────
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-bold uppercase">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold uppercase">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-bold uppercase">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase flex items-center gap-3">
              <Wallet className="w-8 h-8" />
              Withdrawal Management
            </h1>
            <p className="text-gray-500">
              Approve or reject withdrawal requests from Shops.
            </p>
          </div>
          <span className="text-sm text-gray-500">
            Total: <strong>{pagination?.totalCount || 0}</strong> requests
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                statusFilter === tab.value
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && withdrawals.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Loading data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                  <th className="p-4">Shop</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Bank</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested Date</th>
                  <th className="p-4">Evidence</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withdrawals.map((item) => (
                  <tr
                    key={item.paymentId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Shop */}
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{item.shopName}</p>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-[#ce2a32]" />
                        <span className="font-bold text-[#ce2a32] font-oswald text-base">
                          {item.amount.toLocaleString("en-US")}₫
                        </span>
                      </div>
                    </td>

                    {/* Bank */}
                    <td className="p-4 text-sm">
                      <p className="font-semibold text-gray-800">
                        {item.bankName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.bankAccountNumber} - {item.bankAccountName}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4">{renderStatusBadge(item.status)}</td>

                    {/* Date */}
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.requestedAt).toLocaleDateString(
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

                    {/* Evidence */}
                    <td className="p-4">
                      {item.evidenceImageUrl ? (
                        <button
                          onClick={() => setPreviewImage(item.evidenceImageUrl)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition"
                          title="View evidence"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      {item.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setApproveTarget(item)}
                            className="p-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-600 transition"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectTarget(item)}
                            className="p-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 hover:border-red-400 text-red-600 transition"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center">
                          {item.reason || "—"}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}

                {withdrawals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      No withdrawal requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Page{" "}
                <strong>
                  {pagination.currentPage} / {pagination.totalPages}
                </strong>{" "}
                — {pagination.totalCount} requests
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!pagination.hasPreviousPage}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages),
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Approve Modal ──────────────────────────────── */}
      {approveTarget && (
        <ApproveWithdrawalModal
          isOpen={!!approveTarget}
          paymentId={approveTarget.paymentId}
          amount={approveTarget.amount}
          onClose={() => setApproveTarget(null)}
          onSuccess={refetch}
        />
      )}

      {/* ─── Reject Modal ─────────────────────────────── */}
      {rejectTarget && (
        <RejectWithdrawalModal
          isOpen={!!rejectTarget}
          paymentId={rejectTarget.paymentId}
          amount={rejectTarget.amount}
          shopName={rejectTarget.shopName}
          onClose={() => setRejectTarget(null)}
          onSuccess={refetch}
        />
      )}

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
              <XCircle className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
