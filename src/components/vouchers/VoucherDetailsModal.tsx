"use client";

import { FC, useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Info,
  History,
  Copy,
  Check,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { getVoucherUsageHistoryThunk } from "@/src/store/slices/voucherSlice";

// ─── Helpers ─────────────────────────────────────────────

function fmtVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

// ─── Copiable Field ──────────────────────────────────────

const CopiableField: FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({ label, value, mono }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`text-sm font-medium text-gray-900 break-all ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
          title="Copy"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusColor(status: string): string {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Disabled":
      return "bg-red-100 text-red-700";
    case "Expired":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function typeColor(type: string): string {
  switch (type) {
    case "Promotion":
      return "bg-green-100 text-green-700";
    case "Negotiation":
      return "bg-purple-100 text-purple-700";
    case "Compensation":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ─── Detail Row ──────────────────────────────────────────

const DetailRow: FC<{
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <div className="text-sm font-medium text-gray-900">{children}</div>
  </div>
);

// ─── Props ───────────────────────────────────────────────

interface VoucherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Outer Wrapper (handles mount/unmount) ───────────────

const VoucherDetailsModal: FC<VoucherDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return <VoucherDetailsModalContent onClose={onClose} />;
};

// ─── Inner Content (state resets on remount) ─────────────

const VoucherDetailsModalContent: FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const voucher = useAppSelector(
    (state) => state.voucher.selectedVoucherDetails,
  );
  const loading = useAppSelector((state) => state.voucher.isFetchingDetails);
  const usageHistory = useAppSelector((state) => state.voucher.usageHistory);
  const usagePagination = useAppSelector(
    (state) => state.voucher.usagePagination,
  );
  const isFetchingUsage = useAppSelector(
    (state) => state.voucher.isFetchingUsage,
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fetch usage history when voucher details are loaded
  useEffect(() => {
    if (voucher?.id) {
      dispatch(
        getVoucherUsageHistoryThunk({
          id: voucher.id,
          pageNumber: 1,
          pageSize: 5,
        }),
      );
    }
  }, [voucher?.id, dispatch]);

  const voucherId = voucher?.id;

  const handleUsagePageChange = useCallback(
    (newPage: number) => {
      if (!voucherId) return;
      dispatch(
        getVoucherUsageHistoryThunk({
          id: voucherId,
          pageNumber: newPage,
          pageSize: 5,
        }),
      );
    },
    [dispatch, voucherId],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const usagePct =
    voucher && voucher.usageLimit > 0
      ? Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)
      : 0;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 transition-opacity"
    >
      <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mx-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#ce2a32]" />
            <h3 className="font-bold text-base text-gray-900">
              Voucher Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Tab Bar ── */}
        {!loading && voucher && (
          <div className="flex border-b border-gray-200 px-6">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`inline-flex items-center gap-1.5 py-3 px-4 text-sm transition-colors border-b-2 ${
                activeTab === "details"
                  ? "border-[#ce2a32] text-[#ce2a32] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 font-medium"
              }`}
            >
              <Info className="w-4 h-4" />
              General Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center gap-1.5 py-3 px-4 text-sm transition-colors border-b-2 ${
                activeTab === "history"
                  ? "border-[#ce2a32] text-[#ce2a32] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 font-medium"
              }`}
            >
              <History className="w-4 h-4" />
              Usage History
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">Loading details...</p>
            </div>
          ) : !voucher ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Ticket className="w-10 h-10 opacity-20 mb-3" />
              <p className="text-sm">Voucher not found</p>
            </div>
          ) : (
            <>
              {/* ── Details Tab ── */}
              {activeTab === "details" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Section A: Định danh */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Identification
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <div className="sm:col-span-2">
                        <CopiableField label="ID" value={voucher.id} mono />
                      </div>
                      <CopiableField
                        label="Voucher Code"
                        value={voucher.code}
                        mono
                      />
                      <DetailRow label="Name">{voucher.name}</DetailRow>
                      <DetailRow label="Type">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColor(voucher.type)}`}
                        >
                          {voucher.type}
                        </span>
                      </DetailRow>
                      <DetailRow label="Creator">
                        {voucher.creatorName}
                      </DetailRow>
                      {voucher.targetUserId && (
                        <div className="sm:col-span-2">
                          <CopiableField
                            label="Designated Recipient"
                            value={voucher.targetUserId}
                            mono
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section B: Giá trị & Điều kiện */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Value & Conditions
                    </h4>
                    {voucher.description && (
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {voucher.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                      <DetailRow label="Discount Type">
                        {voucher.discountType === "Percentage"
                          ? "Percentage (%)"
                          : "Fixed Amount (₫)"}
                      </DetailRow>
                      <DetailRow label="Discount">
                        {voucher.discountType === "Percentage" ? (
                          <span className="text-lg font-bold text-[#ce2a32]">
                            {voucher.value}%
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-[#ce2a32]">
                            {fmtVND(voucher.value)}
                          </span>
                        )}
                      </DetailRow>
                      {voucher.maxDiscountAmount != null && (
                        <DetailRow label="Max Discount">
                          {fmtVND(voucher.maxDiscountAmount)}
                        </DetailRow>
                      )}
                      <DetailRow label="Minimum Order">
                        {fmtVND(voucher.minOrderValue)}
                      </DetailRow>
                    </div>
                  </div>

                  {/* Section C: Thời gian & Giới hạn */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Time & Limit
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                      <DetailRow label="Start Date">
                        {fmtDate(voucher.startDate)}
                      </DetailRow>
                      <DetailRow label="End Date">
                        {fmtDate(voucher.endDate)}
                      </DetailRow>
                      <DetailRow label="Status">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(voucher.status)}`}
                        >
                          {voucher.status}
                        </span>
                      </DetailRow>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Usage Progress
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-gray-200">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 shrink-0">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section D: Chính sách cộng dồn */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Stacking Policy
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <DetailRow label="Stackable">
                        {voucher.isStackable ? (
                          <span className="text-green-600 font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </DetailRow>
                      <DetailRow label="Policy">
                        {voucher.stackingPolicy}
                      </DetailRow>
                    </div>
                  </div>
                </div>
              )}

              {/* ── History Tab ── */}
              {activeTab === "history" && (
                <div className="animate-in fade-in duration-300">
                  {isFetchingUsage ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : usageHistory.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No usage yet.
                    </p>
                  ) : (
                    <>
                      <div className="rounded-lg border border-gray-100">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                            <tr>
                              <th className="px-4 py-2.5 w-[170px]">
                                Used Date
                              </th>
                              <th className="px-4 py-2.5">Customer</th>
                              <th className="px-4 py-2.5">Order Code</th>
                              <th className="px-4 py-2.5 text-right">
                                Order Value
                              </th>
                              <th className="px-4 py-2.5 text-right">
                                Discount Applied
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {usageHistory.map((item, idx) => (
                              <tr
                                key={`${item.orderId}-${idx}`}
                                className="hover:bg-gray-50 transition"
                              >
                                <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                                  {fmtDate(item.appliedAt)}
                                </td>
                                <td className="px-4 py-2.5 text-gray-800 font-medium">
                                  {item.customerName}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">
                                  <div className="flex items-center gap-1">
                                    <span>
                                      {item.orderId.length > 12
                                        ? `${item.orderId.slice(0, 12)}…`
                                        : item.orderId}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          item.orderId,
                                        )
                                      }
                                      className="shrink-0 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
                                      title="Copy order code"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-700">
                                  {fmtVND(item.orderTotalAmount)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-[#ce2a32]">
                                  -{fmtVND(item.discountApplied)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Usage pagination */}
                      {usagePagination && usagePagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                          <span>
                            Page {usagePagination.currentPage} /{" "}
                            {usagePagination.totalPages}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={!usagePagination.hasPreviousPage}
                              onClick={() =>
                                handleUsagePageChange(
                                  usagePagination.currentPage - 1,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 font-medium transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-4 w-4" /> Previous
                            </button>
                            <button
                              type="button"
                              disabled={!usagePagination.hasNextPage}
                              onClick={() =>
                                handleUsagePageChange(
                                  usagePagination.currentPage + 1,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 font-medium transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Next <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetailsModal;
