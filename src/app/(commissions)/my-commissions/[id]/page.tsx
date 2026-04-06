"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchCommissionDetail,
  acceptCommissionQuote,
  cancelCommission,
  publishCommissionToPool,
} from "@/src/store/slices/commissionSlice";
import { CommissionQuote } from "@/src/types/commission.types";
import { EditCommissionModal } from "@/src/components/Profile/EditCommissionModal";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Store,
  Hash,
  Banknote,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  Draft: { bg: "bg-[#202030]", border: "border-[#2a2d35]", text: "text-gray-300", label: "Draft" },
  PendingTarget: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    label: "Waiting for Shop",
  },
  Quoted: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", label: "Quoted" },
  OpenPool: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", label: "Open" },
  Completed: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    label: "Completed",
  },
  Canceled: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    label: "Canceled",
  },
  TargetRejected: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    label: "Shop rejected",
  },
};

const QUOTE_STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  PendingUserDecision: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    label: "Waiting for your decision",
  },
  Accepted: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    label: "Accepted",
  },
  Rejected: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "Rejected" },
  Expired: { bg: "bg-[#202030]", border: "border-[#2a2d35]", text: "text-gray-500", label: "Expired" },
};

const DEFAULT_STATUS = {
  bg: "bg-[#202030]",
  border: "border-[#2a2d35]",
  text: "text-gray-400",
  label: "Unknown",
};

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + "₫";

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
};

// ─── QuoteCard ─────────────────────────────────────────────
interface QuoteCardProps {
  quote: CommissionQuote;
  isAccepting: boolean;
  onAccept: (quoteId: string) => void;
}

const QuoteCard = ({ quote, isAccepting, onAccept }: QuoteCardProps) => {
  const qStatus = QUOTE_STATUS_STYLES[quote.status] || DEFAULT_STATUS;
  const isPending = quote.status === "PendingUserDecision";
  const isAccepted = quote.status === "Accepted";

  return (
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] hover:border-[#3a3f4a] p-6 shadow-sm hover:shadow-md transition-colors">
      {/* Header: Shop info + quote status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-[#2a2d35] bg-[#111111] flex items-center justify-center shrink-0">
            {quote.shopAvatar ? (
              <Image
                src={quote.shopAvatar}
                alt={quote.shopName}
                fill
                className="object-cover"
              />
            ) : (
              <Store className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <p className="font-black text-white text-[12px] uppercase tracking-widest">
              {quote.shopName || "Shop"}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#f5d800]">Quotation</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 box-border rounded-sm border text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${qStatus.bg} ${qStatus.text} ${qStatus.border}`}
        >
          {qStatus.label}
        </span>
      </div>

      {/* Body: Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Quoted Price</p>
          <p className="text-xl font-black text-[#f5d800]">
            {formatVND(quote.quotedPrice)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Estimated Time</p>
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {quote.estimatedDays} days
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Deadline</p>
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(quote.expiredAt)}
          </p>
        </div>
      </div>

      {/* Shop Notes */}
      {quote.shopNotes && (
        <div className="bg-[#111111] border-l-2 border-[#f5d800] rounded-r-sm px-4 py-4 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Message from Shop:</p>
          <p className="text-[12px] font-medium text-gray-300 italic leading-relaxed">
            {quote.shopNotes}
          </p>
        </div>
      )}

      {/* Footer: Action */}
      {isPending && (
        <button
          onClick={() => onAccept(quote.commissionQuoteId)}
          disabled={isAccepting}
          className="w-full py-3 bg-[#111111] hover:bg-[#1a1c20] text-gray-300 hover:text-[#f5d800] border border-[#2a2d35] hover:border-[#f5d800]/50 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAccepting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Accept quotation
            </>
          )}
        </button>
      )}
      {isAccepted && (
        <div className="w-full py-3 bg-green-500/10 text-green-400 font-black text-[11px] uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 border border-green-500/30">
          <CheckCircle className="w-4 h-4" /> This quotation was selected
        </div>
      )}
    </div>
  );
};

