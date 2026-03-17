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
    Promotion: "bg-green-500/10 text-green-500 border-green-500/20",
    Negotiation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Compensation: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest border ${map[type] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status, endDate }: { status: string; endDate: string }) {
  if (isExpired(endDate)) {
    return (
      <span className="inline-block rounded-sm bg-gray-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-500 border border-gray-500/20">
        Expired
      </span>
    );
  }
  const map: Record<string, string> = {
    Active: "bg-green-500/10 text-green-500 border-green-500/20",
    Disabled: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest border ${map[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
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
        <span className="font-bold text-white">{voucher.value}%</span>
        {voucher.maxDiscountAmount != null && (
          <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
            (Max {formatVND(voucher.maxDiscountAmount)})
          </span>
        )}
      </div>
    );
  }
  return <span className="font-bold text-white">{formatVND(voucher.value)}</span>;
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
      <span className="text-[10px] font-bold text-gray-400">
        {usedCount}/{usageLimit}
      </span>
      <div className="mt-1 h-1.5 w-full rounded-full bg-[#1e2126]">
        <div
          className="h-1.5 rounded-full bg-[#f5d800] transition-all"
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
      `Bạn có chắc chắn muốn xóa mã giảm giá "${voucher.code}" không?`,
    );
    if (!confirmed) return;
    try {
      const result = await dispatch(deleteVoucherThunk(voucher.id)).unwrap();
      toast.success(result.message || "Voucher deleted successfully");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Xoá voucher thất bại");
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      const result = await dispatch(
        toggleVoucherStatusThunk(voucher.id),
      ).unwrap();
      toast.success(result.message || "Voucher status updated successfully");
    } catch (err: unknown) {
      toast.error(
        typeof err === "string" ? err : "Cập nhật trạng thái thất bại",
      );
    }
  };

  const handleViewDetails = (id: string) => {
    dispatch(getVoucherDetailsThunk(id));
    setShowDetailsModal(true);
  };

  // ── Loading ──
  if (loadingVouchers) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#f5d800]" />
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-2 md:px-6 relative">
      <div className="max-w-[1440px] w-full mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-2xl font-black font-oswald uppercase tracking-widest text-white">
              Voucher Management
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">
              Manage your shop's vouchers and promotions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-sm bg-[#f5d800] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black transition hover:bg-[#ffe500] shadow-[0_0_15px_rgba(245,216,0,0.3)]"
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
      <div className="overflow-x-auto rounded-sm bg-[#151515] shadow-sm border border-[#1e2126]">
        <table className="w-full text-left text-xs text-white">
          <thead className="border-b border-[#1e2126] bg-black text-[11px] font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-2 py-2">Code</th>
              <th className="px-2 py-2">Name & Description</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-3 py-3">Discount</th>
              <th className="px-3 py-3">Min Order</th>
              <th className="px-2 py-2">Used</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2126]">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-[#202030] transition-colors">
                {/* Code */}
                <td className="whitespace-nowrap px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#f5d800]">
                      {v.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(v.code)}
                      className="text-gray-500 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      <Copy className="h-2 w-2" />
                    </button>
                  </div>
                </td>

                {/* Name & Description */}
                <td className="px-3 py-3 max-w-[130px] lg:max-w-[180px]">
                  <p className="font-bold text-white truncate">{v.name}</p>
                  <p className="text-[10px] font-medium text-gray-400 truncate mt-0.5">
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
                <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-300">
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
                      className="rounded-sm p-1 text-gray-500 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-[#1e2126]"
                      title="View details"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVoucher(v)}
                      className="rounded-sm p-1 text-gray-500 hover:bg-black hover:text-[#f5d800] transition-colors border border-transparent hover:border-[#1e2126]"
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(v)}
                      disabled={isExpired(v.endDate)}
                      className="rounded-sm p-1 text-gray-500 hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-[#1e2126]"
                      title={
                        v.status === "Active"
                          ? "Disable voucher"
                          : "Enable voucher"
                      }
                    >
                      {v.status === "Active" ? (
                        <ToggleRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-3 w-3 text-gray-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v)}
                      className="rounded-sm p-1 text-gray-500 hover:bg-black hover:text-red-500 transition-colors border border-transparent hover:border-[#1e2126]"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {vouchers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Trash2 className="h-6 w-6 text-[#1e2126]" />
                    No vouchers found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {/* ── Pagination ── */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span>
            Page {pagination.currentPage} / {pagination.totalPages} &middot;{" "}
            {pagination.totalCount} voucher(s)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => goToPage(pagination.currentPage - 1)}
              className="inline-flex items-center gap-1 rounded-sm border border-[#1e2126] bg-[#151515] px-2.5 py-1.5 transition-colors hover:bg-[#202030] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-400"
            >
              <ChevronLeft className="h-3 w-3" /> Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.currentPage + 1)}
              className="inline-flex items-center gap-1 rounded-sm border border-[#1e2126] bg-[#151515] px-2.5 py-1.5 transition-colors hover:bg-[#202030] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-400"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
