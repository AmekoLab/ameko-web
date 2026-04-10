import { FC, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  X,
  Ticket,
  Search,
  Tag,
  Clock,
  AlertCircle,
  Check,
  Gift,
} from "lucide-react";
import { Voucher } from "@/src/services/voucher.service";

// ─── Helpers ─────────────────────────────────────────────

function fmtVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

function fmtDiscount(v: Voucher): string {
  if (v.discountType === "Percentage") {
    const cap = v.maxDiscountAmount
      ? ` (tối đa ${fmtVND(v.maxDiscountAmount)})`
      : "";
    return `Giảm ${v.value}%${cap}`;
  }
  return `Giảm ${fmtVND(v.value)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

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
  orderId?: string;
}

// ─── Voucher Card (E-commerce Style) ─────────────────────

interface VoucherCardProps {
  voucher: Voucher;
  eligible: boolean;
  remainingAmount: number;
  selected: boolean;
  isApplied: boolean;
  onToggle: (code: string) => void;
  brandLabel: string;
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
  isFullyClaimed,
}) => {
  const progress = usageProgress(voucher);
  const isAlmostGone = progress >= 0.8;
  const isActive = selected || isApplied;

  return (
    <div
      className={`relative flex bg-white rounded-lg shadow-sm transition-all duration-200 overflow-hidden border ${
        !eligible
          ? "opacity-60 grayscale cursor-not-allowed border-gray-200"
          : isActive
            ? "border-orange-500 ring-1 ring-orange-500/50"
            : "border-gray-200 hover:border-orange-300 cursor-pointer"
      }`}
      onClick={() => eligible && onToggle(voucher.code)}
      role="button"
      tabIndex={eligible ? 0 : -1}
      aria-disabled={!eligible}
    >
      {/* ── Left Ticket Part ── */}
      <div className="w-28 shrink-0 bg-gradient-to-br from-orange-400 to-orange-500 flex flex-col items-center justify-center p-2 text-white border-r border-dashed border-gray-300 relative">
        <Ticket className="w-7 h-7 mb-1 opacity-90" />
        <span className="text-xs font-semibold text-center leading-tight">
          {brandLabel}
        </span>
      </div>

      <div className="absolute top-0 -mt-1.5 left-28 -ml-1.5 w-3 h-3 bg-gray-50 rounded-full border-b border-gray-200" />
      <div className="absolute bottom-0 -mb-1.5 left-28 -ml-1.5 w-3 h-3 bg-gray-50 rounded-full border-t border-gray-200" />

      {/* ── Right Content Part ── */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0 bg-white">
        <div>
          {/* Title */}
          <h4 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">
            {fmtDiscount(voucher)}
          </h4>

          {/* Targeted Badge (Voucher tặng riêng) */}
          {voucher.targetUserId && (
            <div className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-medium">
              <Gift className="w-3 h-3" />
              Tặng riêng cho bạn
            </div>
          )}

          {/* Code */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            Mã: <span className="font-medium text-gray-700">{voucher.description || voucher.name}</span>
          </p>

          {/* Min order */}
          {voucher.minOrderValue > 0 && (
            <div className="inline-block mt-1.5 px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded text-[10px] font-medium">
              Đơn tối thiểu {fmtVND(voucher.minOrderValue)}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          {/* Expiry + progress */}
          <div className="min-w-0 flex-1">
            {voucher.usageLimit > 0 && voucher.usageLimit < 2147483647 && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                {isAlmostGone && eligible && (
                  <span className="text-[10px] font-medium text-red-500 shrink-0">
                    Sắp hết
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="w-3 h-3 shrink-0" />
              <span>HSD: {fmtDate(voucher.endDate)}</span>
            </div>
          </div>

          {/* Selection control */}
          <div className="shrink-0 flex items-center justify-center w-5 h-5">
            {eligible ? (
              isActive ? (
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )
            ) : (
              <Tag className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </div>

        {/* Ineligible message */}
        {!eligible && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            {isFullyClaimed ? (
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Voucher đã được sử dụng hết</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>
                  Mua thêm {fmtVND(remainingAmount)} để sử dụng
                </span>
              </div>
            )}
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
  selectedCodes = [],
  onConfirm,
  scope,
}) => {
  const [prevOpen, setPrevOpen] = useState(false);
  const [localSelectedCodes, setLocalSelectedCodes] = useState<Set<string>>(
    () => new Set(selectedCodes),
  );
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setLocalSelectedCodes(new Set(selectedCodes));
    setCodeInput("");
    setCodeError(null);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Lọc & Sắp xếp Voucher
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

  // Chia Group: Targeted (chỉ định) vs General (chung)
  const targetedVouchers = sortedVouchers.filter((v) => v.targetUserId);
  const generalVouchers = sortedVouchers.filter((v) => !v.targetUserId);

  // LOGIC MỚI: Stacking (1 System) HOẶC (1 Shop General + 1 Shop Targeted)
  const handleToggle = useCallback(
    (code: string) => {
      setLocalSelectedCodes((prev) => {
        const newSet = new Set(prev);
        const toggledVoucher = vouchers.find((v) => v.code === code);
        if (!toggledVoucher) return prev;

        // Nếu mã đang được chọn -> Bỏ chọn
        if (newSet.has(code)) {
          newSet.delete(code);
          return newSet;
        }

        // Nếu là Voucher Hệ Thống -> Chỉ được chọn 1 mã duy nhất
        if (scope.type === "system") {
          return new Set([code]);
        }

        // Nếu là Voucher Shop -> Xử lý tối đa 2 mã (1 General + 1 Targeted)
        const isTargeted = !!toggledVoucher.targetUserId;

        // Tìm xem trong các mã đang chọn, có mã nào CÙNG LOẠI (Targeted/General) với mã vừa click không
        const selectedVouchersList = vouchers.filter((v) => newSet.has(v.code));
        const sameTypeVoucher = selectedVouchersList.find(
          (v) => !!v.targetUserId === isTargeted,
        );

        // Nếu có mã cùng loại đang được chọn -> Xóa mã đó đi (để đè mã mới lên)
        if (sameTypeVoucher) {
          newSet.delete(sameTypeVoucher.code);
        }

        // Thêm mã mới vào
        newSet.add(code);
        return newSet;
      });
    },
    [vouchers, scope],
  );

  const handleConfirm = useCallback(() => {
    const selectedVouchers = vouchers.filter((v) =>
      localSelectedCodes.has(v.code),
    );
    onConfirm(selectedVouchers);
    onClose();
  }, [vouchers, localSelectedCodes, onConfirm, onClose]);

  const handleApplyCode = useCallback(() => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    const found = vouchers.find((v) => v.code.toUpperCase() === code);
    if (!found) {
      setCodeError("Mã không hợp lệ hoặc không tồn tại.");
      return;
    }
    const eligible = currentSubtotal >= found.minOrderValue;
    if (!eligible) {
      setCodeError(
        `Đơn hàng chưa đạt mức tối thiểu ${fmtVND(found.minOrderValue)}.`,
      );
      return;
    }
    setCodeError(null);
    onConfirm([found]); // Áp dụng mã tay cũng trả về đúng 1 voucher
    onClose();
  }, [codeInput, vouchers, currentSubtotal, onConfirm, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const eligibleCount = vouchers.filter(
    (v) => currentSubtotal >= v.minOrderValue,
  ).length;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
    >
      <div className="w-full md:max-w-[440px] h-[85vh] md:h-auto md:max-h-[85vh] bg-gray-50 md:rounded-xl rounded-t-xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Có thể chọn {eligibleCount} voucher
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Search/Input Code ── */}
        <div className="px-4 py-3 bg-white shadow-sm shrink-0 z-10 relative">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-transparent focus-within:border-orange-500 focus-within:bg-white transition-colors">
            <div className="flex items-center pl-3">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase());
                setCodeError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
              placeholder="Nhập mã voucher"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none text-gray-800 placeholder:text-gray-400 uppercase"
            />
            <button
              type="button"
              disabled={!codeInput.trim()}
              onClick={handleApplyCode}
              className={`px-4 text-sm font-semibold transition-colors ${
                codeInput.trim()
                  ? "text-orange-500 hover:bg-orange-50"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              Áp dụng
            </button>
          </div>
          {codeError && (
            <p className="mt-2 text-xs font-medium text-red-500">
              {codeError}
            </p>
          )}
        </div>

        {/* ── Voucher List ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-gray-50">
          {sortedVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Ticket className="w-12 h-12 opacity-20 mb-3" />
              <p className="text-sm">Không có mã giảm giá nào</p>
            </div>
          ) : (
            <>
              {/* Group 1: Voucher tặng riêng (Targeted) */}
              {targetedVouchers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 px-1">
                    Voucher Dành Riêng Cho Bạn
                  </h4>
                  <div className="space-y-3">
                    {targetedVouchers.map((v) => {
                      const meetsMinOrder = currentSubtotal >= v.minOrderValue;
                      const isFullyClaimed = v.usageLimit > 0 && v.usedCount >= v.usageLimit;
                      const eligible = meetsMinOrder && !isFullyClaimed;
                      return (
                        <VoucherCard
                          key={v.id}
                          voucher={v}
                          eligible={eligible}
                          remainingAmount={meetsMinOrder ? 0 : v.minOrderValue - currentSubtotal}
                          selected={localSelectedCodes.has(v.code)}
                          isApplied={localSelectedCodes.has(v.code)}
                          onToggle={handleToggle}
                          brandLabel={brandLabel}
                          isFullyClaimed={isFullyClaimed}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 2: Voucher chung (General) */}
              {generalVouchers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 px-1">
                    Voucher Cửa Hàng
                  </h4>
                  <div className="space-y-3">
                    {generalVouchers.map((v) => {
                      const meetsMinOrder = currentSubtotal >= v.minOrderValue;
                      const isFullyClaimed = v.usageLimit > 0 && v.usedCount >= v.usageLimit;
                      const eligible = meetsMinOrder && !isFullyClaimed;
                      return (
                        <VoucherCard
                          key={v.id}
                          voucher={v}
                          eligible={eligible}
                          remainingAmount={meetsMinOrder ? 0 : v.minOrderValue - currentSubtotal}
                          selected={localSelectedCodes.has(v.code)}
                          isApplied={localSelectedCodes.has(v.code)}
                          onToggle={handleToggle}
                          brandLabel={brandLabel}
                          isFullyClaimed={isFullyClaimed}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {localSelectedCodes.size > 0
                ? `Đã chọn ${localSelectedCodes.size} mã`
                : "Chưa chọn mã nào"}
            </span>
            {localSelectedCodes.size > 0 && (
              <button
                type="button"
                onClick={() => setLocalSelectedCodes(new Set())}
                className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                Bỏ chọn
              </button>
            )}
          </div>
          <button
            onClick={handleConfirm}
            className="w-full py-3 text-sm font-bold text-white rounded-lg transition-colors bg-amazon-btnPrimary hover:brightness-95 flex items-center justify-center shadow-sm"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherSelectorModal;