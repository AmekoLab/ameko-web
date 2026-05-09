"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminDashboardOverview } from "@/src/types/admin.types";
import { adminService } from "@/src/services/admin.service";
import PaymentHealthSection from "@/src/components/Admin/PaymentHealthSection";
import RiskOverviewSection from "@/src/components/Admin/RiskOverviewSection";
import TopShopsSection from "@/src/components/Admin/TopShopsSection";

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
  const t = useTranslations("AdminDashboard");
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
      <div className="flex h-screen items-center justify-center bg-amazon-bgSecondary">
        <p className="text-amazon-textMuted text-sm font-medium">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-amazon-bgSecondary">
        <p className="text-amazon-textMuted text-sm">{t("errorLoad")}</p>
      </div>
    );
  }

  // ── Card definitions ─────────────────────────────────────────────────────────

  const cards = [
    {
      id: "net-revenue",
      label: t("cardNetRevenue"),
      value: formatVND(data.netRevenue),
      sub: null,
    },
    {
      id: "gross-merchandise-value",
      label: t("cardGMV"),
      value: formatVND(data.grossMerchandiseValue),
      sub: null,
    },
    {
      id: "platform-revenue",
      label: t("cardsplatformRevenue"),
      value: formatVND(data.platformRevenue),
      sub: null,
    },
    {
      id: "shop-revenue",
      label: t("cardsshopRevenue"),
      value: formatVND(data.shopRevenue),
      sub: null,
    },
    {
      id: "orders",
      label: t("cardOrders"),
      value: data.totalOrders,
      sub: `${t("subCompleted", { n: data.completedOrders })} | ${t(
        "subCancelled",
        {
          n: data.cancelledOrders,
        },
      )}`,
    },
    {
      id: "entities",
      label: t("cardEntities"),
      value: data.activeBuyers + data.activeShops,
      sub: `${t("subBuyers", { n: data.activeBuyers })} | ${t("subShops", {
        n: data.activeShops,
      })}`,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col p-3 md:p-4 gap-3 bg-amazon-bgSecondary overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-end justify-between ">
        <div>
          <h1 className="text-2xl font-bold text-amazon-text">{t("title")}</h1>
          <p className="text-[11px] text-amazon-textMuted">
            {formatDate(data.fromUtc)} – {formatDate(data.toUtc)}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white border border-amazon-border rounded-md px-3 py-2 flex flex-col justify-center shadow-sm"
            >
              <span className="text-[11px] font-medium text-amazon-textMuted">
                {card.label}
              </span>
              <p className="text-lg font-bold text-amazon-text leading-tight mt-0.5">
                {card.value}
              </p>
              {card.sub && (
                <span className="text-[10px] text-amazon-textMuted mt-0.5">
                  {card.sub}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Render sequentially, full width */}
      <PaymentHealthSection />
      <RiskOverviewSection />
      <TopShopsSection />
    </div>
  );
}
