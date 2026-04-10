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
  <div className="animate-pulse flex flex-col sm:flex-row w-full overflow-hidden rounded-sm border border-amazon-border bg-white shadow-sm p-4 gap-4">
    <div className="bg-neutral-200 w-full sm:w-28 h-28 shrink-0 rounded-sm" />
    <div className="flex flex-col flex-grow justify-between py-1">
      <div className="space-y-2.5">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
      </div>
      <div className="h-5 bg-neutral-200 rounded w-1/3 mt-4" />
    </div>
    <div className="hidden sm:flex flex-col items-end justify-between min-w-[140px] py-1">
      <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-2/3" />
      <div className="h-8 bg-neutral-200 rounded w-full mt-auto" />
    </div>
  </div>
);

// ─── Commission Card ──────────────────────────────────────
interface CommissionCardProps {
  request: CommissionRequest;
  onClick: () => void;
  isOwner?: boolean;
}

const CommissionCard = ({ request, onClick, isOwner }: CommissionCardProps) => (
  <div
    onClick={onClick}
    className="group/card flex flex-col sm:flex-row w-full overflow-hidden rounded-sm border border-amazon-border bg-white shadow-sm hover:border-amazon-focus hover:shadow-md transition-all duration-200 cursor-pointer p-4 gap-4"
  >
    {/* THUMBNAIL */}
    <div className="relative w-full sm:w-28 h-28 shrink-0 bg-neutral-50  rounded-sm overflow-hidden flex items-center justify-center">
      {isOwner && (
        <span className="absolute top-0 left-0 z-20 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amazon-text text-white">
          Yours
        </span>
      )}
      {request.referenceImages ? (
        <Image
          src={request.referenceImages}
          alt={request.title}
          fill
          className="object-contain p-1"
          sizes="(max-width: 640px) 100vw, 112px"
        />
      ) : (
        <Package className="w-8 h-8 text-neutral-300" />
      )}
    </div>

    {/* INFO */}
    <div className="flex flex-col flex-grow min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold text-amazon-text leading-snug uppercase tracking-wide line-clamp-2 group-hover/card:text-amazon-link transition-colors">
            {request.title}
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-amazon-textMuted mt-2">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">{request.userName}</span>
            </span>
            <span className="text-amazon-border">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(request.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-auto pt-3">
        <span className="px-2 py-1 bg-neutral-100 border border-amazon-border text-[10px] font-black uppercase tracking-widest text-amazon-text rounded-sm flex items-center gap-1">
          <Hash className="w-3 h-3" /> QTY: {request.quantity}
        </span>
      </div>
    </div>

    {/* ACTION & PRICE (Right side) */}
    <div className="flex flex-col sm:items-end justify-between shrink-0 sm:min-w-[160px] mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-amazon-border">
      <div className="text-left sm:text-right">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted mb-1">Budget Range</p>
        <p className="text-[15px] font-black text-amazon-price leading-none">
          {formatVND(request.minBudget)}
        </p>
        <p className="text-[12px] font-bold text-amazon-textMuted mt-1">
          - {formatVND(request.maxBudget)}
        </p>
      </div>
      <div className="hidden sm:flex w-full items-center justify-center gap-1.5 px-3 py-2 mt-4 bg-white border border-amazon-border text-amazon-text text-[10px] font-black uppercase tracking-widest rounded-sm group-hover/card:border-amazon-focus group-hover/card:bg-neutral-50 transition-colors shadow-sm">
        View Details <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  </div>
);

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
      newErrors.price = "Vui lòng nhập mức giá hợp lệ";
    }
    if (!note.trim() || note.trim().length < 10) {
      newErrors.note = "Vui lòng nhập ít nhất 10 ký tự";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Cancel Confirm Modal internally nested above the main modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(false); }}
        >
          <div
            className="bg-white border border-amazon-border rounded-sm w-full max-w-sm p-8 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-wider text-amazon-text mb-2">
              Confirm cancel request
            </h3>
            <p className="text-[12px] text-amazon-textMuted mb-6">
                Are you sure you want to cancel this request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-amazon-text font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-amazon-border"
              >
              Back
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isCanceling}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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

      <div
        className="w-full max-w-6xl max-h-[90vh] bg-white border border-amazon-border rounded-sm shadow-2xl overflow-hidden relative flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-amazon-border backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm text-amazon-textMuted"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ─── Left Column: Request Details ─── */}
        <div className="lg:w-1/2 overflow-y-auto">
          {/* Reference Image */}
          <div className="bg-white aspect-video relative flex items-center justify-center border-b border-amazon-border lg:border-b-0">
            {request.referenceImages ? (
              <Image
                src={request.referenceImages}
                alt={request.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-16 h-16 text-amazon-textMuted" />
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="p-8">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-amazon-textMuted">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-amazon-textMuted" />
                {request.userName}
              </span>
              <span className="text-amazon-textMuted">·</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-amazon-textMuted" />
                {formatDate(request.createdAt)}
              </span>
              <span className="text-amazon-textMuted">·</span>
              <span className="flex items-center gap-1.5 font-medium text-amazon-btnSecondary">
                <Hash className="w-4 h-4" />
                Qty: {request.quantity}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-amazon-text mt-3 leading-tight">
              {request.title}
            </h2>

            {/* Budget */}
            <p className="text-xl font-bold text-amazon-price mt-3">
              {formatVND(request.minBudget)}
              <span className="text-amazon-textMuted font-normal mx-1.5">–</span>
              {formatVND(request.maxBudget)}
            </p>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-amazon-text mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-amazon-textMuted" />
                Mô tả yêu cầu
              </h3>
              <p className="text-sm text-amazon-text leading-relaxed whitespace-pre-wrap bg-amazon-bgSecondary p-4 rounded-sm border border-amazon-border">
                {request.description}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Quote Form ─── */}
        <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-amazon-border bg-neutral-50 p-8 overflow-y-auto flex flex-col">
          {isOwner ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-white border border-amazon-border flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-amazon-textMuted" />
              </div>
              <h3 className="text-lg font-bold text-amazon-text mb-2 uppercase tracking-wide">
                This is your own request
              </h3>
              <p className="text-sm text-amazon-textMuted max-w-xs mb-6">
                You cannot send a quotation for your own request.
              </p>
              {canCancel ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCanceling}
                  className="w-full max-w-[240px] py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors border border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2 disabled:opacity-50"
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
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amazon-border text-amazon-textMuted rounded-sm text-[11px] font-black uppercase tracking-widest mt-4">
                  <Info className="w-4 h-4" />
                  View only
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="mb-6">
                <h3 className="text-lg font-black text-amazon-text uppercase tracking-wider">
                  Send quotation to customer
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Offer a competitive price and describe in detail the materials
                  you will use.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 gap-5"
              >
                {/* Proposed Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Proposed price (VND) <span className="text-[#ce2a32]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min={1}
                      placeholder="1,500,000"
                      className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm pl-10 pr-14 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                      VND
                    </span>
                  </div>
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.price.replace(
                        "Vui lòng nhập mức giá hợp lệ",
                        "Please enter a valid price",
                      )}
                    </p>
                  )}
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
                    Estimated completion time{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors appearance-none cursor-pointer"
                  >
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                    <option value="10">10 days</option>
                    <option value="14">14 days</option>
                    <option value="21">21 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>

                {/* Note / Details */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
                    Message / Material details{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    placeholder="Describe in detail the switch, keycap, mod you will use...\nE.g.: Gateron Oil King lubed, GMK Olivia clone, foam mod, tape mod..."
                    className="w-full flex-1 min-h-[120px] border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors resize-none placeholder-gray-400"
                  />
                  {errors.note ? (
                    <p className="text-xs text-red-500 mt-1.5">
                      {errors.note.replace(
                        "Vui lòng nhập ít nhất 10 ký tự",
                        "Please enter at least 10 characters",
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-amazon-textMuted mt-1.5">
                      Minimum 10 characters. Please describe clearly to build
                      customer trust.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="w-full py-4 bg-amazon-btnPrimary hover:brightness-95 disabled:bg-amazon-btnPrimary/50 text-amazon-text font-black uppercase tracking-widest text-[13px] rounded-sm shadow-md transition-all flex items-center justify-center gap-2.5 mt-auto"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send quotation
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
  const [selectedTargetShopId, setSelectedTargetShopId] = useState<string | undefined>(undefined);

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
    <div className="bg-amazon-bgSecondary min-h-screen text-amazon-text">
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        
        {/* Dashboard Header */}
        <div className="mb-6 bg-white border border-amazon-border p-4 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-amazon-text tracking-widest uppercase flex items-center gap-2">
              <Inbox className="w-6 h-6 text-amazon-btnSecondary" />
              Custom Request Market
            </h1>
            <p className="text-[11px] text-amazon-textMuted mt-1.5 uppercase font-bold tracking-wider">
              Browse {poolRequests.length} active requests from buyers
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setIsShopSelectionOpen(true);
                fetchShopsForSelection();
              }}
              className="bg-white border border-amazon-border text-amazon-text font-black uppercase tracking-widest text-[11px] rounded-sm px-5 py-3 hover:bg-neutral-50 transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Store className="w-4 h-4" /> Send to Specific Shop
            </button>
            <button
              onClick={handleOpenPublicRequest}
              className="bg-amazon-btnPrimary text-amazon-text font-black uppercase tracking-widest text-[11px] rounded-sm px-5 py-3 hover:brightness-95 transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Post Public Request
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingPool && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loadingPool && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 border border-red-200">
              <Loader2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-amazon-text uppercase tracking-wide mb-2">
              Unable to load data
            </h2>
            <p className="text-sm text-amazon-textMuted mb-6 max-w-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text text-sm font-bold uppercase tracking-widest rounded-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingPool && !error && poolRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-amazon-border bg-white rounded-sm">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-5">
              <Inbox className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-lg font-black text-amazon-text uppercase tracking-widest mb-2">
              No requests yet
            </h2>
            <p className="text-sm text-amazon-textMuted max-w-sm">
              There are currently no custom keyboard requests in the public
              market. Please check back later!
            </p>
          </div>
        )}

        {/* Data Grid (List View) */}
        {!loadingPool && !error && poolRequests.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsShopSelectionOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-sm p-6 shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-amazon-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-amazon-text">Select a Shop</h3>
              <button onClick={() => setIsShopSelectionOpen(false)} className="text-amazon-textMuted hover:text-amazon-text transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {shopList.length === 0 ? (
                <div className="py-8 text-center text-amazon-textMuted text-xs font-bold uppercase tracking-wider">Loading shops...</div>
              ) : (
                shopList.map(shop => (
                  <div
                    key={shop.id}
                    onClick={() => handleSelectShop(shop.id)}
                    className="p-3 border border-amazon-border rounded-sm hover:border-amazon-focus cursor-pointer flex items-center justify-between gap-3 transition-colors group bg-white"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-sm bg-neutral-100 border border-amazon-border overflow-hidden shrink-0">
                        {shop.logoUrl ? (
                          <img src={shop.logoUrl} alt={shop.shopName} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-full h-full p-2 text-neutral-300" />
                        )}
                      </div>
                      <span className="font-bold text-xs uppercase tracking-wide text-amazon-text group-hover:text-amazon-focus transition-colors truncate">
                        {shop.shopName}
                      </span>
                    </div>

                    {/* View Profile Link */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/profile/shop/${shop.id}`, '_blank');
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amazon-textMuted hover:text-amazon-btnSecondary hover:bg-neutral-50 border border-transparent hover:border-amazon-border rounded-sm transition-all"
                      title="Visit Shop Profile"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
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
