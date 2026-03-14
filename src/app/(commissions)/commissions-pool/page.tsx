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
  <div className="animate-pulse">
    <div className="bg-[#f4f5f6] rounded-lg aspect-[4/5]" />
    <div className="pt-4 space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3.5 bg-gray-100 rounded w-2/3 mt-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

// ─── Commission Card ──────────────────────────────────────
interface CommissionCardProps {
  request: CommissionRequest;
  onClick: () => void;
}

const CommissionCard = ({ request, onClick }: CommissionCardProps) => (
  <div onClick={onClick} className="group block cursor-pointer">
    {/* Image Area */}
    <div className="relative bg-[#f4f5f6] rounded-t-lg overflow-hidden aspect-[4/5]">
      {request.referenceImages ? (
        <Image
          src={request.referenceImages}
          alt={request.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain scale-105 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-300" />
        </div>
      )}

      {/* Quantity badge */}
      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
        Qty: {request.quantity}
      </span>
    </div>

    {/* Content Area */}
    <div className="pt-4 pb-2">
      <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1.5">
        {request.title}
      </h3>

      <p className="text-[15px] text-gray-900 font-medium">
        {formatVND(request.minBudget)}
        <span className="text-gray-400 font-normal mx-1">–</span>
        {formatVND(request.maxBudget)}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-3 text-[13px] text-gray-500">
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {request.userName}
        </span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/90 hover:bg-gray-100 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* ─── Left Column: Request Details ─── */}
        <div className="lg:w-1/2 overflow-y-auto">
          {/* Reference Image */}
          <div className="bg-[#f4f5f6] aspect-video relative">
            {request.referenceImages ? (
              <Image
                src={request.referenceImages}
                alt={request.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain mix-blend-multiply"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="p-8">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {request.userName}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(request.createdAt)}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                Qty: {request.quantity}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mt-3 leading-tight">
              {request.title}
            </h2>

            {/* Budget */}
            <p className="text-xl font-bold text-blue-600 mt-3">
              {formatVND(request.minBudget)}
              <span className="text-blue-300 font-normal mx-1.5">–</span>
              {formatVND(request.maxBudget)}
            </p>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-400" />
                Mô tả yêu cầu
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Quote Form ─── */}
        <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50 p-8 overflow-y-auto flex flex-col">
          {isOwner ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                This is your own request
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                You cannot send a quotation for your own request.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md text-sm font-medium mt-4">
                <Info className="w-4 h-4" />
                View only
              </div>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Send quotation to customer
                </h3>
                <p className="text-sm text-gray-500 mt-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Proposed price (VND) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min={1}
                      placeholder="1,500,000"
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Estimated completion time{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors bg-white appearance-none cursor-pointer"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message / Material details{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    placeholder="Describe in detail the switch, keycap, mod you will use...\nE.g.: Gateron Oil King lubed, GMK Olivia clone, foam mod, tape mod..."
                    className="w-full flex-1 min-h-[120px] border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors bg-white resize-none"
                  />
                  {errors.note ? (
                    <p className="text-xs text-red-500 mt-1.5">
                      {errors.note.replace(
                        "Vui lòng nhập ít nhất 10 ký tự",
                        "Please enter at least 10 characters",
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Minimum 10 characters. Please describe clearly to build
                      customer trust.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="w-full py-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold text-lg rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 mt-auto"
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
    <div className="bg-white min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-10 lg:py-14">
        {/* Hero Banner */}
        <div className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-8 mb-8 shadow-md flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-white">
            Do you have a unique mechanical keyboard idea?
          </h2>
          <p className="text-white opacity-90 mt-2">
            Post your request now to receive quotations from dozens of reputable
            Shops on the system.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 bg-white text-purple-600 font-bold rounded-full px-8 py-3 hover:bg-gray-100 transition shadow-lg cursor-pointer"
          >
            Post Request to Market
          </button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
            Custom Request Market
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Explore custom keyboard requests from the community
          </p>
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
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <Loader2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Unable to load data
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingPool && !error && poolRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              No requests yet
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
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
