"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchShopVouchers,
  deleteVoucherThunk,
  toggleVoucherStatusThunk,
  getVoucherDetailsThunk,
} from "@/src/store/slices/voucherSlice";
import { toast } from "react-toastify";
import { Voucher } from "@/src/services/voucher.service";
import {
  Copy,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  Eye,
  Loader2,
} from "lucide-react";
import CreatePromotionVoucherForm from "@/src/components/vouchers/CreatePromotionVoucherForm";
import UpdateVoucherModal from "@/src/components/vouchers/UpdateVoucherModal";
import VoucherDetailsModal from "@/src/components/vouchers/VoucherDetailsModal";

// ─── Helpers ─────────────────────────────────────────────

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function isExpired(endDate: string): boolean {
  return new Date(endDate) < new Date();
}

// ─── Badge Components ────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Promotion: "bg-green-50 text-green-700 border-green-200",
    Negotiation: "bg-purple-50 text-purple-700 border-purple-200",
    Compensation: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium border ${map[type] ?? "bg-neutral-100 text-amazon-textMuted border-amazon-border"}`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status, endDate }: { status: string; endDate: string }) {
  if (isExpired(endDate)) {
    return (
      <span className="inline-block rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-amazon-textMuted border border-amazon-border">
        Expired
      </span>
    );
  }
  const map: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Disabled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium border ${map[status] ?? "bg-neutral-100 text-amazon-textMuted border-amazon-border"}`}
    >
      {status}
    </span>
  );
}

// ─── Discount Display ────────────────────────────────────

function DiscountDisplay({ voucher }: { voucher: Voucher }) {
  if (voucher.discountType === "Percentage") {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-amazon-text">{voucher.value}%</span>
        {voucher.maxDiscountAmount != null && (
          <span className="text-[10px] text-amazon-textMuted font-medium">
            (Max {formatVND(voucher.maxDiscountAmount)})
          </span>
        )}
      </div>
    );
  }
  return <span className="font-medium text-amazon-text">{formatVND(voucher.value)}</span>;
}

// ─── Usage Bar ───────────────────────────────────────────

function UsageBar({
  usedCount,
  usageLimit,
}: {
  usedCount: number;
  usageLimit: number;
}) {
  const pct = usageLimit > 0 ? (usedCount / usageLimit) * 100 : 0;
  return (
    <div>
      <span className="text-[10px] font-medium text-amazon-textMuted">
        {usedCount}/{usageLimit}
      </span>
      <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200">
        <div
          className="h-1.5 rounded-full bg-amazon-focus transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────

export default function ShopVoucherPage() {
  const dispatch = useAppDispatch();
  const { vouchers, pagination, loadingVouchers } = useAppSelector(
    (state) => state.voucher,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    dispatch(fetchShopVouchers({ page: 1, size: 10 }));
  }, [dispatch]);

  const goToPage = (page: number) => {
    dispatch(fetchShopVouchers({ page, size: pagination.pageSize }));
  };

  const handleDelete = async (voucher: Voucher) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the voucher "${voucher.code}"?`,
    );
    if (!confirmed) return;
    try {
      const result = await dispatch(deleteVoucherThunk(voucher.id)).unwrap();
      toast.success(result.message || "Voucher deleted successfully");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to delete voucher");
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      const result = await dispatch(
        toggleVoucherStatusThunk(voucher.id),
      ).unwrap();
      toast.success(result.message || "Voucher status updated successfully");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to update status");
    }
  };

  const handleViewDetails = (id: string) => {
    dispatch(getVoucherDetailsThunk(id));
    setShowDetailsModal(true);
  };

  // ── Loading ──
  if (loadingVouchers) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-amazon-bgSecondary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amazon-textMuted" />
          <p className="text-amazon-textMuted text-[11px] font-medium">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amazon-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text">
              Voucher Management
            </h1>
            <p className="text-amazon-textMuted text-[11px] font-medium mt-1.5">
              Manage your shop's vouchers and promotions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-sm bg-amazon-btnPrimary border border-amazon-border px-3 py-1.5 text-[11px] font-medium text-amazon-text transition hover:brightness-95 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Create Voucher
          </button>
        </div>

        {/* Create Voucher Modal */}
        <CreatePromotionVoucherForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        />

        {/* Update Voucher Modal */}
        {editingVoucher && (
          <UpdateVoucherModal
            voucher={editingVoucher}
            onClose={() => setEditingVoucher(null)}
          />
        )}

        {/* Voucher Details Modal */}
        <VoucherDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-sm bg-white shadow-sm border border-amazon-border">
       
          <table className="w-full text-left text-xs text-amazon-text">
            <thead className="border-b border-amazon-border bg-neutral-50 text-[11px] font-medium text-amazon-textMuted">
              <tr>
           
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Name & Description</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-3 py-3">Discount</th>
                <th className="px-3 py-3">Min Order</th>
                <th className="px-2 py-2">Used</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amazon-border">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                  {/* Code */}
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-medium text-amazon-text">
                        {v.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(v.code)}
                        className="text-amazon-textMuted hover:text-amazon-text transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>

                  {/* Name & Description */}
                  
                 <td className="px-3 py-3 max-w-[130px] lg:max-w-[180px]">
                    <p className="font-medium text-amazon-text truncate capitalize">{v.name}</p>
                    <p className="text-[11px] font-normal text-amazon-textMuted truncate mt-0.5">
                      {v.description}
                    </p>
                  </td>

                  {/* Type */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <TypeBadge type={v.type} />
                  </td>

                  {/* Discount */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <DiscountDisplay voucher={v} />
                  </td>

                  {/* Min Order */}
                  <td className="px-2 py-2 whitespace-nowrap font-medium text-amazon-textMuted">
                    {formatVND(v.minOrderValue)}
                  </td>

                  {/* Usage */}
                  
                  <td className="px-2 py-2 min-w-[90px]">
                    <UsageBar usedCount={v.usedCount} usageLimit={v.usageLimit} />
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <StatusBadge status={v.status} endDate={v.endDate} />
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(v.id)}
                        className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-100 hover:text-amazon-text transition-colors border border-transparent hover:border-amazon-border"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVoucher(v)}
                        className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-100 hover:text-amazon-focus transition-colors border border-transparent hover:border-amazon-border"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(v)}
                        disabled={isExpired(v.endDate)}
                        className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-amazon-border"
                        title={
                          v.status === "Active"
                            ? "Disable voucher"
                            : "Enable voucher"
                        }
                      >
                        {v.status === "Active" ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-amazon-textMuted" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-100 hover:text-red-500 transition-colors border border-transparent hover:border-amazon-border"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {vouchers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-amazon-textMuted text-[11px] font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Trash2 className="h-6 w-6 text-neutral-300" />
                      No vouchers found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] font-medium text-amazon-textMuted">
          <span>
            Page <strong className="text-amazon-text">{pagination.currentPage}</strong> / {pagination.totalPages} &middot;{" "}
            {pagination.totalCount} voucher(s)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => goToPage(pagination.currentPage - 1)}
              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-2.5 py-1.5 transition-colors hover:bg-neutral-50 hover:text-amazon-text disabled:opacity-40 disabled:cursor-not-allowed text-amazon-textMuted"
            >
              <ChevronLeft className="h-3 w-3" /> Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.currentPage + 1)}
              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-2.5 py-1.5 transition-colors hover:bg-neutral-50 hover:text-amazon-text disabled:opacity-40 disabled:cursor-not-allowed text-amazon-textMuted"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}