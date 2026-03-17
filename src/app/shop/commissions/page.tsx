"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import { fetchShopTargetedRequests, rejectCommissionRequest } from "@/src/store/slices/commissionSlice";
import {
  Inbox,
  FileEdit,
  XCircle,
  User,
  Banknote,
  Calendar,
  Loader2,
} from "lucide-react";
import { SubmitQuoteModal } from "@/src/components/Shop/SubmitQuoteModal";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PendingTarget: {
    bg: "bg-[#f5d800]/10 border border-[#f5d800]/20",
    text: "text-[#f5d800]",
    label: "Waiting for response",
  },
  OpenPool: { bg: "bg-blue-500/10 border border-blue-500/20", text: "text-blue-400", label: "Open" },
  Completed: {
    bg: "bg-green-500/10 border border-green-500/20",
    text: "text-green-400",
    label: "Completed",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-[#202030] border border-[#1e2126]",
  text: "text-gray-400",
  label: "Unknown",
};

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + "₫";

const formatDateTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return dateStr;
  }
};

// ─── Skeleton Row ──────────────────────────────────────────
const RowSkeleton = () => (
  <div className="bg-[#151515] rounded-sm border border-[#1e2126] p-5 animate-pulse flex gap-4">
    <div className="w-20 h-20 bg-[#202030] rounded-sm shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-5 w-48 bg-[#202030] rounded-sm" />
      <div className="h-4 w-32 bg-[#202030] rounded-sm" />
      <div className="h-4 w-40 bg-[#202030] rounded-sm" />
    </div>
    <div className="flex items-center gap-2">
      <div className="h-9 w-28 bg-[#202030] rounded-sm" />
      <div className="h-9 w-24 bg-[#202030] rounded-sm" />
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────
export default function ShopTargetedRequestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { targetedRequests, loadingTargetedRequests } = useSelector(
    (state: RootState) => state.commission,
  );

  const [quoteModal, setQuoteModal] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: "" });

  // ─── Rejection Modal State ───
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: "" });
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    dispatch(fetchShopTargetedRequests());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchShopTargetedRequests());
  };

  const handleRejectClick = (requestId: string) => {
    setRejectModal({ isOpen: true, requestId });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.requestId) return;
    setIsRejecting(true);
    try {
      await dispatch(rejectCommissionRequest(rejectModal.requestId)).unwrap();
      setRejectModal({ isOpen: false, requestId: "" });
      handleRefresh(); // Refresh the list if needed
    } catch (error) {
      console.error("Failed to reject request", error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <SubmitQuoteModal
        isOpen={quoteModal.isOpen}
        onClose={() => setQuoteModal({ isOpen: false, requestId: "" })}
        requestId={quoteModal.requestId}
        onSuccess={handleRefresh}
      />

      {/* Confirmation Modal for Rejection */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white border border-[#1e2126] w-full max-w-sm rounded-sm p-6 shadow-xl">
            <h2 className="text-xl font-oswald font-black text-black uppercase tracking-widest mb-3">
              Confirm Rejection
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black mb-6">
              Are you sure you want to reject this commission request? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => !isRejecting && setRejectModal({ isOpen: false, requestId: "" })}
                disabled={isRejecting}
                className="px-4 py-2 bg-white hover:bg-red-500 hover:text-white border border-[#1e2126] text-black font-bold uppercase tracking-widest text-[11px] rounded-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#1e2126] hover:bg-black hover:text-white text-black font-black uppercase tracking-widest text-[11px] rounded-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="mb-6 border-b border-[#1e2126] pb-4">
        <h1 className="text-3xl font-oswald font-black text-white uppercase tracking-widest flex items-center gap-3">Targeted Requests</h1>
        <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
          Quotation requests sent by customers to your shop
        </p>
      </div>

      {/* Loading */}
      {loadingTargetedRequests && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingTargetedRequests && targetedRequests.length === 0 && (
        <div className="bg-[#151515] rounded-sm border border-[#1e2126] flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-black border border-[#1e2126] flex items-center justify-center mb-5">
            <Inbox className="w-10 h-10 text-[#f5d800]" />
          </div>
          <h2 className="text-[13px] font-black uppercase tracking-widest text-white mb-1">
            There are currently no targeted requests
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 max-w-sm">
            When customers send quotation requests to your shop, they will
            appear here.
          </p>
        </div>
      )}

      {/* Request List */}
      {!loadingTargetedRequests && targetedRequests.length > 0 && (
        <div className="space-y-4">
          {targetedRequests.map((req) => {
            const statusStyle = STATUS_STYLES[req.status] || DEFAULT_STATUS;

            return (
              <div
                key={req.commissionRequestId}
                className="bg-[#151515] rounded-sm border border-[#1e2126] p-5 hover:border-[#f5d800]/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Thumbnail */}
                  {req.referenceImages && (
                    <div className="relative w-full lg:w-24 h-40 lg:h-24 rounded-sm overflow-hidden bg-black border border-[#1e2126] shrink-0">
                      <Image
                        src={req.referenceImages}
                        alt={req.title}
                        fill
                        className="object-cover p-1"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-white text-[15px] uppercase tracking-wider truncate">
                          {req.title}
                        </h3>
                        <p className="text-[11px] font-bold text-[#f5d800] uppercase tracking-widest mt-1">
                          Qty: {req.quantity}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-white">
                          {req.userName || "Customer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[#f5d800]">
                          {formatVND(req.minBudget)} –{" "}
                          {formatVND(req.maxBudget)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDateTime(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 lg:self-center">
                    <button
                      onClick={() =>
                        setQuoteModal({
                          isOpen: true,
                          requestId: req.commissionRequestId,
                        })
                      }
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-[#f5d800] hover:bg-[#ffe500] text-black font-black uppercase tracking-widest text-[11px] rounded-sm transition-colors shadow-[0_0_15px_rgba(245,216,0,0.3)]"
                    >
                      <FileEdit className="w-4 h-4" /> Quote
                    </button>
                    <button
                      onClick={() => handleRejectClick(req.commissionRequestId)}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-transparent hover:bg-red-500/10 text-red-500 font-bold uppercase tracking-widest text-[11px] rounded-sm transition-colors border border-red-500/50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
