"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchPoolRequests,
  submitCommissionQuote,
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
} from "lucide-react";

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
  <div className="animate-pulse flex flex-col h-full w-full overflow-hidden rounded-none border border-amazon-border bg-white shadow-sm">
    <div className="bg-neutral-100 aspect-square w-full" />
    <div className="px-4 py-4 space-y-2.5 flex-grow">
      <div className="h-4 bg-neutral-200 rounded w-3/4" />
      <div className="h-4 bg-neutral-200 rounded w-1/2" />
      <div className="h-3.5 bg-neutral-200 rounded w-2/3 mt-3" />
      <div className="h-3 bg-neutral-200 rounded w-1/3" />
    </div>
  </div>
);

// ─── Commission Card ──────────────────────────────────────
interface CommissionCardProps {
  request: CommissionRequest;
  onClick: () => void;
}

const CommissionCard = ({ request, onClick }: CommissionCardProps) => (
  <div
    onClick={onClick}
    className="group/card relative flex flex-col h-full w-full overflow-hidden rounded-none transition-all duration-300 border border-amazon-border cursor-pointer bg-white shadow-sm hover:shadow-md"
  >
    {/* IMAGE AREA */}
    <div
      className="relative block w-full aspect-square overflow-hidden shrink-0 bg-white"
    >
      {/* Badge / Quantity */}
      <span className="absolute top-0 left-0 z-20 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none bg-neutral-100 text-amazon-text border-b border-r border-amazon-border">
        QTY: {request.quantity}
      </span>

      {/* Image */}
      {request.referenceImages ? (
        <Image
          src={request.referenceImages}
          alt={request.title}
          fill
          className="object-contain relative z-10 transition-transform duration-500 ease-out group-hover/card:scale-[1.1]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-500" />
        </div>
      )}

      {/* Slide-up CTA */}
      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 ease-out">
        <div className="w-full flex items-center justify-center gap-2 py-3 bg-amazon-btnPrimary text-amazon-text text-[11px] font-black uppercase tracking-[0.12em]">
          <Info className="w-4 h-4 shrink-0" />
          <span>View Request</span>
        </div>
      </div>
    </div>

    {/* Thin separator */}
    <div className="w-full h-px shrink-0 bg-amazon-border" />

    {/* INFO AREA */}
    <div className="px-4 py-4 flex flex-col flex-grow">
      {/* Title */}
      <h3 className="text-[13px] font-bold text-amazon-text leading-snug uppercase tracking-wide line-clamp-2 min-h-[40px] mb-3 group-hover/card:text-amazon-link transition-colors">
        {request.title}
      </h3>

      {/* Budget */}
      <div className="mb-3">
        <p className="text-[18px] font-black text-amazon-price leading-none">
          {formatVND(request.minBudget)}
          <span className="text-amazon-textMuted font-normal mx-1 text-sm">–</span>
          {formatVND(request.maxBudget)}
        </p>
      </div>

      {/* Meta Footer */}
      <div className="mt-auto flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-amazon-textMuted">
        <span className="flex items-center gap-1.5 hover:text-amazon-text transition-colors">
          <User className="w-3.5 h-3.5" />
          <span className="truncate max-w-[100px]">{request.userName}</span>
        </span>
        <span className="text-amazon-border">/</span>
        <span className="flex items-center gap-1.5 hover:text-amazon-text transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(request.createdAt)}
        </span>
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
  const { isSubmittingQuote } = useSelector(
    (state: RootState) => state.commission,
  );
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const isOwner = currentUserId === request.userId;

  const [price, setPrice] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("7");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ price?: string; note?: string }>({});

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
              <p className="text-sm text-amazon-textMuted max-w-xs">
                You cannot send a quotation for your own request.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amazon-border text-amazon-textMuted rounded-sm text-sm font-bold mt-4 uppercase">
                <Info className="w-4 h-4" />
                View only
              </div>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
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
  const [selectedRequest, setSelectedRequest] =
    useState<CommissionRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPoolRequests());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchPoolRequests());
  };

  return (
    <div className="bg-amazon-bgSecondary min-h-screen text-amazon-text">
      <div className="max-w-[1280px] mx-auto px-2 py-6 lg:py-2">
        {/* Hero Banner */}
        <div className="w-full bg-amazon-bgSecondary p-2   flex flex-col items-center text-center relative overflow-hidden group">
          {/* Subtle gradient accent */}
          {/* <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amazon-btnSecondary via-amazon-btnPrimary to-amazon-btnSecondary" /> */}
          
          <h2 className="text-3xl font-black text-amazon-text uppercase tracking-tight z-10">
            Do you have a unique mechanical keyboard idea?
          </h2>
          <p className="text-amazon-textMuted mt-2 z-10 max-w-2xl mx-auto">
            Post your request now to receive quotations from dozens of reputable
            Shops on the system.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 bg-amazon-btnPrimary text-amazon-text font-black uppercase tracking-widest text-[13px] rounded-sm px-6 py-3.5 hover:brightness-95 transition-colors shadow-lg cursor-pointer z-10"
          >
            Post Request to Market
          </button>
        </div>

        {/* Header */}
        <div className="mb-4 flex items-end justify-between border-b mx-4 md:mx-0 pb-2 border-amazon-border">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-amazon-text tracking-widest uppercase">
              Custom Request Market
            </h1>
            <p className="text-sm text-amazon-textMuted mt-1.5 uppercase font-medium tracking-wide">
              Explore custom keyboard requests from the community
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loadingPool && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-amazon-border bg-white rounded-sm mx-4 lg:mx-0">
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

        {/* Data Grid */}
        {!loadingPool && !error && poolRequests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {poolRequests.map((request) => (
              <CommissionCard
                key={request.commissionRequestId}
                request={request}
                onClick={() => setSelectedRequest(request)}
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

      {/* Create Commission Modal (public - no targetedShopId) */}
      <CreateCommissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchPoolRequests())}
      />
    </div>
  );
}
