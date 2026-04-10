"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchPendingWithdrawalTxns } from "@/src/store/slices/adminWalletSlice";
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
    <div className="w-full flex flex-col gap-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text leading-tight">
              Pending Withdrawal Requests
            </h1>
            <p className="text-[11px] text-amazon-textMuted mt-0.5">
              Manage withdrawal requests currently pending from Shops.
            </p>
          </div>
          <span className="text-[10px] text-amazon-textMuted">
            Total:{" "}
            <strong className="text-amazon-text mx-1">
              {pendingPagination?.totalCount || 0}
            </strong>{" "}
            requests
          </span>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-md border border-amazon-border overflow-hidden flex flex-col shadow-sm">
          {loadingPending && pendingWithdrawals.length === 0 ? (
            <div className="p-12 text-center text-[11px] text-amazon-textMuted">
              Loading data...
            </div>
          ) : pendingWithdrawals.length === 0 && !loadingPending ? (
            /* ─── Empty State ─────────────────────────── */
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <h3 className="text-[13px] font-bold text-amazon-text mb-1">
                No requests
              </h3>
              <p className="text-[11px] text-amazon-textMuted max-w-xs">
                There are currently no withdrawal requests pending.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-neutral-50 border-b border-amazon-border">
                  <tr className="text-left text-[10px] font-medium text-amazon-textMuted">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Fee</th>
                    <th className="px-4 py-2">Bank</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border">
                  {pendingWithdrawals.map((tx: TransactionItem) => {
                    const bank = parseBankDetails(tx.description);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-4 py-3 text-[10px] text-amazon-textMuted">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-[11px] text-amazon-text">
                            {tx.amount.toLocaleString("en-US")}₫
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-amazon-textMuted">
                            {tx.feeAmount > 0
                              ? `${tx.feeAmount.toLocaleString("en-US")}₫`
                              : "—"}
                          </span>
                        </td>

                        {/* Bank Details */}
                        <td className="px-4 py-3">
                          {bank ? (
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-medium text-amazon-text">
                                {bank.bankName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-amazon-textMuted">
                                <span>{bank.accountNumber}</span>
                                <button
                                  onClick={() => handleCopy(bank.accountNumber)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors px-1 border border-transparent hover:border-blue-200 bg-transparent hover:bg-blue-50 rounded"
                                  title="Copy Account Number"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-[10px] text-amazon-textMuted">
                                {bank.accountName}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amazon-textMuted">
                              No information
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleOpenApproveModal(tx.id, tx.amount)
                              }
                              className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-medium rounded hover:bg-green-100 transition-colors"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleOpenRejectModal(tx.id, tx.amount)
                              }
                              className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-medium rounded hover:bg-red-100 transition-colors"
                              title="Reject"
                            >
                              Reject
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-amazon-border bg-neutral-50/50">
              <p className="text-[10px] text-amazon-textMuted">
                Page{" "}
                <strong className="text-amazon-text mx-0.5">
                  {pendingPagination.currentPage} /{" "}
                  {pendingPagination.totalPages}
                </strong>{" "}
                — {pendingPagination.totalCount} requests
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pendingPagination.hasPreviousPage}
                  className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, pendingPagination.totalPages),
                    )
                  }
                  disabled={!pendingPagination.hasNextPage}
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
