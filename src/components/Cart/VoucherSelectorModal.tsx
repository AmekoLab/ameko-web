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
  selectedIds?: string[];
  onConfirm: (selectedVouchers: Voucher[]) => void;
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
  onToggle: (id: string) => void;
  brandLabel: string;
  selectionMode: "radio" | "checkbox";
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
}) => {
  const progress = usageProgress(voucher);
  const isAlmostGone = progress >= 0.8;

  return (
    <div
      className={`flex rounded-lg overflow-hidden border transition-all ${
        !eligible
          ? "opacity-50 grayscale border-gray-200 cursor-not-allowed"
          : isApplied
            ? "border-[#ce2a32] ring-1 ring-[#ce2a32]/30 bg-red-50/40 shadow-sm cursor-pointer"
            : selected
              ? "border-[#ce2a32] ring-1 ring-[#ce2a32]/30 shadow-sm"
              : "border-gray-200 hover:border-[#ce2a32]/40 cursor-pointer"
      }`}
      onClick={() => eligible && onToggle(voucher.id)}
      role="button"
      tabIndex={eligible ? 0 : -1}
      aria-disabled={!eligible}
    >
      {/* ── Left Ticket Part ── */}
      <div className="relative w-[100px] shrink-0 bg-gradient-to-br from-[#ce2a32] to-[#a82028] flex flex-col items-center justify-center p-3 text-white">
        {/* Dashed "tear-off" edge */}
        <div className="absolute top-0 right-0 h-full w-0 border-r-2 border-dashed border-white/30" />
        {/* Scalloped circles */}
        <div className="absolute -right-[6px] top-3 w-3 h-3 bg-white rounded-full" />
        <div className="absolute -right-[6px] bottom-3 w-3 h-3 bg-white rounded-full" />

        <Ticket className="w-6 h-6 mb-1.5 opacity-80" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
          {brandLabel}
        </span>

        {/* Almost gone badge */}
        {isAlmostGone && eligible && (
          <span className="mt-1.5 text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-sm uppercase">
            Almost gone
          </span>
        )}
      </div>

      {/* ── Right Content Part ── */}
      <div
        className={`flex-1 p-3 flex flex-col justify-between min-w-0 ${isApplied ? "bg-red-50/40" : "bg-white"}`}
      >
        <div>
          {/* Title + Applied badge */}
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {fmtDiscount(voucher)}
            </p>
            {isApplied && (
              <CheckCircle2 className="w-4 h-4 text-[#ce2a32] shrink-0" />
            )}
          </div>
          {/* Description */}
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {voucher.description || voucher.name}
          </p>
          {/* Min order */}
          {voucher.minOrderValue > 0 && (
            <p className="text-[11px] text-gray-400 mt-1">
              Min order {fmtVND(voucher.minOrderValue)}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          {/* Expiry + progress */}
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Expiry: {fmtDate(voucher.endDate)}</span>
            </div>
            {/* Progress bar */}
            {voucher.usageLimit > 0 && voucher.usageLimit < 2147483647 && (
              <div className="mt-1 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ce2a32]/60 rounded-full transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Selection control */}
          <div className="shrink-0">
            {eligible ? (
              isApplied ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ce2a32] bg-[#ce2a32]/10 px-1.5 py-0.5 rounded-sm uppercase whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />
                  Applied
                </span>
              ) : (
                <input
                  type={selectionMode}
                  name="voucher-selection"
                  checked={selected}
                  readOnly
                  className="w-4 h-4 accent-[#ce2a32] cursor-pointer"
                  aria-label={`Select ${voucher.name}`}
                />
              )
            ) : (
              <Tag className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </div>

        {/* Ineligible message */}
        {!eligible && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-orange-500">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>
              Spend {fmtVND(remainingAmount)} more to use this voucher
            </span>
          </div>
        )}
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
  selectedIds = [],
  onConfirm,
}) => {
  // Track the modal open transition to reset local state
  const [prevOpen, setPrevOpen] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(
    () => new Set(selectedIds),
  );
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset local selection when modal opens
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setLocalSelectedIds(new Set(selectedIds));
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

  // BUSINESS RULE: Only ONE voucher per group (shop or system) -> always radio
  const selectionMode = "radio" as const;

  // Sort: eligible first, then by value descending
  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      const aEligible = currentSubtotal >= a.minOrderValue;
      const bEligible = currentSubtotal >= b.minOrderValue;
      if (aEligible !== bEligible) return aEligible ? -1 : 1;
      return b.value - a.value;
    });
  }, [vouchers, currentSubtotal]);

  const handleToggle = useCallback((id: string) => {
    setLocalSelectedIds((prev) => {
      // Radio: one at a time; clicking selected one deselects
      if (prev.has(id)) return new Set();
      return new Set([id]);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedVouchers = vouchers.filter((v) => localSelectedIds.has(v.id));
    onConfirm(selectedVouchers);
    onClose();
  }, [vouchers, localSelectedIds, onConfirm, onClose]);

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
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/50 transition-opacity"
    >
      <div className="w-full md:max-w-[480px] max-h-[85vh] md:max-h-[80vh] bg-white md:rounded-xl rounded-t-xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {eligibleCount}/{vouchers.length} voucher(s) available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Code Input ── */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase());
                setCodeError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
              placeholder="Enter voucher code"
              className="w-full pl-9 pr-20 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#ce2a32] focus:ring-1 focus:ring-[#ce2a32]/30 outline-none transition placeholder:text-gray-400"
            />
            <button
              type="button"
              disabled={!codeInput.trim()}
              onClick={handleApplyCode}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                codeInput.trim()
                  ? "bg-[#ce2a32] text-white hover:bg-[#a82028]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Apply
            </button>
          </div>
          {/* Inline error for manual code */}
          {codeError && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {codeError}
            </p>
          )}
        </div>

        {/* ── Voucher List ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {sortedVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Ticket className="w-10 h-10 opacity-20 mb-3" />
              <p className="text-sm">No vouchers available</p>
            </div>
          ) : (
            sortedVouchers.map((v) => {
              const eligible = currentSubtotal >= v.minOrderValue;
              const remainingAmount = eligible
                ? 0
                : v.minOrderValue - currentSubtotal;

              const isApplied = localSelectedIds.has(v.id);

              return (
                <VoucherCard
                  key={v.id}
                  voucher={v}
                  eligible={eligible}
                  remainingAmount={remainingAmount}
                  selected={localSelectedIds.has(v.id) || isApplied}
                  isApplied={isApplied}
                  onToggle={handleToggle}
                  brandLabel={brandLabel}
                  selectionMode={selectionMode}
                />
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">
              {localSelectedIds.size > 0
                ? `Selected ${localSelectedIds.size} voucher(s)`
                : "No voucher selected"}
            </span>
            {localSelectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setLocalSelectedIds(new Set())}
                className="text-xs text-[#ce2a32] hover:underline"
              >
                Deselect all
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 bg-[#ce2a32] text-white hover:bg-[#a82028]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherSelectorModal;
