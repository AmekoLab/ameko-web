"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  ChurnRiskResponse,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Helpers ──

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // Bỏ bớt giờ phút
};

// ── Inactive days severity ──

function InactiveBadge({ days, text }: { days: number; text: string }) {
  let colorClass = "text-amber-700 bg-amber-100";
  if (days >= 60) colorClass = "text-red-700 bg-red-100";
  else if (days >= 30) colorClass = "text-orange-700 bg-orange-100";

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${colorClass}`}
    >
      {text}
    </span>
  );
}

// ── Component ──

interface ChurnRiskTableProps {
  filters?: CustomerOverviewParams;
}

export default function ChurnRiskTable({ filters }: ChurnRiskTableProps) {
  const t = useTranslations("ChurnRiskTable");
  const [data, setData] = useState<ChurnRiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const prevFilters = useRef(filters);
  useEffect(() => {
    if (prevFilters.current !== filters) {
      setPage(1);
      prevFilters.current = filters;
    }
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await shopDashboardService.getChurnRisk({
          ...filters,
          PageNumber: page,
          PageSize: 10,
        });
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Churn risk fetch failed:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const btnClass =
    "border border-amazon-border bg-white hover:bg-neutral-50 text-[11px] font-medium text-amazon-text px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white border border-amazon-border shadow-sm rounded-md overflow-hidden">
      {/* Header - Siêu mỏng, không Icon */}
      <div className="px-3 py-2 border-b border-amazon-border bg-neutral-50 shrink-0 flex flex-col justify-center">
        <h3 className="text-sm font-bold text-amazon-text leading-tight">
          {t("title")}
        </h3>
        <p className="text-[10px] text-amazon-textMuted leading-tight mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      {/* Table Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-0">
          <p className="text-xs text-amazon-textMuted">{t("loading")}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <table className="w-full text-left border-collapse cursor-default">
            <thead className="sticky top-0 z-10 bg-neutral-50 text-[11px] text-amazon-textMuted font-medium border-b border-amazon-border shadow-sm">
              <tr>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">
                  {t("colCustomer")}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">
                  {t("colInactive")}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">
                  {t("colOrders")}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">
                  {t("colValue")}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">
                  {t("colAction")}
                </th>
              </tr>
            </thead>
            <tbody>
              {!data?.items?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-6 text-center text-amazon-textMuted text-xs"
                  >
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr
                    key={item.customerId}
                    className="border-b border-amazon-border hover:bg-neutral-50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-2 py-1.5 min-w-[120px]">
                      <p className="text-amazon-text font-medium text-[11px] leading-tight truncate">
                        {item.customerName}
                      </p>
                      <p className="text-amazon-textMuted text-[10px] leading-tight truncate mt-0.5">
                        {item.email}
                      </p>
                    </td>
                    {/* Inactive Days */}
                    <td className="px-2 py-1.5">
                      <InactiveBadge
                        days={item.inactiveDays}
                        text={t("inactiveDays", { days: item.inactiveDays })}
                      />
                    </td>
                    {/* Lifetime Orders */}
                    <td className="px-2 py-1.5 text-[11px] text-amazon-text tabular-nums">
                      {item.lifetimeOrders}
                    </td>
                    {/* Lifetime Value */}
                    <td className="px-2 py-1.5 text-[11px] font-semibold text-amazon-price tabular-nums whitespace-nowrap">
                      {formatVND(item.lifetimeValue)}
                    </td>
                    {/* Action */}
                    <td className="px-2 py-1.5">
                      <button className="text-[10px] bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text px-2 py-1 shadow-sm rounded-sm transition-colors whitespace-nowrap">
                        {t("remind")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination - Ép mỏng */}
      {data && data.totalPages > 0 && (
        <div className="px-3 py-1.5 flex items-center justify-between border-t border-amazon-border bg-white shrink-0">
          <span className="text-[10px] text-amazon-textMuted">
            {t("page")}{" "}
            <span className="font-medium text-amazon-text">
              {data.currentPage}
            </span>
            /{data.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.hasPreviousPage}
              className={btnClass}
            >
              {t("prev")}
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.hasNextPage}
              className={btnClass}
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
