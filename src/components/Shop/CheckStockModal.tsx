"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { checkStock, clearStockMap } from "@/src/store/slices/partsSlice";
import { PartItem } from "@/src/types/part.types";
import { useTranslations } from "next-intl";
import {
  ClipboardCheck,
  Loader2,
  Search,
  X,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

interface CheckStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: PartItem[];
}

export default function CheckStockModal({
  isOpen,
  onClose,
  parts,
}: CheckStockModalProps) {
  const t = useTranslations("CheckStockModal");
  const dispatch = useAppDispatch();
  const { checkingStock, stockMap } = useAppSelector((state) => state.parts);

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const getPartTypeLabel = (partType: string) => {
    if (partType === "kit") return t("typeKit");
    if (partType === "component") return t("typeComponent");
    if (partType === "accessory") return t("typeAccessory");
    return partType;
  };

  // Filter parts by search query
  const matchedParts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.partType.toLowerCase().includes(q),
    );
  }, [parts, query]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (matchedParts.every((p) => selectedIds.has(p.id))) {
      // Deselect all matched
      setSelectedIds((prev) => {
        const next = new Set(prev);
        matchedParts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        matchedParts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const handleCheck = () => {
    if (selectedIds.size === 0) return;
    dispatch(checkStock({ productIds: Array.from(selectedIds) }));
  };

  const handleClose = () => {
    setQuery("");
    setSelectedIds(new Set());
    dispatch(clearStockMap());
    onClose();
  };

  if (!isOpen) return null;

  const hasResults = stockMap !== null;
  const allMatchedSelected =
    matchedParts.length > 0 && matchedParts.every((p) => selectedIds.has(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-sm shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border bg-emerald-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amazon-text">
                {t("title")}
              </h2>
              <p className="text-[12px] font-medium text-emerald-700 mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-sm hover:bg-emerald-100 transition text-emerald-600/60 hover:text-emerald-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-textMuted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              autoFocus
              className="text-amazon-text font-medium text-[13px] w-full pl-9 pr-3 py-2 border border-amazon-border rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder:text-neutral-400"
            />
          </div>
          {selectedIds.size > 0 && (
            <p className="text-[11px] font-medium text-emerald-600 mt-1.5">
              {t("selectedParts", { count: selectedIds.size })}
            </p>
          )}
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-6 pb-3 min-h-0">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-amazon-textMuted text-[13px] font-medium">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              {t("emptySearchPrompt")}
            </div>
          ) : matchedParts.length === 0 ? (
            <div className="py-8 text-center text-amazon-textMuted text-[13px] font-medium">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
              {t("noPartsMatch", { query })}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Select all toggle */}
              <button
                onClick={selectAll}
                className="w-full text-left text-[12px] font-medium text-emerald-600 hover:text-emerald-700 px-2 py-2 transition"
              >
                {allMatchedSelected ? t("deselectAll") : t("selectAll")} (
                {matchedParts.length})
              </button>

              {matchedParts.map((part) => {
                const isSelected = selectedIds.has(part.id);
                const stockResult =
                  hasResults && part.id in stockMap!
                    ? stockMap![part.id]
                    : null;

                return (
                  <div
                    key={part.id}
                    onClick={() => toggleSelect(part.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer transition border ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-amazon-border hover:bg-neutral-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center transition ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600"
                          : "border-amazon-border"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={4}
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Part info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-amazon-text truncate leading-tight">
                        {part.name}
                      </p>
                      <p className="text-[12px] text-amazon-textMuted truncate mt-1">
                        <span>{getPartTypeLabel(part.partType)}</span>
                        {" · "}
                        {part.categoryName}
                      </p>
                    </div>

                    {/* Current stock */}
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-medium text-amazon-textMuted mb-1">
                        {t("current")}
                      </p>
                      <p
                        className={`text-[13px] font-bold ${
                          part.stockQuantity <= 0
                            ? "text-red-600"
                            : part.stockQuantity < 100
                              ? "text-amber-600"
                              : "text-amazon-text"
                        }`}
                      >
                        {part.stockQuantity.toLocaleString("vi-VN")}
                      </p>
                    </div>

                    {/* Verified stock result */}
                    {stockResult !== null && (
                      <div className="text-right shrink-0 pl-3 ml-1 border-l border-amazon-border">
                        <p className="text-[11px] font-medium text-emerald-600 mb-1">
                          {t("verified")}
                        </p>
                        <p className="text-[13px] font-bold text-emerald-700">
                          {stockResult.toLocaleString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-amazon-border bg-neutral-50/50 shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition shadow-sm"
          >
            {t("close")}
          </button>
          <button
            onClick={handleCheck}
            disabled={selectedIds.size === 0 || checkingStock}
            className="px-5 py-2 text-[13px] font-medium text-white bg-emerald-600 border border-emerald-600 rounded-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {checkingStock ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                {t("checking")}
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                {t("checkStockWithCount", { count: selectedIds.size })}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
