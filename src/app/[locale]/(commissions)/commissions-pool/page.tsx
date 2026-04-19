"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchPoolRequests,
  submitCommissionQuote,
  cancelCommission,
} from "@/src/store/slices/commissionSlice";
import { CommissionRequest } from "@/src/types/commission.types";
import { CreateCommissionModal } from "@/src/components/Profile/CreateCommissionModal";
import {
  Loader2,
  Package,
  CheckCircle,
  User,
  Calendar,
  Inbox,
  RefreshCw,
  X,
  Hash,
  Send,
  FileText,
  DollarSign,
  Info,
  XCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
  Store,
  ExternalLink,
} from "lucide-react";
import { shopService } from "@/src/services/shopService";
import { useTranslations } from "next-intl";

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

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

// ─── Skeleton Card ─────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col sm:flex-row w-full overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm p-4 gap-5">
    <div className="bg-neutral-100 w-full sm:w-32 h-32 shrink-0 rounded-lg" />
    <div className="flex flex-col flex-grow justify-between py-1">
      <div className="space-y-3">
        <div className="h-5 bg-neutral-100 rounded-md w-3/4" />
        <div className="h-4 bg-neutral-100 rounded-md w-1/2" />
      </div>
      <div className="h-6 bg-neutral-100 rounded-md w-1/3 mt-5" />
    </div>
    <div className="hidden sm:flex flex-col items-end justify-between min-w-[140px] py-1">
      <div className="h-4 bg-neutral-100 rounded-md w-full mb-2" />
      <div className="h-4 bg-neutral-100 rounded-md w-2/3" />
      <div className="h-9 bg-neutral-100 rounded-lg w-full mt-auto" />
    </div>
  </div>
);

// ─── Commission Card ──────────────────────────────────────
interface CommissionCardProps {
  request: CommissionRequest;
  onClick: () => void;
  isOwner?: boolean;
}

