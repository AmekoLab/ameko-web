"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
} from "lucide-react";
import { AdminDashboardOverview } from "@/src/types/admin.types";
import { adminService } from "@/src/services/admin.service";
import PaymentHealthSection from "@/src/components/Admin/PaymentHealthSection";
import RiskOverviewSection from "@/src/components/Admin/RiskOverviewSection";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format a number as Vietnamese Dong (e.g. 3.168.201 ₫) */
function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

/** Format an ISO date string as a readable label (e.g. "April 1, 2026") */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overview = await adminService.getDashboardOverview();
        setData(overview);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400 text-sm">Failed to load dashboard data.</p>
      </div>
    );
  }

  // ── Card definitions ─────────────────────────────────────────────────────────

  const cards = [
    {
      id: "net-revenue",
      label: "Net Revenue",
      value: formatVND(data.netRevenue),
      icon: DollarSign,
      iconColor: "text-green-500",
      sub: null,
    },
    {
      id: "gmv",
      label: "GMV",
      value: formatVND(data.grossMerchandiseValue),
      icon: TrendingUp,
      iconColor: "text-blue-500",
      sub: null,
    },
    {
      id: "orders",
      label: "Orders Overview",
      value: data.totalOrders,
      icon: ShoppingCart,
      iconColor: "text-orange-500",
      sub: `Completed: ${data.completedOrders} | Cancelled: ${data.cancelledOrders}`,
    },
    {
      id: "entities",
      label: "Active Entities",
      value: data.activeBuyers + data.activeShops,
      icon: Users,
      iconColor: "text-purple-500",
      sub: `Buyers: ${data.activeBuyers} | Shops: ${data.activeShops}`,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <main className="p-8 bg-black flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-[#1e2126] pb-4">
              <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest">
                Dashboard Overview
              </h1>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {formatDate(data.fromUtc)} – {formatDate(data.toUtc)}
              </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    className="bg-[#111111] border border-[#1e2126] rounded-xl p-6 shadow-sm flex flex-col gap-2 hover:border-[#f5d800]/50 transition-colors group"
                  >
                    {/* Icon + Label */}
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`p-2 rounded-lg bg-white/5 ${card.iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        {card.label}
                      </span>
                    </div>

                    {/* Value */}
                    <p className="text-2xl font-oswald font-black text-white tracking-wider">
                      {card.value}
                    </p>

                    {/* Subtitle / Breakdown */}
                    {card.sub && (
                      <span className="text-xs text-gray-500">{card.sub}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Payment Health Section */}
            <PaymentHealthSection />

            {/* Risk & Dispute Overview Section */}
            <RiskOverviewSection />
          </div>
        </main>
      </div>
    </div>
  );
}
