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
    Promotion: "bg-green-100 text-green-700",
    Negotiation: "bg-purple-100 text-purple-700",
    Compensation: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[type] ?? "bg-gray-100 text-gray-600"}`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status, endDate }: { status: string; endDate: string }) {
  if (isExpired(endDate)) {
    return (
      <span className="inline-block rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
        Expired
      </span>
    );
  }
  const map: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Disabled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

// ─── Discount Display ────────────────────────────────────

function DiscountDisplay({ voucher }: { voucher: Voucher }) {
  if (voucher.discountType === "Percentage") {
    return (
      <div>
        <span className="font-semibold">{voucher.value}%</span>
        {voucher.maxDiscountAmount != null && (
          <span className="ml-1 text-xs text-gray-500">
            (Max {formatVND(voucher.maxDiscountAmount)})
          </span>
        )}
      </div>
    );
  }
  return <span className="font-semibold">{formatVND(voucher.value)}</span>;
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
      <span className="text-sm">
        {usedCount}/{usageLimit}
      </span>
      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all"
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ce2a32]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black font-oswald">
          Voucher Management
        </h1>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ce2a32] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#b0242b] font-oswald"
        >
          <Plus className="h-4 w-4" /> Create Voucher
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
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name & Description</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition">
                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-sm">
                      {v.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(v.code)}
                      className="text-gray-400 hover:text-gray-600 transition"
                      title="Copy code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>

                {/* Name & Description */}
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="font-bold text-gray-900 truncate">{v.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {v.description}
                  </p>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <TypeBadge type={v.type} />
                </td>

                {/* Discount */}
                <td className="px-4 py-3">
                  <DiscountDisplay voucher={v} />
                </td>

                {/* Min Order */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatVND(v.minOrderValue)}
                </td>

                {/* Usage */}
                <td className="px-4 py-3 min-w-[100px]">
                  <UsageBar usedCount={v.usedCount} usageLimit={v.usageLimit} />
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} endDate={v.endDate} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(v.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVoucher(v)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(v)}
                      disabled={isExpired(v.endDate)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title={
                        v.status === "Active"
                          ? "Disable voucher"
                          : "Enable voucher"
                      }
                    >
                      {v.status === "Active" ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {vouchers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-gray-400 text-sm"
                >
                  No vouchers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {pagination.currentPage} / {pagination.totalPages} &middot;{" "}
          {pagination.totalCount} voucher
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!pagination.hasPreviousPage}
            onClick={() => goToPage(pagination.currentPage - 1)}
            className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 font-medium transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={() => goToPage(pagination.currentPage + 1)}
            className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 font-medium transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
