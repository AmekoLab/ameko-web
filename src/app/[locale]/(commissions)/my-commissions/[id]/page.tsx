"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchCommissionDetail,
  acceptCommissionQuote,
  rejectCommissionQuote,
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
  Info,
  FileText,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; labelKey: string }
> = {
  Draft: {
    bg: "bg-neutral-100",
    border: "border-neutral-200",
    text: "text-neutral-600",
    labelKey: "draft",
  },
  PendingTarget: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    labelKey: "pendingTarget",
  },
  Quoted: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    labelKey: "quoted",
  },
  OpenPool: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    labelKey: "openPool",
  },
  Completed: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    labelKey: "completed",
  },
  Canceled: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "canceled",
  },
  TargetRejected: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "targetRejected",
  },
  RejectedByShop: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "rejectedByShop",
  },
};

const QUOTE_STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; labelKey: string }
> = {
  PendingUserDecision: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    labelKey: "pendingUserDecision",
  },
  Accepted: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    labelKey: "accepted",
  },
  Rejected: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "rejected",
  },
  Expired: {
    bg: "bg-neutral-100",
    border: "border-neutral-200",
    text: "text-neutral-500",
    labelKey: "expired",
  },
  Revoked: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "revoked",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-neutral-100",
  border: "border-neutral-200",
  text: "text-neutral-600",
  labelKey: "unknown",
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
  isRejecting: boolean;
  onAccept: (quoteId: string) => void;
  onReject: (quoteId: string) => void;
}

