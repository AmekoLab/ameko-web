"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Repeat,
  UserCheck,
  CalendarClock,
  Users,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  PurchaseFrequencyData,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Metric Card ──

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ label, value, icon, iconBg }: MetricCardProps) {
  return (
    <div className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#2a2d35] transition-colors">
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
    </div>
  );
}

// ── Main Component ──

interface PurchaseFrequencyCardsProps {
  filters?: CustomerOverviewParams;
}

export default function PurchaseFrequencyCards({
  filters,
}: PurchaseFrequencyCardsProps) {
  const [data, setData] = useState<PurchaseFrequencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result =
          await shopDashboardService.getPurchaseFrequency(filters);
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Purchase frequency fetch failed:", error);
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
        label: "Orders / Customer",
        value: String(data.ordersPerCustomer),
        icon: <UserCheck className="w-4.5 h-4.5 text-blue-500" />,
        iconBg: "#3b82f6",
      },
      {
        label: "Avg Repurchase Cycle",
        value: `${data.averageDaysBetweenOrders} days`,
        icon: <CalendarClock className="w-4.5 h-4.5 text-green-500" />,
        iconBg: "#22c55e",
      },
      {
        label: "Customers With Orders",
        value: new Intl.NumberFormat("vi-VN").format(data.customersWithOrders),
        icon: <Users className="w-4.5 h-4.5 text-purple-500" />,
        iconBg: "#a855f7",
      },
      {
        label: "Total Orders",
        value: new Intl.NumberFormat("vi-VN").format(data.totalOrders),
        icon: <ShoppingCart className="w-4.5 h-4.5 text-orange-500" />,
        iconBg: "#f97316",
      },
    ];
  }, [data]);

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <Repeat className="w-5 h-5 text-[#f5d800]" />
        <h3 className="text-lg font-bold text-white">Purchase Frequency</h3>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-[#1e2126] rounded" />
                <div className="w-9 h-9 bg-[#1e2126] rounded-lg" />
              </div>
              <div className="h-7 w-16 bg-[#1e2126] rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
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
