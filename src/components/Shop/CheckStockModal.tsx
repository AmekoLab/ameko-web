"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { checkStock, clearStockMap } from "@/src/store/slices/partsSlice";
import { PartItem } from "@/src/types/part.types";
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
  const dispatch = useAppDispatch();
  const { checkingStock, stockMap } = useAppSelector((state) => state.parts);

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Check Stock</h2>
              <p className="text-xs text-gray-500">
                Search and verify part inventory
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-emerald-100 transition text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type part name to search..."
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          {selectedIds.size > 0 && (
            <p className="text-xs text-emerald-600 font-semibold mt-2">
              {selectedIds.size} part{selectedIds.size > 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-6 pb-3 min-h-0">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Type a part name to start searching
            </div>
          ) : matchedParts.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No parts match &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {/* Select all toggle */}
              <button
                onClick={selectAll}
                className="w-full text-left text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1.5 transition"
              >
                {allMatchedSelected ? "Deselect all" : "Select all"} (
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition border ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600"
                          : "border-gray-300"
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
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {part.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        <span className="capitalize">{part.partType}</span>
                        {" · "}
                        {part.categoryName}
                      </p>
                    </div>

                    {/* Current stock */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Current</p>
                      <p
                        className={`text-sm font-bold ${
                          part.stockQuantity <= 0
                            ? "text-red-600"
                            : part.stockQuantity < 100
                              ? "text-amber-600"
                              : "text-gray-700"
                        }`}
                      >
                        {part.stockQuantity.toLocaleString("vi-VN")}
                      </p>
                    </div>

                    {/* Verified stock result */}
                    {stockResult !== null && (
                      <div className="text-right shrink-0 pl-2 border-l border-gray-200">
                        <p className="text-xs text-emerald-500 font-semibold">
                          Verified
                        </p>
                        <p className="text-sm font-bold text-emerald-700">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleCheck}
            disabled={selectedIds.size === 0 || checkingStock}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {checkingStock ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Check Stock ({selectedIds.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
