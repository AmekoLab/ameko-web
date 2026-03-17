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
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20 px-2.5 py-1 rounded-sm font-black uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-sm font-black uppercase tracking-widest">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-sm font-black uppercase tracking-widest">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2.5 py-1 rounded-sm font-black uppercase tracking-widest">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <Wallet className="w-8 h-8 text-[#f5d800]" />
              Withdrawal Management
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Approve or reject withdrawal requests from Shops.
            </p>
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Total: <strong className="text-white">{pagination?.totalCount || 0}</strong> requests
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
              className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-sm border transition-colors ${
                statusFilter === tab.value
                  ? "bg-[#f5d800] text-black border-[#f5d800] shadow-[0_0_10px_rgba(245,216,0,0.2)]"
                  : "bg-[#151515] text-gray-400 border-[#1e2126] hover:bg-[#202030] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
          {loading && withdrawals.length === 0 ? (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Loading data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-[#1e2126]">
                  <th className="p-4">Shop</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Bank</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested Date</th>
                  <th className="p-4">Evidence</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2126]">
                {withdrawals.map((item) => (
                  <tr
                    key={item.paymentId}
                    className="hover:bg-[#202030] transition-colors"
                  >
                    {/* Shop */}
                    <td className="p-4">
                      <p className="font-black text-[13px] text-white uppercase tracking-wider">{item.shopName}</p>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-[#f5d800]" />
                        <span className="font-black text-[#f5d800] tracking-wider text-[13px]">
                          {item.amount.toLocaleString("en-US")}₫
                        </span>
                      </div>
                    </td>

                    {/* Bank */}
                    <td className="p-4 space-y-1">
                      <p className="font-black text-[11px] text-gray-300 uppercase tracking-widest">
                        {item.bankName}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {item.bankAccountNumber} - {item.bankAccountName}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4">{renderStatusBadge(item.status)}</td>

                    {/* Date */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
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
                          className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] hover:border-[#f5d800] text-gray-500 hover:text-[#f5d800] transition"
                          title="View evidence"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 italic">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      {item.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setApproveTarget(item)}
                            className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-green-500/10 text-gray-500 hover:text-green-500 hover:border-green-500/50 rounded-sm transition shadow-sm"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectTarget(item)}
                            className="p-1.5 border border-[#1e2126] bg-[#151515] hover:bg-red-500/10 text-gray-500 hover:text-red-500 hover:border-red-500/50 rounded-sm transition shadow-sm"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 text-center">
                          {item.reason || "—"}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}

                {withdrawals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600 italic">
                      No withdrawal requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#1e2126] bg-black">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                Page{" "}
                <strong className="text-white">
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
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
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
                  className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-400 hover:text-white"
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
              <XCircle className="w-5 h-5 text-gray-400 hover:text-[#f5d800]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
