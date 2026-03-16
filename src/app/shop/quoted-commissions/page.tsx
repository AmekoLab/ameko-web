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
    bg: "bg-[#f5d800]/10 border border-[#f5d800]/20",
    text: "text-[#f5d800]",
    icon: <Timer className="w-3.5 h-3.5" />,
  },
  Accepted: {
    label: "Confirmed",
    bg: "bg-green-500/10 border border-green-500/20",
    text: "text-green-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: "bg-[#202030] border border-[#1e2126]",
    text: "text-gray-400",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] uppercase font-black tracking-widest border ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// ─── Skeleton Row ──────────────────────────────────────────
const SkeletonRow = () => (
  <div className="bg-[#151515] border border-[#1e2126] rounded-sm p-5 mb-4 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#202030] rounded-sm w-32" />
        <div className="h-3 bg-[#202030] rounded-sm w-3/4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#202030] rounded-sm w-28" />
        <div className="h-3 bg-[#202030] rounded-sm w-36" />
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-6 bg-[#202030] rounded-sm w-28" />
        <div className="h-3 bg-[#202030] rounded-sm w-24" />
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
                className="text-black w-full border border-gray-300 rounded-xl pl-10 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors"
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
              className="text-black w-full border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors bg-white appearance-none cursor-pointer"
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
              className= "text-black w-full border border-gray-300 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-colors resize-none"
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
    <div className="bg-black min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 border-b border-[#1e2126] pb-4">
          <h1 className="text-3xl font-oswald font-black text-white uppercase tracking-widest">
            My Quotation History
          </h1>
          <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
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
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#151515] border border-[#1e2126] rounded-sm">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-[13px] font-black uppercase tracking-widest text-white mb-1.5">
              Unable to load data
            </h2>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5 max-w-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchShopQuotes())}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#202030] border border-[#1e2126] hover:bg-[#303040] hover:text-[#f5d800] hover:border-[#f5d800] text-gray-400 text-[11px] font-black uppercase tracking-widest rounded-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loadingShopQuotes && !error && shopQuotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#151515] border border-[#1e2126] rounded-sm">
            <div className="w-14 h-14 rounded-full bg-black border border-[#1e2126] flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-[#f5d800]" />
            </div>
            <h2 className="text-[13px] font-black uppercase tracking-widest text-white mb-1.5">
              You haven't sent any quotes
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 max-w-sm">
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
                className="bg-[#151515] border border-[#1e2126] rounded-sm hover:border-[#f5d800]/50 transition-colors p-5 mb-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Column 1: Request Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-[13px] font-black text-white tracking-widest uppercase">
                      <FileText className="w-4 h-4 text-[#f5d800] flex-shrink-0" />
                      <span>
                        #{quote.commissionRequestId.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mt-2 line-clamp-1">
                      {quote.shopNotes}
                    </p>
                  </div>

                  {/* Column 2: Quote Details */}
                  <div className="flex-1">
                    <p className="text-[15px] font-black text-[#f5d800] tracking-wider">
                      {formatVND(quote.quotedPrice)}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      Complete in: <span className="text-white">{quote.estimatedDays} days</span>
                    </p>
                  </div>

                  {/* Column 3: Status & Dates */}
                  <div className="flex flex-col lg:items-end gap-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={quote.status} />
                      {quote.status === "PendingUserDecision" && (
                        <button
                          onClick={() => setEditingQuote(quote)}
                          className="w-8 h-8 rounded-sm border border-[#1e2126] bg-black hover:bg-[#202030] hover:border-[#f5d800] hover:text-[#f5d800] flex items-center justify-center transition-colors shrink-0 text-gray-500"
                          title="Edit quote"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 space-y-1 lg:text-right">
                      <p>Sent: <span className="text-gray-400">{formatDate(quote.createdAt)}</span></p>
                      <p>Expires: <span className="text-gray-400">{formatDate(quote.expiredAt)}</span></p>
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
