"use client";

import { useEffect, useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchShopQuotes,
  updateCommissionQuote,
} from "@/src/store/slices/commissionSlice";
import { CommissionQuote } from "@/src/types/commission.types";
import {
  Loader2,
  FileText,
  Clock,
  Inbox,
  RefreshCw,
  CheckCircle2,
  Timer,
  Pencil,
  X,
  DollarSign,
  Send,
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

// ─── Status Badge ──────────────────────────────────────────
const STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  PendingUserDecision: {
    label: "Pending approval",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: <Timer className="w-3.5 h-3.5" />,
  },
  Accepted: {
    label: "Confirmed",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-600",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// ─── Skeleton Row ──────────────────────────────────────────
const SkeletonRow = () => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-28" />
        <div className="h-3 bg-gray-100 rounded w-36" />
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-6 bg-gray-200 rounded-full w-28" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  </div>
);

// ─── Edit Quote Modal ──────────────────────────────────────
interface EditQuoteModalProps {
  quote: CommissionQuote;
  onClose: () => void;
  onSuccess: () => void;
}

const EditQuoteModal = ({ quote, onClose, onSuccess }: EditQuoteModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isUpdatingQuote } = useSelector(
    (state: RootState) => state.commission,
  );

  const [price, setPrice] = useState(String(quote.quotedPrice));
  const [estimatedDays, setEstimatedDays] = useState(
    String(quote.estimatedDays),
  );
  const [note, setNote] = useState(quote.shopNotes);
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
        updateCommissionQuote({
          quoteId: quote.commissionQuoteId,
          payload: {
            quotedPrice,
            estimatedDays: Number(estimatedDays),
            shopNotes: note.trim(),
          },
        }),
      ).unwrap();
      onSuccess();
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
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Update Quote</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              #{quote.commissionRequestId.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4.5 h-4.5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proposed Price (VND) <span className="text-red-500">*</span>
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
                className="w-full border border-gray-300 rounded-xl pl-10 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
                VND
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Estimated Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Estimated Completion Time <span className="text-red-500">*</span>
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

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message / Material Details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors resize-none"
            />
            {errors.note ? (
              <p className="text-xs text-red-500 mt-1">{errors.note}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Minimum 10 characters.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isUpdatingQuote}
            className="w-full py-3.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isUpdatingQuote ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Send className="w-4.5 h-4.5" />
                Update Quote
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────
export default function ShopQuotesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { shopQuotes, loadingShopQuotes, error } = useSelector(
    (state: RootState) => state.commission,
  );
  const [editingQuote, setEditingQuote] = useState<CommissionQuote | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchShopQuotes());
  }, [dispatch]);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            My Quotation History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review all quotes you have sent to customers
          </p>
        </div>

        {/* Loading */}
        {loadingShopQuotes && (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loadingShopQuotes && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1.5">
              Unable to load data
            </h2>
            <p className="text-sm text-gray-500 mb-5 max-w-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchShopQuotes())}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loadingShopQuotes && !error && shopQuotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1.5">
              You haven't sent any quotes
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Visit the Custom Request Market to find and send quotes to
              customers.
            </p>
          </div>
        )}

        {/* Quote Rows */}
        {!loadingShopQuotes && !error && shopQuotes.length > 0 && (
          <div>
            {shopQuotes.map((quote) => (
              <div
                key={quote.commissionQuoteId}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 mb-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Column 1: Request Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-mono">
                        #{quote.commissionRequestId.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {quote.shopNotes}
                    </p>
                  </div>

                  {/* Column 2: Quote Details */}
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">
                      {formatVND(quote.quotedPrice)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Complete in: {quote.estimatedDays} days
                    </p>
                  </div>

                  {/* Column 3: Status & Dates */}
                  <div className="flex flex-col lg:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={quote.status} />
                      {quote.status === "PendingUserDecision" && (
                        <button
                          onClick={() => setEditingQuote(quote)}
                          className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
                          title="Chỉnh sửa báo giá"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 space-y-0.5 lg:text-right">
                      <p>Sent: {formatDate(quote.createdAt)}</p>
                      <p>Expires: {formatDate(quote.expiredAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Quote Modal */}
      {editingQuote && (
        <EditQuoteModal
          quote={editingQuote}
          onClose={() => setEditingQuote(null)}
          onSuccess={() => {
            setEditingQuote(null);
            dispatch(fetchShopQuotes());
          }}
        />
      )}
    </div>
  );
}