const QuoteCard = ({
  quote,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: QuoteCardProps) => {
  const t = useTranslations("CommissionDetailPage");
  const tCommon = useTranslations("Common");
  const qStatus = QUOTE_STATUS_STYLES[quote.status] || DEFAULT_STATUS;
  const isPending = quote.status === "PendingUserDecision";
  const isAccepted = quote.status === "Accepted";

  return (
    <div className="bg-white rounded-xl border border-neutral-100 hover:shadow-md p-6 shadow-sm transition-all group/quote">
      {/* Header: Shop info + quote status */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center shrink-0">
            {quote.shopAvatar ? (
              <Image
                src={quote.shopAvatar}
                alt={quote.shopName}
                fill
                className="object-cover"
              />
            ) : (
              <Store className="w-6 h-6 text-neutral-300" />
            )}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 group-hover/quote:text-blue-600 transition-colors">
              {quote.shopName || tCommon("shop")}
            </p>
            <p className="text-xs font-medium text-neutral-500">
              {t("quotationOffer")}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 box-border rounded-md border text-xs font-semibold whitespace-nowrap ${qStatus.bg} ${qStatus.text} ${qStatus.border}`}
        >
          {t(`quoteStatus.${qStatus.labelKey}`)}
        </span>
      </div>

      {/* Body: Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100 relative overflow-hidden">
        {/* Slight gradient flourish for pricing element */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 opacity-50 rounded-l-xl"></div>
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">
            {t("quotedPrice")}
          </p>
          <p className="text-xl font-bold text-green-600">
            {formatVND(quote.quotedPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">
            {t("estimatedTime")}
          </p>
          <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            {t("estimatedDays", { count: quote.estimatedDays })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">
            {t("deadline")}
          </p>
          <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-400" />
            {formatDate(quote.expiredAt)}
          </p>
        </div>
      </div>

      {/* Unit Price Notice */}
      <p className="text-[11px] text-neutral-500 italic mb-5 px-1 flex items-center gap-1">
        <span className="text-red-400 font-bold">*</span> {t("unitPriceNotice")}
      </p>

      {/* Shop Notes */}
      {quote.shopNotes && (
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> {t("messageFromShop")}
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed bg-white border border-neutral-100 p-4 rounded-xl shadow-inner italic">
            {quote.shopNotes}
          </p>
        </div>
      )}

      {/* Footer: Action */}
      {isPending && (
        <div className="flex gap-3">
          <button
            onClick={() => onReject(quote.commissionQuoteId)}
            disabled={isAccepting || isRejecting}
            className="flex-1 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isRejecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("rejecting")}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> {tCommon("reject")}
              </>
            )}
          </button>
          <button
            onClick={() => onAccept(quote.commissionQuoteId)}
            disabled={isAccepting || isRejecting}
            className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                {tCommon("processing")}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> {t("acceptQuotation")}
              </>
            )}
          </button>
        </div>
      )}
      {isAccepted && (
        <div className="w-full py-3 bg-emerald-50 text-emerald-600 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 border border-emerald-100">
          <CheckCircle className="w-5 h-5" /> {t("acceptedQuotationNotice")}
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
  const t = useTranslations("CommissionDetailPage");
  const tCommon = useTranslations("Common");

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-neutral-100 rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {t("acceptQuotationTitle")}
        </h3>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          {t("acceptQuotationMessage")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-xl transition-colors border border-neutral-200"
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              tCommon("confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm Reject Modal ─────────────────────────────────────────
const ConfirmRejectModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) => {
  const t = useTranslations("CommissionDetailPage");
  const tCommon = useTranslations("Common");

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-neutral-100 rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {t("rejectQuotationTitle")}
        </h3>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          {t("rejectQuotationMessage")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-xl transition-colors border border-neutral-200"
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              tCommon("confirm")
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
  const t = useTranslations("CommissionDetailPage");
  const tCommon = useTranslations("Common");
  const {
    currentRequest,
    loadingDetail,
    isAcceptingQuote,
    isRejectingQuote,
    isCanceling,
    isPublishingToPool,
  } = useSelector((state: RootState) => state.commission);

  const [confirmQuoteId, setConfirmQuoteId] = useState<string | null>(null);
  const [rejectQuoteId, setRejectQuoteId] = useState<string | null>(null);
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
      toast.success(t("quotationAcceptedSuccess"));
      setConfirmQuoteId(null);
      router.push(`/cart`);
    } catch {
      // toast handled in thunk
    }
  };

  const handleReject = (quoteId: string) => {
    setRejectQuoteId(quoteId);
  };

  const handleConfirmReject = async () => {
    if (!rejectQuoteId || !params.id) return;
    try {
      await dispatch(
        rejectCommissionQuote({ quoteId: rejectQuoteId, requestId: params.id }),
      ).unwrap();
      setRejectQuoteId(null);
    } catch {
      // handled in thunk
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
      <div className="bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
          <p className="text-sm font-medium text-neutral-500">
            {t("loadingDetails")}
          </p>
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
    <div className="bg-neutral-50 text-neutral-900 min-h-screen font-sans">
      <ConfirmAcceptModal
        isOpen={!!confirmQuoteId}
        onConfirm={handleConfirmAccept}
        onCancel={() => setConfirmQuoteId(null)}
        isLoading={isAcceptingQuote}
      />

      <ConfirmRejectModal
        isOpen={!!rejectQuoteId}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectQuoteId(null)}
        isLoading={isRejectingQuote}
      />

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-white border border-neutral-100 rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {t("cancelRequestTitle")}
            </h3>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
              {t("cancelRequestMessage")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-xl transition-colors border border-neutral-200"
              >
                {tCommon("back")}
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isCanceling}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {isCanceling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  tCommon("confirmCancel")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {showPublishConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
          onClick={() => setShowPublishConfirm(false)}
        >
          <div
            className="bg-white border border-neutral-100 rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {t("publishToMarketTitle")}
            </h3>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
              {t("publishToMarketMessage")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-xl transition-colors border border-neutral-200"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handlePublishToPool}
                disabled={isPublishingToPool}
                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {isPublishingToPool ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  tCommon("publish")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/my-commissions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          {t("backToRequests")}
        </Link>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── Left Column: Request Info (col-span-1) ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Canceled Alert */}
            {isCanceled && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">
                    {t("status.canceled")}
                  </h4>
                  <p className="text-sm text-red-600">
                    {t("requestPermanentlyCanceled")}
                  </p>
                </div>
              </div>
            )}

            {/* Reference Image */}
            {currentRequest.referenceImages && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-sm">
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
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-xl font-bold text-neutral-900 leading-snug flex-1">
                  {currentRequest.title}
                </h1>
                <span
                  className={`shrink-0 px-3 py-1 box-border rounded-md border text-xs font-semibold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  {t(`status.${statusStyle.labelKey}`)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 bg-neutral-100/50 px-2.5 py-1 rounded-md w-fit">
                <Hash className="w-3 h-3" />
                {currentRequest.commissionRequestId}
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5 shadow-sm">
              {/* Shop target */}
              <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Store className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("sentTo")}:</span>
                </div>
                <span className="font-semibold text-sm text-neutral-900">
                  {currentRequest.targetedShopId
                    ? currentRequest.targetedShopName || tCommon("shop")
                    : t("publicMarket")}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {tCommon("quantity")}:
                  </span>
                </div>
                <span className="font-semibold text-sm text-neutral-900">
                  {currentRequest.quantity}
                </span>
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Banknote className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {tCommon("budget")}:
                  </span>
                </div>
                <span className="font-bold text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                  {formatVND(currentRequest.minBudget)} –{" "}
                  {formatVND(currentRequest.maxBudget)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t("dateCreated")}:
                  </span>
                </div>
                <span className="font-semibold text-sm text-neutral-900">
                  {formatDate(currentRequest.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-neutral-400" />
                {t("requestDetails")}
              </h3>
              <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap bg-neutral-50 p-4 rounded-xl border border-neutral-100 shadow-inner">
                {currentRequest.description}
              </div>
            </div>

            {/* Draft Action Buttons */}
            {isDraft && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={isPublishingToPool}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isPublishingToPool ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {tCommon("publish")}
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-sm rounded-xl transition-all border border-neutral-200 shadow-sm active:scale-[0.98]"
                >
                  {t("editHeader")}
                </button>
              </div>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCanceling}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] border border-red-100"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                    {tCommon("canceling")}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> {t("cancelRequest")}
                  </>
                )}
              </button>
            )}

            {/* Publish to Pool Button */}
            {canPublish && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={isPublishingToPool}
                className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] border border-blue-100"
              >
                {isPublishingToPool ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                    {t("publishing")}
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" /> {t("publishToMarket")}
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Right Column: Quotes / Bids (col-span-2) ── */}
          <div className="lg:col-span-2 mt-8 lg:mt-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                {t("quotationsFromBuilders")}
              </h2>
            </div>

            {currentRequest.quotes.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-dashed border-neutral-200 flex flex-col items-center justify-center py-24 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-5 border border-neutral-100">
                  <Clock className="w-6 h-6 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t("noQuotationsYet")}
                </h3>
                <p className="text-sm text-neutral-500 max-w-sm">
                  {t("noQuotationsDescription")}
                </p>
              </div>
            ) : (
              /* Quotes List */
              <div className="space-y-5">
                {currentRequest.quotes.map((quote) => (
                  <QuoteCard
                    key={quote.commissionQuoteId}
                    quote={quote}
                    isAccepting={isAcceptingQuote}
                    isRejecting={isRejectingQuote}
                    onAccept={handleAccept}
                    onReject={handleReject}
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