const CommissionCard = ({ request, onClick, isOwner }: CommissionCardProps) => {
  const t = useTranslations("CommissionPoolPage");
  return (
    <div
      onClick={onClick}
      className="group/card flex flex-col sm:flex-row w-full overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer p-4 md:p-5 gap-5"
    >
      {/* THUMBNAIL */}
      <div className="relative w-full sm:w-32 h-32 shrink-0 bg-neutral-50 border border-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
        {isOwner && (
          <span className="absolute top-2 left-2 z-20 text-[10px] font-semibold px-2 py-0.5 bg-neutral-900 text-white rounded-md shadow-sm">
            {t("yours")}
          </span>
        )}
        {request.referenceImages ? (
          <Image
            src={request.referenceImages}
            alt={request.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 128px"
          />
        ) : (
          <Package className="w-8 h-8 text-neutral-300" />
        )}
      </div>

      {/* INFO */}
      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 leading-snug line-clamp-2 group-hover/card:text-blue-600 transition-colors">
              {request.title}
            </h3>
            <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 mt-2">
              <span className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">
                  {request.userName}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(request.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-auto pt-4">
          <span className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-600 rounded-md flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />{" "}
            {t("quantity", { count: request.quantity })}
          </span>
        </div>
      </div>

      {/* ACTION & PRICE (Right side) */}
      <div className="flex flex-col sm:items-end justify-between shrink-0 sm:min-w-[160px] mt-3 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
        <div className="text-left sm:text-right">
          <p className="text-xs font-medium text-neutral-500 mb-1">
            {t("budgetRange")}
          </p>
          <p className="text-base font-bold text-neutral-900 leading-none">
            {formatVND(request.minBudget)}
          </p>
          <p className="text-[13px] font-medium text-neutral-500 mt-1">
            - {formatVND(request.maxBudget)}
          </p>
        </div>
        <div className="hidden sm:flex w-full items-center justify-center gap-1.5 px-4 py-2.5 mt-4 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg group-hover/card:bg-neutral-900 group-hover/card:text-white group-hover/card:border-neutral-900 transition-colors">
          {t("viewDetails")} <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

// ─── Commission Modal (Side-by-Side) ──────────────────────
interface CommissionModalProps {
  request: CommissionRequest;
  onClose: () => void;
  onQuoteSuccess: () => void;
}

const CommissionModal = ({
  request,
  onClose,
  onQuoteSuccess,
}: CommissionModalProps) => {
  const t = useTranslations("CommissionPoolPage");
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmittingQuote, isCanceling } = useSelector(
    (state: RootState) => state.commission,
  );
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const isOwner = currentUserId === request.userId;

  const [price, setPrice] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("7");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ price?: string; note?: string }>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Checks for cancellation
  const isDraft = request.status === "Draft";
  const isCanceled = request.status === "Canceled";
  const canCancel =
    !isDraft &&
    !isCanceled &&
    (request.status === "PendingTarget" || request.status === "OpenPool");

  const handleCancelRequest = async () => {
    if (!request.commissionRequestId) return;
    try {
      await dispatch(cancelCommission(request.commissionRequestId)).unwrap();
      setShowCancelConfirm(false);
      onQuoteSuccess(); // Closes modal and refreshes pool
    } catch {
      // handled in thunk
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { price?: string; note?: string } = {};
    const quotedPrice = Number(price);

    if (!quotedPrice || quotedPrice <= 0) {
      newErrors.price = "Please enter a valid price";
    }
    if (!note.trim() || note.trim().length < 10) {
      newErrors.note = "Please enter at least 10 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await dispatch(
        submitCommissionQuote({
          requestId: request.commissionRequestId,
          payload: {
            quotedPrice,
            estimatedDays: Number(estimatedDays),
            shopNotes: note.trim(),
          },
        }),
      ).unwrap();
      onQuoteSuccess();
    } catch {
      // toast handled in thunk
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Cancel Confirm Modal internally nested above the main modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            e.stopPropagation();
            setShowCancelConfirm(false);
          }}
        >
          <div
            className="bg-white border border-neutral-100 rounded-xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {t("confirmCancellation")}
            </h3>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
              {t("cancelDesc")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-lg transition-colors border border-neutral-200"
              >
                {t("back")}
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isCanceling}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isCanceling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("cancelRequestBtn")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="w-full max-w-6xl max-h-[90vh] bg-white border border-neutral-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative flex flex-col lg:flex-row animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:right-4 z-50 w-9 h-9 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center transition-colors shadow-sm text-neutral-500 hover:text-neutral-900 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ─── Left Column: Request Details ─── */}
        <div className="lg:w-1/2 overflow-y-auto bg-white snap-y">
          {/* Reference Image */}
          <div className="bg-neutral-50 w-full aspect-[4/3] relative flex items-center justify-center border-b border-neutral-100 lg:border-b-0">
            {request.referenceImages ? (
              <Image
                src={request.referenceImages}
                alt={request.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-16 h-16 text-neutral-300" />
              </div>
            )}

            {/* Gradient Overlay for better contrast if image is busy */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 lg:opacity-100 transition-opacity"></div>
          </div>

          {/* Details Content */}
          <div className="p-8 lg:-mt-16 lg:relative z-10 lg:bg-white">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-4">
              <span className="flex items-center gap-1.5 font-medium bg-neutral-100 px-2.5 py-1 rounded-md text-neutral-700">
                <User className="w-4 h-4 text-neutral-400" />
                {request.userName}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-neutral-400" />
                {formatDate(request.createdAt)}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1.5 font-medium text-amber-600">
                <Hash className="w-4 h-4" />
                {t("quantity", { count: request.quantity })}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-neutral-900 leading-tight">
              {request.title}
            </h2>

            {/* Budget */}
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-100 inline-block w-full sm:w-auto">
              <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wider">
                {t("clientBudgetRange")}
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatVND(request.minBudget)}
                <span className="text-green-400 font-normal mx-2">–</span>
                {formatVND(request.maxBudget)}
              </p>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400" />
                {t("requestDetails")}
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap bg-neutral-50 p-5 rounded-xl border border-neutral-100 shadow-inner">
                {request.description}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Quote Form ─── */}
        <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-neutral-100 bg-white p-8 overflow-y-auto flex flex-col">
          {isOwner ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                <Info className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t("ownRequestTitle")}
              </h3>
              <p className="text-sm text-neutral-500 max-w-[280px] mb-8 leading-relaxed">
                {t("ownRequestDesc")}
              </p>
              {canCancel ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCanceling}
                  className="w-full max-w-[280px] py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCanceling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {t("canceling")}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> {t("cancelRequestBtn")}
                    </>
                  )}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-200 text-neutral-500 rounded-lg text-sm font-medium">
                  <Info className="w-4 h-4" />
                  {t("viewOnlyMode")}
                </div>
              )}
            </div>
          ) : request.hasMyPendingQuote ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-12 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t("alreadyQuotedTitle")}
              </h3>
              <p className="text-sm text-neutral-500 max-w-[280px] leading-relaxed">
                {t("alreadyQuotedDesc")}
              </p>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-neutral-900">
                  {t("sendQuotation")}
                </h3>
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                  {t("quotationSub")}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 gap-6"
              >
                {/* Proposed Price */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    {t("proposedPrice")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min={1}
                      placeholder="1500000"
                      className={`w-full border ${errors.price ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl pl-11 pr-14 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-semibold">
                      VND
                    </span>
                  </div>
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {errors.price}
                    </p>
                  )}
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    {t("estimatedTime")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full border border-neutral-200 bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors appearance-none cursor-pointer"
                  >
                    {[3, 5, 7, 10, 14, 21, 30].map((num) => (
                      <option key={num} value={num.toString()}>
                        {t("days", { count: num })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note / Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-semibold text-neutral-900">
                      {t("buildPlan")} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-neutral-400">
                      {t("minChars")}
                    </span>
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={6}
                    placeholder={t("buildPlanPlaceholder")}
                    className={`w-full flex-1 min-h-[140px] border ${errors.note ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors resize-y placeholder-neutral-400 leading-relaxed`}
                  />
                  {errors.note && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {errors.note}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-800/50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-auto active:scale-[0.98]"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("submitQuotation")}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────
export default function CommissionPoolPage() {
  const t = useTranslations("CommissionPoolPage");
  const dispatch = useDispatch<AppDispatch>();
  const { poolRequests, loadingPool, error } = useSelector(
    (state: RootState) => state.commission,
  );
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [selectedRequest, setSelectedRequest] =
    useState<CommissionRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShopSelectionOpen, setIsShopSelectionOpen] = useState(false);
  const [shopList, setShopList] = useState<any[]>([]);
  const [selectedTargetShopId, setSelectedTargetShopId] = useState<
    string | undefined
  >(undefined);

  const fetchShopsForSelection = async () => {
    try {
      const res = await shopService.getShops({ page: 1, pageSize: 50 } as any);
      if (res.success && res.data) {
        setShopList(res.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch shops", error);
    }
  };

  const handleOpenPublicRequest = () => {
    setSelectedTargetShopId(undefined);
    setIsCreateModalOpen(true);
  };

  const handleSelectShop = (shopId: string) => {
    setSelectedTargetShopId(shopId);
    setIsShopSelectionOpen(false);
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchPoolRequests());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchPoolRequests());
  };

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-4rem)] text-neutral-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Inbox className="w-6 h-6" />
              </div>
              {t("pageTitle")}
            </h1>
            <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">
              {t.rich("pageDesc", {
                count: poolRequests.length,
                bold: (chunks) => (
                  <strong className="font-semibold text-neutral-700">
                    {chunks}
                  </strong>
                ),
              })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                setIsShopSelectionOpen(true);
                fetchShopsForSelection();
              }}
              className="bg-white border border-neutral-200 text-neutral-700 font-medium text-sm rounded-xl px-5 py-2.5 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center active:scale-[0.98]"
            >
              <Store className="w-4 h-4 text-neutral-400" />{" "}
              {t("directRequest")}
            </button>
            <button
              onClick={handleOpenPublicRequest}
              className="bg-neutral-900 text-white font-medium text-sm rounded-xl px-5 py-2.5 hover:bg-neutral-800 transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> {t("postRequest")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingPool && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loadingPool && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-neutral-100 shadow-sm mt-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 border border-red-100">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              {t("unableToLoad")}
            </h2>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              {t("retryConnection")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingPool && !error && poolRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-neutral-200 bg-white rounded-2xl shadow-sm mt-4">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-5 border border-neutral-100">
              <Inbox className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              {t("noActiveRequests")}
            </h2>
            <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
              {t("noRequestsDesc")}
            </p>
          </div>
        )}

        {/* Data Grid (List View) */}
        {!loadingPool && !error && poolRequests.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {poolRequests.map((request) => (
              <CommissionCard
                key={request.commissionRequestId}
                request={request}
                onClick={() => setSelectedRequest(request)}
                isOwner={currentUserId === request.userId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <CommissionModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onQuoteSuccess={() => {
            setSelectedRequest(null);
            dispatch(fetchPoolRequests());
          }}
        />
      )}

      {/* Shop Selection Modal */}
      {isShopSelectionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6"
          onClick={() => setIsShopSelectionOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t("selectBuilder")}
              </h3>
              <button
                onClick={() => setIsShopSelectionOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 flex-1 pr-1 custom-scrollbar">
              {shopList.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 text-neutral-300 animate-spin mb-3 text-center" />
                  <span className="text-neutral-500 text-sm font-medium">
                    {t("loadingBuilders")}
                  </span>
                </div>
              ) : (
                shopList.map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => handleSelectShop(shop.id)}
                    className="p-3 border border-neutral-100 rounded-xl hover:border-neutral-300 hover:shadow-sm cursor-pointer flex items-center justify-between gap-4 transition-all group bg-white"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {shop.logoUrl ? (
                          <img
                            src={shop.logoUrl}
                            alt={shop.shopName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-neutral-300" />
                        )}
                      </div>
                      <span className="font-semibold text-sm text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
                        {shop.shopName}
                      </span>
                    </div>

                    {/* View Profile Link */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/profile/shop/${shop.id}`, "_blank");
                      }}
                      className="shrink-0 flex items-center justify-center w-8 h-8 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t("visitShopProfile")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Commission Modal */}
      <CreateCommissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchPoolRequests())}
        targetedShopId={selectedTargetShopId}
      />
    </div>
  );
}
