"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchPendingWithdrawalTxns } from "@/src/store/slices/adminWalletSlice";
import {
  Banknote,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Inbox,
  XCircle,
} from "lucide-react";
import { TransactionItem } from "@/src/services/wallet.service";
import ApproveWithdrawalModal from "@/src/components/Admin/ApproveWithdrawalModal";
import RejectWithdrawalModal from "@/src/components/Admin/RejectWithdrawalModal";
import { toast } from "react-toastify";

// ─── Parse bank details from description ─────────────────
interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

function parseBankDetails(description: string | null): BankDetails | null {
  if (!description) return null;
  // Format: "Withdraw to: {bankName} - {accountNumber} - {accountName}"
  const match = description.match(
    /Withdraw to:\s*(.+?)\s*-\s*(\S+)\s*-\s*(.+)/,
  );
  if (!match) return null;
  return {
    bankName: match[1].trim(),
    accountNumber: match[2].trim(),
    accountName: match[3].trim(),
  };
}

// ─── Main Page ───────────────────────────────────────────
export default function PendingWithdrawalsPage() {
  const dispatch = useAppDispatch();
  const { pendingWithdrawals, loadingPending, pendingPagination } =
    useAppSelector((state) => state.adminWallet);

  const [page, setPage] = useState(1);
  const size = 100;

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<{
    id: string;
    amount: number;
  } | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<{
    id: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchPendingWithdrawalTxns({ page, size }));
  }, [dispatch, page]);

  const refetch = () => {
    dispatch(fetchPendingWithdrawalTxns({ page, size }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  const handleOpenApproveModal = (txId: string, amount: number) => {
    setApproveTarget({ id: txId, amount });
  };

  const handleOpenRejectModal = (txId: string, amount: number) => {
    setRejectTarget({ id: txId, amount });
  };

  return (
    <div className="p-8 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 mb-2 font-oswald uppercase flex items-center gap-3">
              <Banknote className="w-8 h-8" />
              Pending Withdrawal Requests
            </h1>
            <p className="text-gray-500">
              Manage withdrawal requests currently pending from Shops.
            </p>
          </div>
          <span className="text-sm text-gray-500">
            Total: <strong>{pendingPagination?.totalCount || 0}</strong>{" "}
            requests
          </span>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingPending && pendingWithdrawals.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Loading data...
            </div>
          ) : pendingWithdrawals.length === 0 && !loadingPending ? (
            /* ─── Empty State ─────────────────────────── */
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Inbox className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 font-oswald uppercase mb-1">
                No requests
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                There are currently no withdrawal requests pending.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-200">
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4">Bank</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingWithdrawals.map((tx: TransactionItem) => {
                    const bank = parseBankDetails(tx.description);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Date */}
                        <td className="p-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tx.createdAt).toLocaleDateString(
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

                        {/* Amount */}
                        <td className="p-4">
                          <span className="font-bold text-[#ce2a32] font-oswald text-base">
                            {tx.amount.toLocaleString("en-US")}
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="p-4">
                          <span className="text-sm text-gray-500 font-oswald">
                            {tx.feeAmount > 0
                              ? `${tx.feeAmount.toLocaleString("en-US")}`
                              : "—"}
                          </span>
                        </td>

                        {/* Bank Details */}
                        <td className="p-4">
                          {bank ? (
                            <div className="space-y-0.5">
                              <p className="text-xs text-gray-500 font-medium">
                                {bank.bankName}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 text-sm font-mono">
                                  {bank.accountNumber}
                                </span>
                                <button
                                  onClick={() => handleCopy(bank.accountNumber)}
                                  className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                  title="Copy Account Number"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-600">
                                {bank.accountName}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              No information
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleOpenApproveModal(tx.id, tx.amount)
                              }
                              className="p-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-600 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleOpenRejectModal(tx.id, tx.amount)
                              }
                              className="p-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 hover:border-red-400 text-red-600 transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pendingPagination && pendingPagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Page{" "}
                <strong>
                  {pendingPagination.currentPage} /{" "}
                  {pendingPagination.totalPages}
                </strong>{" "}
                — {pendingPagination.totalCount} requests
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pendingPagination.hasPreviousPage}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, pendingPagination.totalPages),
                    )
                  }
                  disabled={!pendingPagination.hasNextPage}
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
          paymentId={approveTarget.id}
          amount={approveTarget.amount}
          onClose={() => setApproveTarget(null)}
          onSuccess={refetch}
        />
      )}

      {/* ─── Reject Modal ─────────────────────────────── */}
      {rejectTarget && (
        <RejectWithdrawalModal
          isOpen={!!rejectTarget}
          paymentId={rejectTarget.id}
          amount={rejectTarget.amount}
          shopName=""
          onClose={() => setRejectTarget(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
