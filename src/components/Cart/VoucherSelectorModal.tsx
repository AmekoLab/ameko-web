import { FC, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  X,
  Ticket,
  Search,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Voucher } from "@/src/services/voucher.service";

// ─── Helpers ─────────────────────────────────────────────

/** Format VNĐ currency */
function fmtVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

/** Format a discount label from voucher data */
function fmtDiscount(v: Voucher): string {
  if (v.discountType === "Percentage") {
    const cap = v.maxDiscountAmount
      ? ` (max ${fmtVND(v.maxDiscountAmount)})`
      : "";
    return `Discount ${v.value}%${cap}`;
  }
  return `Discount ${fmtVND(v.value)}`;
}

/** Format end date */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Usage progress 0..1 */
function usageProgress(v: Voucher): number {
  if (v.usageLimit <= 0) return 0;
  return Math.min(v.usedCount / v.usageLimit, 1);
}

// ─── Props ───────────────────────────────────────────────

export interface VoucherSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  vouchers: Voucher[];
  currentSubtotal: number;
  brandLabel?: string;
  selectedCodes?: string[];
  onConfirm: (selectedVouchers: Voucher[]) => void;
  scope: { type: "system" } | { type: "shop"; shopId: string };
  /** Kept for API compat but no longer used to call API */
  orderId?: string;
}

// ─── Voucher Card (Ticket Style) ─────────────────────────

interface VoucherCardProps {
  voucher: Voucher;
  eligible: boolean;
  remainingAmount: number;
  selected: boolean;
  isApplied: boolean;
  onToggle: (code: string) => void;
  brandLabel: string;
  selectionMode: "radio" | "checkbox";
  isFullyClaimed: boolean;
}

