"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Target,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  ConversionSummaryData,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Rate Card ──

interface RateCardProps {
  label: string;
  rate: number;
  detail: string;
  icon: React.ReactNode;
  accentColor: string;
}

function RateCard({ label, rate, detail, icon, accentColor }: RateCardProps) {
  // Clamp for the ring visual (0-100)
  const clamped = Math.min(100, Math.max(0, rate));
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="bg-[#111111] border border-[#1e2126] rounded-xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-[#2a2d35] transition-colors">
      {/* Decorative glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.05] blur-3xl pointer-events-none group-hover:opacity-[0.08] transition-opacity"
        style={{ background: accentColor }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accentColor}15` }}
      >
        {icon}
      </div>

      {/* Circular progress ring */}
      <div className="relative w-28 h-28 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          {/* Background ring */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#1e2126"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {rate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm font-semibold text-white mb-1">{label}</p>

      {/* Detail */}
      <span className="text-sm text-gray-500">{detail}</span>
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
  const [data, setData] = useState<ConversionSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result =
          await shopDashboardService.getConversionSummary(filters);
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
        label: "Paid Rate",
        rate: data.paidRate,
        detail: `${data.paidOrders} / ${data.totalOrders} orders`,
        icon: <CreditCard className="w-5 h-5 text-green-500" />,
        accentColor: "#22c55e",
      },
      {
        label: "Completion Rate",
        rate: data.completionRate,
        detail: `${data.completedOrders} / ${data.totalOrders} orders`,
        icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
        accentColor: "#3b82f6",
      },
      {
        label: "Cancel Rate",
        rate: data.cancelRate,
        detail: `${data.cancelledOrders} / ${data.totalOrders} orders`,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        accentColor: "#ef4444",
      },
    ];
  }, [data]);

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <Target className="w-5 h-5 text-[#f5d800]" />
        <h3 className="text-lg font-bold text-white">Order Conversion</h3>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#1e2126] rounded-xl p-6 flex flex-col items-center animate-pulse"
            >
              <div className="w-10 h-10 bg-[#1e2126] rounded-xl mb-4" />
              <div className="w-28 h-28 rounded-full bg-[#1e2126] mb-4" />
              <div className="h-4 w-28 bg-[#1e2126] rounded mb-2" />
              <div className="h-3 w-20 bg-[#1e2126] rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <RateCard key={card.label} {...card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-[#111111] border border-[#1e2126] rounded-xl">
          <p className="font-medium">No data available.</p>
        </div>
      )}
    </section>
  );
}
