"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchShopQuotes,
  revokeCommissionQuote,
} from "@/src/store/slices/commissionSlice";
import {
  Loader2,
  FileText,
  Clock,
  Inbox,
  RefreshCw,
  CheckCircle2,
  Timer,
  XCircle,
  AlertTriangle,
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
    bg: "bg-amber-50 border border-amber-200",
    text: "text-amber-700",
    icon: <Timer className="w-3.5 h-3.5" />,
  },
  Accepted: {
    label: "Confirmed",
    bg: "bg-emerald-50 border border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Revoked: {
    label: "Revoked",
    bg: "bg-red-50 border border-red-200",
    text: "text-red-700",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: "bg-neutral-50 border border-amazon-border",
    text: "text-amazon-textMuted",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[12px] font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// ─── Skeleton Row ──────────────────────────────────────────
const SkeletonRow = () => (
  <div className="bg-white border border-amazon-border shadow-sm rounded-sm p-5 mb-4 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-100 rounded-sm w-32" />
        <div className="h-3 bg-neutral-100 rounded-sm w-3/4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-neutral-100 rounded-sm w-28" />
        <div className="h-3 bg-neutral-100 rounded-sm w-36" />
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-6 bg-neutral-100 rounded-sm w-28" />
        <div className="h-3 bg-neutral-100 rounded-sm w-24" />
      </div>
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────
export default function ShopQuotesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { shopQuotes, loadingShopQuotes, error } = useSelector(
    (state: RootState) => state.commission,
  );
  const [quoteToRevoke, setQuoteToRevoke] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchShopQuotes());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1440px] w-full mx-auto">
        {/* Header */}
        <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary ">
          <h1 className="text-2xl font-bold text-amazon-text flex items-center gap-3">
            My Quotation History
          </h1>
          <p className="text-[13px] text-amazon-textMuted mt-1">
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
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-amazon-border shadow-sm rounded-sm">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-[14px] font-bold text-amazon-text mb-1">
              Unable to load data
            </h2>
            <p className="text-[13px] font-medium text-amazon-textMuted mb-5 max-w-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchShopQuotes())}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text font-medium text-[13px] rounded-sm transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loadingShopQuotes && !error && shopQuotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-amazon-border shadow-sm rounded-sm">
            <div className="w-14 h-14 rounded-full bg-neutral-50 border border-amazon-border flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-amazon-textMuted opacity-50" />
            </div>
            <h2 className="text-[14px] font-bold text-amazon-text mb-1">
              You haven&apos;t sent any quotes
            </h2>
            <p className="text-[13px] font-medium text-amazon-textMuted max-w-sm">
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
                className="bg-white border border-amazon-border shadow-sm rounded-sm hover:border-amazon-btnPrimary transition-colors p-5 mb-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Column 1: Request Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-[14px] font-bold text-amazon-text">
                      <FileText className="w-4 h-4 text-amazon-textMuted flex-shrink-0" />
                      <span>
                        #{quote.commissionRequestId.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-amazon-textMuted mt-2 line-clamp-1">
                      {quote.shopNotes}
                    </p>
                  </div>

                  {/* Column 2: Quote Details */}
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-amazon-price">
                      {formatVND(quote.quotedPrice)}
                    </p>
                    <p className="text-[13px] font-medium text-amazon-textMuted mt-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Complete in: <span className="text-amazon-text">{quote.estimatedDays} days</span>
                    </p>
                  </div>

                  {/* Column 3: Status & Dates */}
                  <div className="flex flex-col lg:items-end gap-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={quote.status} />
                      {quote.status === "PendingUserDecision" && (
                        <button
                          onClick={() => setQuoteToRevoke(quote.commissionQuoteId)}
                          className="w-8 h-8 rounded-sm bg-white border border-amazon-border hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center transition-colors shrink-0 text-amazon-textMuted shadow-sm"
                          title="Revoke Quote"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[12px] font-medium text-amazon-textMuted space-y-1 lg:text-right">
                      <p>Sent: <span className="text-amazon-text">{formatDate(quote.createdAt)}</span></p>
                      <p>Expires: <span className="text-amazon-text">{formatDate(quote.expiredAt)}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Confirm Revoke Modal */}
      {quoteToRevoke && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
          onClick={() => setQuoteToRevoke(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-amazon-border rounded-sm shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-amazon-text mb-2">
                Revoke this quote?
              </h3>
              <p className="text-[13px] font-medium text-amazon-textMuted mb-6">
                Are you sure you want to withdraw this quote? The customer will
                no longer be able to accept it. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setQuoteToRevoke(null)}
                className="flex-1 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(revokeCommissionQuote(quoteToRevoke));
                  setQuoteToRevoke(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-[13px] rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
