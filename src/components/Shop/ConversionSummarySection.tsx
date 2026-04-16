"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  ConversionSummaryData,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Rate Card ──

interface RateRowProps {
  label: string;
  rate: number;
  detail: string;
  accentColor: string;
}

function RateRow({ label, rate, detail, accentColor }: RateRowProps) {
  const clamped = Math.min(100, Math.max(0, rate));
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex-1 flex items-center justify-between px-4 py-0 border-b border-amazon-border last:border-b-0 hover:bg-neutral-50 transition-colors">
      {/* Horizontal Left Box (Progress Ring) */}
      <div className="relative w-11 h-11 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          {/* Background ring */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#f9fafb"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-amazon-text">
            {rate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Horizontal Right Box (Text) */}
      <div className="flex flex-col items-end justify-center">
        <span className="text-xs font-bold text-amazon-text">{label}</span>
        <span className="text-[11px] font-medium text-amazon-textMuted">
          {detail}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ──

interface ConversionSummarySectionProps {
  filters?: CustomerOverviewParams;
}

export default function ConversionSummarySection({
  filters,
}: ConversionSummarySectionProps) {
  const t = useTranslations("ConversionSummarySection");
  const [data, setData] = useState<ConversionSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await shopDashboardService.getConversionSummary(filters);
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Conversion summary fetch failed:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: t("paidRate"),
        rate: data.paidRate,
        detail: t("orderRatioShort", {
          count: data.paidOrders,
          total: data.totalOrders,
        }), // Rút gọn chữ orders
        accentColor: "#22c55e",
      },
      {
        label: t("completed"), // Rút gọn tiêu đề
        rate: data.completionRate,
        detail: t("orderRatioShort", {
          count: data.completedOrders,
          total: data.totalOrders,
        }),
        accentColor: "#3b82f6",
      },
      {
        label: t("cancelRate"),
        rate: data.cancelRate,
        detail: t("orderRatioShort", {
          count: data.cancelledOrders,
          total: data.totalOrders,
        }),
        accentColor: "#ef4444",
      },
    ];
  }, [data, t]);

  return (
    <div className="h-full w-full bg-white border border-amazon-border shadow-sm rounded-md flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-amazon-border bg-neutral-50 shrink-0">
        <h3 className="text-sm font-bold text-amazon-text">{t("title")}</h3>
      </div>

      {/* Cards Box */}
      {isLoading ? (
        <div className="flex-1 flex flex-col">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-between px-4 border-b border-amazon-border last:border-b-0 animate-pulse"
            >
              <div className="w-11 h-11 rounded-full bg-neutral-100 shrink-0" />
              <div className="flex flex-col items-end gap-2">
                <div className="h-3 w-20 bg-neutral-200 rounded" />
                <div className="h-2 w-16 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="flex-1 flex flex-col">
          {cards.map((card) => (
            <RateRow key={card.label} {...card} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-amazon-textMuted">
          <p className="text-xs font-medium">{t("noData")}</p>
        </div>
      )}
    </div>
  );
}
