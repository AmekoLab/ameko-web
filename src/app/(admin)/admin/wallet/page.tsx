"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchPendingWithdrawals } from "@/src/store/slices/adminWalletSlice";
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
    const baseClasses =
      "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
    switch (status) {
      case "Pending":
        return (
          <span
            className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}
          >
            Pending
          </span>
        );
      case "Paid":
        return (
          <span
            className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}
          >
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span
            className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}
          >
            Rejected
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text leading-tight">
              Withdrawal Management
            </h1>
            <p className="text-[11px] text-amazon-textMuted mt-0.5">
              Approve or reject withdrawal requests from Shops.
            </p>
          </div>
          <span className="text-[10px] text-amazon-textMuted">
            Total:{" "}
            <strong className="text-amazon-text mx-1">
              {pagination?.totalCount || 0}
            </strong>{" "}
            requests
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors ${
                statusFilter === tab.value
                  ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary shadow-sm"
                  : "bg-white text-amazon-textMuted border-amazon-border hover:bg-neutral-50 hover:text-amazon-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-md border border-amazon-border overflow-hidden shadow-sm flex flex-col">
          {loading && withdrawals.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-medium text-amazon-textMuted">
              Loading data...
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-neutral-50 border-b border-amazon-border">
                  <tr className="text-left text-[10px] text-amazon-textMuted">
                    <th className="px-4 py-2 font-medium">Shop</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Bank</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Requested Date</th>
                    <th className="px-4 py-2 font-medium">Evidence</th>
                    <th className="px-4 py-2 font-medium text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border">
                  {withdrawals.map((item) => (
                    <tr
                      key={item.paymentId}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      {/* Shop */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-[11px] text-amazon-text">
                          {item.shopName}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-amazon-text text-[11px]">
                          {item.amount.toLocaleString("en-US")}₫
                        </span>
                      </td>

                      {/* Bank */}
                      <td className="px-4 py-3 space-y-0.5">
                        <p className="font-medium text-[11px] text-amazon-text">
                          {item.bankName}
                        </p>
                        <p className="text-[10px] text-amazon-textMuted">
                          {item.bankAccountNumber} - {item.bankAccountName}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {renderStatusBadge(item.status)}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-amazon-textMuted">
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
                        </span>
                      </td>

                      {/* Evidence */}
                      <td className="px-4 py-3">
                        {item.evidenceImageUrl ? (
                          <button
                            onClick={() =>
                              setPreviewImage(item.evidenceImageUrl!)
                            }
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100"
                            title="View evidence"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-[10px] text-amazon-textMuted">
                            —
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {item.status === "Pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setApproveTarget(item)}
                              className="text-[10px] font-medium text-green-700 hover:text-green-800 transition-colors bg-green-50 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(item)}
                              className="text-[10px] font-medium text-red-600 hover:text-red-800 transition-colors bg-red-50 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-amazon-textMuted text-center truncate max-w-[120px]">
                            {item.reason || "—"}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}

                  {withdrawals.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-[10px] text-amazon-textMuted"
                      >
                        No withdrawal requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-amazon-border bg-neutral-50/50">
              <p className="text-[10px] text-amazon-textMuted">
                Page{" "}
                <strong className="text-amazon-text mx-0.5">
                  {pagination.currentPage} / {pagination.totalPages}
                </strong>{" "}
                — {pagination.totalCount} requests
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!pagination.hasPreviousPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages),
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="relative max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-200">
            <Image
              src={previewImage}
              alt="Evidence"
              width={800}
              height={600}
              className="w-full h-auto rounded-md shadow-xl object-contain border border-amazon-border bg-white"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-white border border-amazon-border rounded-full px-2 py-1 text-[11px] font-medium text-amazon-text hover:bg-neutral-50 transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
