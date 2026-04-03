"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Receipt,
  Users,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { toast } from "react-toastify";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  CustomerOverviewData,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Helpers ──

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

// ── Metric Card ──

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ label, value, subtext, icon, iconBg }: MetricCardProps) {
  return (
    <div className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#2a2d35] transition-colors">
      {/* Decorative glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.06] blur-2xl pointer-events-none transition-opacity group-hover:opacity-[0.1]"
        style={{ background: iconBg }}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${iconBg}15` }}
        >
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>

      {subtext && (
        <p className="text-xs text-gray-500 leading-relaxed">{subtext}</p>
      )}
    </div>
  );
}

// ── Main Component ──

interface CustomerOverviewSectionProps {
  filters?: CustomerOverviewParams;
}

export default function CustomerOverviewSection({
  filters,
}: CustomerOverviewSectionProps) {
  const [data, setData] = useState<CustomerOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch when filters change
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result =
          await shopDashboardService.getCustomerOverview(filters);
        if (!cancelled) setData(result);
      } catch (error: any) {
        const msg = error?.message || "Failed to load data.";
        if (!cancelled) toast.error(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // Metric cards config
  const cards = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "Total Revenue",
        value: formatVND(data.totalRevenue),
        icon: <DollarSign className="w-4.5 h-4.5 text-green-500" />,
        iconBg: "#22c55e",
      },
      {
        label: "AOV",
        value: formatVND(data.averageOrderValue),
        icon: <Receipt className="w-4.5 h-4.5 text-blue-500" />,
        iconBg: "#3b82f6",
      },
      {
        label: "Customers",
        value: formatNumber(data.totalCustomers),
        subtext: `New: ${formatNumber(data.newCustomers)}  ·  Returning: ${formatNumber(data.returningCustomers)}`,
        icon: <Users className="w-4.5 h-4.5 text-purple-500" />,
        iconBg: "#a855f7",
      },
      {
        label: "Retention",
        value: `${data.repeatRate.toFixed(1)}%`,
        subtext: `Repeat Customers: ${formatNumber(data.repeatCustomers)}`,
        icon: <RefreshCw className="w-4.5 h-4.5 text-orange-500" />,
        iconBg: "#f97316",
      },
      {
        label: "Orders",
        value: formatNumber(data.totalOrders),
        subtext: `Purchase Frequency: ${data.purchaseFrequency}`,
        icon: <ShoppingCart className="w-4.5 h-4.5 text-yellow-500" />,
        iconBg: "#eab308",
      },
    ];
  }, [data]);

  return (
    <section>
      {/* Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-20 bg-[#1e2126] rounded" />
                <div className="w-9 h-9 bg-[#1e2126] rounded-lg" />
              </div>
              <div className="h-7 w-28 bg-[#1e2126] rounded mb-2" />
              <div className="h-3 w-36 bg-[#1e2126] rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-[#111111] border border-[#1e2126] rounded-xl">
          <p className="font-medium">No data available.</p>
          <p className="text-sm mt-1">Try adjusting your date range.</p>
        </div>
      )}

      {/* Date Range Footer */}
      {data && !isLoading && (
        <p className="text-[11px] text-gray-600 mt-3 text-right">
          Data from{" "}
          <span className="text-gray-400">
            {new Date(data.fromUtc).toLocaleDateString("vi-VN")}
          </span>{" "}
          to{" "}
          <span className="text-gray-400">
            {new Date(data.toUtc).toLocaleDateString("vi-VN")}
          </span>
        </p>
      )}
    </section>
  );
}