const VoucherCard: FC<VoucherCardProps> = ({
  voucher,
  eligible,
  remainingAmount,
  selected,
  isApplied,
  onToggle,
  brandLabel,
  selectionMode,
  isFullyClaimed,
}) => {
  const progress = usageProgress(voucher);
  const isAlmostGone = progress >= 0.8;

  return (
    <div
      className={`flex rounded-sm overflow-hidden border transition-all ${
        !eligible
          ? "opacity-50 grayscale border-amazon-border cursor-not-allowed"
          : isApplied
            ? "border-amazon-focus ring-1 ring-amazon-focus/30 bg-amazon-focus/10 shadow-sm cursor-pointer"
            : selected
              ? "border-amazon-focus ring-1 ring-amazon-focus/30 shadow-sm"
              : "border-amazon-border hover:border-amazon-focus/40 cursor-pointer"
      }`}
      onClick={() => eligible && onToggle(voucher.code)}
      role="button"
      tabIndex={eligible ? 0 : -1}
      aria-disabled={!eligible}
    >
      {/* ── Left Ticket Part ── */}
      <div className="relative w-[100px] shrink-0 bg-gradient-to-br from-amazon-btnPrimary to-[#f0c14b] flex flex-col items-center justify-center p-3 text-amazon-text">
        {/* Dashed "tear-off" edge */}
        <div className="absolute top-0 right-0 h-full w-0 border-r-2 border-dashed border-black/10" />
        {/* Scalloped circles */}
        <div className="absolute -right-[6px] top-3 w-3 h-3 bg-white rounded-full border-l border-amazon-border" />
        <div className="absolute -right-[6px] bottom-3 w-3 h-3 bg-white rounded-full border-l border-amazon-border" />

        <Ticket className="w-6 h-6 mb-1.5 opacity-80" />
        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
          {brandLabel}
        </span>

        {/* Almost gone badge */}
        {isAlmostGone && eligible && (
          <span className="mt-1.5 text-[9px] font-black bg-black/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            Almost gone
          </span>
        )}
      </div>

      {/* ── Right Content Part ── */}
      <div
        className={`flex-1 p-3 flex flex-col justify-between min-w-0 ${isApplied ? "bg-amazon-btnPrimary/5" : "bg-white"}`}
      >
        <div>
          {/* Title + Applied badge */}
          <div className="flex items-center justify-between gap-1">
            <p className="text-[13px] font-black text-amazon-text truncate uppercase tracking-widest">
              {fmtDiscount(voucher)}
            </p>
            {isApplied && (
              <CheckCircle2 className="w-4 h-4 text-amazon-focus shrink-0" />
            )}
          </div>
          {/* Description */}
          <p className="text-[11px] font-bold text-amazon-textMuted mt-0.5 line-clamp-1 uppercase tracking-wider">
           Code: {voucher.description || voucher.name}
          </p>
          {/* Min order */}
          {voucher.minOrderValue > 0 && (
            <p className="text-[10px] font-bold text-amazon-textMuted mt-1 uppercase tracking-wider">
              Min order {fmtVND(voucher.minOrderValue)}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          {/* Expiry + progress */}
          <div className="min-w-0 mt-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amazon-textMuted uppercase tracking-wider">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Expiry: {fmtDate(voucher.endDate)}</span>
            </div>
            {/* Progress bar */}
            {voucher.usageLimit > 0 && voucher.usageLimit < 2147483647 && (
              <div className="mt-1.5 w-full h-1 bg-neutral-200 rounded-full overflow-hidden border border-amazon-border">
                <div
                  className="h-full bg-amazon-btnPrimary rounded-full transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Selection control */}
          <div className="shrink-0">
            {eligible ? (
              isApplied ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amazon-text bg-amazon-btnPrimary px-1.5 py-0.5 rounded-sm uppercase tracking-widest whitespace-nowrap shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Applied
                </span>
              ) : (
                <input
                  type={selectionMode}
                  name="voucher-selection"
                  checked={selected}
                  readOnly
                  className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer"
                  aria-label={`Select ${voucher.name}`}
                />
              )
            ) : (
              <Tag className="w-4 h-4 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Ineligible message */}
        {!eligible &&
          (isFullyClaimed ? (
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-red-600">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Voucher fully claimed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-orange-600">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>
                Spend {fmtVND(remainingAmount)} more to use this voucher
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

// ─── Modal ───────────────────────────────────────────────

const VoucherSelectorModal: FC<VoucherSelectorModalProps> = ({
  isOpen,
  onClose,
  title,
  vouchers,
  currentSubtotal,
  brandLabel = "Ameko",
  selectedCodes = [],
  onConfirm,
  scope,
}) => {
  // Track the modal open transition to reset local state
  const [prevOpen, setPrevOpen] = useState(false);
  const [localSelectedCodes, setLocalSelectedCodes] = useState<Set<string>>(
    () => new Set(selectedCodes),
  );
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset local selection when modal opens
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setLocalSelectedCodes(new Set(selectedCodes));
    setCodeInput("");
    setCodeError(null);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Sort: eligible first, then by value descending
  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      const aEligible =
        currentSubtotal >= a.minOrderValue &&
        (a.usageLimit <= 0 || a.usedCount < a.usageLimit);
      const bEligible =
        currentSubtotal >= b.minOrderValue &&
        (b.usageLimit <= 0 || b.usedCount < b.usageLimit);
      if (aEligible !== bEligible) return aEligible ? -1 : 1;
      return b.value - a.value;
    });
  }, [vouchers, currentSubtotal]);

  // Hybrid toggle logic: system = radio, shop = stacking with targetUserId rules
  const handleToggle = useCallback(
    (code: string) => {
      const clickedVoucher = vouchers.find((v) => v.code === code);
      if (!clickedVoucher) return;

      setLocalSelectedCodes((prev) => {
        const newSet = new Set(prev);

        // If clicking an already selected voucher, deselect it
        if (newSet.has(code)) {
          newSet.delete(code);
          return newSet;
        }

        if (scope.type === "system") {
          // SYSTEM SCOPE: Strictly Radio (Only 1 code ever)
          return new Set([code]);
        } else {
          // SHOP SCOPE: Hybrid Stacking
          if (clickedVoucher.targetUserId) {
            // Targeted/Refund Voucher: Can stack with anything. Just add it.
            newSet.add(code);
          } else {
            // General Voucher: Can only have ONE general voucher.
            // Remove any existing general voucher from the selection first.
            const generalCodesToRemove = vouchers
              .filter((v) => !v.targetUserId && newSet.has(v.code))
              .map((v) => v.code);

            generalCodesToRemove.forEach((c) => newSet.delete(c));

            // Now add the new general voucher
            newSet.add(code);
          }
          return newSet;
        }
      });
    },
    [vouchers, scope.type],
  );

  const handleConfirm = useCallback(() => {
    const selectedVouchers = vouchers.filter((v) =>
      localSelectedCodes.has(v.code),
    );
    onConfirm(selectedVouchers);
    onClose();
  }, [vouchers, localSelectedCodes, onConfirm, onClose]);

  // Handle manual code input apply — find by code locally, call onConfirm
  const handleApplyCode = useCallback(() => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    const found = vouchers.find((v) => v.code.toUpperCase() === code);
    if (!found) {
      setCodeError("Invalid code or not found in the list.");
      return;
    }
    const eligible = currentSubtotal >= found.minOrderValue;
    if (!eligible) {
      setCodeError(
        `Order does not meet minimum ${fmtVND(found.minOrderValue)}.`,
      );
      return;
    }
    setCodeError(null);
    onConfirm([found]);
    onClose();
  }, [codeInput, vouchers, currentSubtotal, onConfirm, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  // Count eligible
  const eligibleCount = vouchers.filter(
    (v) => currentSubtotal >= v.minOrderValue,
  ).length;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
    >
      <div className="w-full md:max-w-[480px] max-h-[85vh] md:max-h-[80vh] bg-white md:rounded-sm rounded-t-sm border border-amazon-border flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amazon-border bg-neutral-50">
          <div>
            <h3 className="font-black uppercase  text-lg text-amazon-text">{title}</h3>
            <p className="text-[10px] text-amazon-textMuted tracking-widest mt-0.5">
              {eligibleCount}/{vouchers.length} voucher(s) available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-200 rounded-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-amazon-textMuted hover:text-amazon-text" />
          </button>
        </div>

        {/* ── Code Input ── */}
        <div className="px-5 py-3 border-b border-amazon-border bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-textMuted" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase());
                setCodeError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
              placeholder="Enter voucher code"
              className="w-full pl-9 pr-24 py-3 text-[11px] font-bold uppercase tracking-widest border border-amazon-border bg-white text-amazon-text rounded-sm focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/30 outline-none transition placeholder:text-neutral-400"
            />
            <button
              type="button"
              disabled={!codeInput.trim()}
              onClick={handleApplyCode}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors ${
                codeInput.trim()
                  ? "bg-amazon-btnSecondary text-amazon-text hover:brightness-95 border border-amazon-border"
                  : "bg-neutral-200 text-amazon-textMuted cursor-not-allowed border border-amazon-border"
              }`}
            >
              Apply
            </button>
          </div>
          {/* Inline error for manual code */}
          {codeError && (
            <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">
              {codeError}
            </p>
          )}
        </div>

        {/* ── Voucher List ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {sortedVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-amazon-textMuted">
              <Ticket className="w-10 h-10 opacity-20 mb-3" />
              <p className="text-sm">No vouchers available</p>
            </div>
          ) : (
            sortedVouchers.map((v) => {
              const meetsMinOrder = currentSubtotal >= v.minOrderValue;
              const isFullyClaimed = v.usageLimit > 0 && v.usedCount >= v.usageLimit;
              const eligible = meetsMinOrder && !isFullyClaimed;

              const remainingAmount = meetsMinOrder
                ? 0
                : v.minOrderValue - currentSubtotal;

              const isApplied = localSelectedCodes.has(v.code);

              // Determine selectionMode dynamically
              let selectionMode: "radio" | "checkbox" = "radio";
              if (scope.type === "shop" && v.targetUserId) {
                selectionMode = "checkbox";
              }

              return (
                <VoucherCard
                  key={v.id}
                  voucher={v}
                  eligible={eligible}
                  remainingAmount={remainingAmount}
                  selected={localSelectedCodes.has(v.code) || isApplied}
                  isApplied={isApplied}
                  onToggle={handleToggle}
                  brandLabel={brandLabel}
                  selectionMode={selectionMode}
                  isFullyClaimed={isFullyClaimed}
                />
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-amazon-border bg-neutral-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amazon-textMuted">
              {localSelectedCodes.size > 0
                ? `Selected ${localSelectedCodes.size} voucher(s)`
                : "No voucher selected"}
            </span>
            {localSelectedCodes.size > 0 && (
              <button
                type="button"
                onClick={() => setLocalSelectedCodes(new Set())}
                className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted hover:text-red-600 transition-colors"
              >
                Deselect all
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="w-full py-4 text-[13px] font-black uppercase tracking-[0.15em] rounded-sm transition-colors duration-200 flex items-center justify-center gap-2 bg-amazon-btnPrimary text-amazon-text hover:brightness-95 shadow-md"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherSelectorModal;