// ─── Confirm Modal ─────────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmAcceptModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#151515] border border-[#1e2126] rounded-sm w-full max-w-sm p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-[14px] font-black uppercase tracking-wider text-white mb-2">
          Confirm Accept Quotation
        </h3>
        <p className="text-[12px] text-gray-400 mb-6">
          Are you sure you want to accept this price? The order will be created
          immediately after confirmation.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-[#111111] hover:bg-[#1a1c20] text-gray-300 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-[#2a2d35]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-[#f5d800] hover:bg-[#e6ca00] text-black font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────
export default function CommissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentRequest,
    loadingDetail,
    isAcceptingQuote,
    isCanceling,
    isPublishingToPool,
  } = useSelector((state: RootState) => state.commission);

  const [confirmQuoteId, setConfirmQuoteId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchCommissionDetail(params.id));
    }
  }, [dispatch, params.id]);

  const handleAccept = (quoteId: string) => {
    setConfirmQuoteId(quoteId);
  };

  const handleConfirmAccept = async () => {
    if (!confirmQuoteId || !params.id) return;
    try {
      await dispatch(acceptCommissionQuote(confirmQuoteId)).unwrap();
      toast.success("Báo giá đã được chấp nhận!");
      setConfirmQuoteId(null);
      router.push(`/cart`);
    } catch {
      // toast handled in thunk
    }
  };

  const handleCancelRequest = async () => {
    if (!params.id) return;
    try {
      await dispatch(cancelCommission(params.id)).unwrap();
      setShowCancelConfirm(false);
    } catch {
      // toast handled in thunk
    }
  };

  const handlePublishToPool = async () => {
    if (!params.id) return;
    try {
      await dispatch(publishCommissionToPool(params.id)).unwrap();
      setShowPublishConfirm(false);
    } catch {
      // toast handled in thunk
    }
  };

  // Full-page loading
  if (loadingDetail || !currentRequest) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#f5d800] animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Loading details...</p>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[currentRequest.status] || DEFAULT_STATUS;
  const isDraft = currentRequest.status === "Draft";
  const isCanceled = currentRequest.status === "Canceled";
  const canCancel =
    !isDraft &&
    !isCanceled &&
    (currentRequest.status === "PendingTarget" ||
      currentRequest.status === "OpenPool");
  const canPublish =
    !isDraft &&
    (currentRequest.status === "PendingTarget" ||
      currentRequest.status === "TargetRejected");

  return (
    <div className="bg-black text-white min-h-screen">
      <ConfirmAcceptModal
        isOpen={!!confirmQuoteId}
        onConfirm={handleConfirmAccept}
        onCancel={() => setConfirmQuoteId(null)}
        isLoading={isAcceptingQuote}
      />

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-[#151515] border border-[#1e2126] rounded-sm w-full max-w-sm p-8 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-white mb-2">
              Confirm cancel request
            </h3>
            <p className="text-[12px] text-gray-400 mb-6">
                Are you sure you want to cancel this request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-[#111111] hover:bg-[#1a1c20] text-gray-300 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-[#2a2d35]"
              >
              Back
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isCanceling}
                className="flex-1 py-3 bg-[#ce2a32] hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isCanceling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {showPublishConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowPublishConfirm(false)}
        >
          <div
            className="bg-[#151515] border border-[#1e2126] rounded-sm w-full max-w-sm p-8 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-5">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-white mb-2">
              Publish to pool
            </h3>
            <p className="text-[12px] text-gray-400 mb-6">
              Do you want to publish this request to the public market for other shops to quote? This action will remove the current shop assignment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 py-3 bg-[#111111] hover:bg-[#1a1c20] text-gray-300 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-[#2a2d35]"
              >
                Hủy
              </button>
              <button
                onClick={handlePublishToPool}
                disabled={isPublishingToPool}
                className="flex-1 py-3 bg-[#f5d800] hover:bg-[#e6ca00] text-black font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isPublishingToPool ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href="/my-commissions"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#f5d800] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </Link>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Request Info (col-span-1) ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Canceled Alert */}
            {isCanceled && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[12px] uppercase font-bold tracking-widest text-red-400">
                  This request has been canceled
                </p>
              </div>
            )}

            {/* Reference Image */}
            {currentRequest.referenceImages && (
              <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#0f0f0f] border border-[#1e2126] shadow-sm">
                <Image
                  src={currentRequest.referenceImages}
                  alt={currentRequest.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Title + Status */}
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-snug flex-1">
                  {currentRequest.title}
                </h1>
                <span
                  className={`shrink-0 px-3 py-1.5 box-border rounded-sm border text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  {statusStyle.label}
                </span>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                ID: {currentRequest.commissionRequestId}
              </p>
            </div>

            {/* Details Card */}
            <div className="bg-[#151515] rounded-sm border border-[#1e2126] p-6 space-y-4">
              {/* Shop target */}
              {currentRequest.targetedShopId ? (
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Sent to:</span>
                  <span className="font-black text-[12px] text-white">
                    {currentRequest.targetedShopName || "Shop"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Sent to:</span>
                  <span className="font-black text-[12px] text-white">Public Market</span>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Quantity:</span>
                <span className="font-black text-[12px] text-white">
                  {currentRequest.quantity}
                </span>
              </div>

              {/* Budget */}
              <div className="flex items-center gap-3">
                <Banknote className="w-4 h-4 text-gray-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Budget:</span>
                <span className="font-black text-[12px] text-[#f5d800]">
                  {formatVND(currentRequest.minBudget)} –{" "}
                  {formatVND(currentRequest.maxBudget)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Created date:</span>
                <span className="font-black text-[12px] text-white">
                  {formatDate(currentRequest.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#151515] rounded-sm border border-[#1e2126] p-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#f5d800] mb-3">
                Request Description
              </h3>
              <p className="text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">
                {currentRequest.description}
              </p>
            </div>

            {/* Draft Action Buttons */}
            {isDraft && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={isPublishingToPool}
                  className="flex-1 py-3.5 bg-[#f5d800] hover:bg-[#e6ca00] text-black font-black uppercase text-[11px] tracking-widest rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPublishingToPool ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  Publish Request
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-3.5 bg-[#111111] hover:bg-[#1a1c20] hover:text-[#f5d800] hover:border-[#f5d800]/50 text-gray-300 font-black uppercase text-[11px] tracking-widest rounded-sm transition-colors border border-[#2a2d35]"
                >
                  Edit Request
                </button>
              </div>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCanceling}
                className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Canceling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Cancel request
                  </>
                )}
              </button>
            )}

            {/* Publish to Pool Button */}
            {canPublish && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={isPublishingToPool}
                className="w-full py-3.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-blue-500/30 hover:border-blue-500/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPublishingToPool ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" /> Publish to Public Market
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Right Column: Quotes / Bids (col-span-2) ── */}
          <div className="lg:col-span-2">
            <h2 className="text-[14px] font-black uppercase tracking-widest text-white mb-6">
              Quotations from Shop
            </h2>

            {currentRequest.quotes.length === 0 ? (
              /* Empty State */
              <div className="bg-[#151515] rounded-sm border border-dashed border-[#1e2126] flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#202030] border border-[#2a2d35] flex items-center justify-center mb-5">
                  <Clock className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-widest text-white mb-2">
                  No quotations yet
                </h3>
                <p className="text-[12px] text-gray-400 max-w-xs">
                  Please wait for shop response...
                </p>
              </div>
            ) : (
              /* Quotes List */
              <div className="space-y-4">
                {currentRequest.quotes.map((quote) => (
                  <QuoteCard
                    key={quote.commissionQuoteId}
                    quote={quote}
                    isAccepting={isAcceptingQuote}
                    onAccept={handleAccept}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Draft Modal */}
      {currentRequest && (
        <EditCommissionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          request={currentRequest}
        />
      )}
    </div>
  );
}
