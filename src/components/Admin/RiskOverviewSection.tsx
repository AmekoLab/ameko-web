"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { RiskOverviewData } from "@/src/types/admin.types";
import { adminService } from "@/src/services/admin.service";

// ── Component ──────────────────────────────────────────────────────────────────

export default function RiskOverviewSection() {
  const t = useTranslations("RiskOverview");
  const [data, setData] = useState<RiskOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const risk = await adminService.getRiskOverview();
        setData(risk);
      } catch (error) {
        console.error("Failed to load risk overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full gap-2 min-h-0">
        <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">
          {t("title")}
        </h2>
        <div className="flex items-center justify-center flex-1">
          <p className="text-amazon-textMuted text-sm font-medium">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full w-full gap-2 min-h-0">
        <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">
          {t("title")}
        </h2>
        <p className="text-amazon-textMuted text-sm">{t("errorLoad")}</p>
      </div>
    );
  }

  // ── Card definitions ─────────────────────────────────────────────────────────

  const cards = [
    {
      id: "risk-rates",
      label: t("cardRiskRates"),
      value: `${data.cancelRate}%`,
      sub: (
        <span className="text-[11px] text-amazon-textMuted leading-tight mt-1">
          {t("subRefundRate", { n: data.refundRate })} |{" "}
          {t("subIssueRate", { n: data.issueRate })}
        </span>
      ),
    },
    {
      id: "active-requests",
      label: t("cardActiveRequests"),
      value: data.openIssues,
      sub: (
        <span className="text-[11px] text-amazon-textMuted leading-tight mt-1">
          {t("subCancelReq", { n: data.cancelRequests })} |{" "}
          {t("subRefundReq", { n: data.refundRequests })} |{" "}
          {t("subDisputes", { n: data.disputeRequests })}
        </span>
      ),
    },
    {
      id: "order-impact",
      label: t("cardOrderImpact"),
      value: data.cancelledOrders,
      sub: (
        <span className="text-[11px] text-amazon-textMuted leading-tight mt-1">
          {t("subRefunded", { n: data.refundedOrders })} |{" "}
          {t("subTotalOrders", { n: data.totalOrders })}
        </span>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full gap-2 min-h-0">
      <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0 pt-4">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white border border-amazon-border shadow-sm rounded-md px-4 py-3 flex flex-col gap-0.5 h-fit transition-colors hover:bg-neutral-50"
            >
              <span className="text-xs font-medium text-amazon-textMuted">
                {card.label}
              </span>
              <p className="text-lg font-bold text-amazon-text leading-none mt-1">
                {card.value}
              </p>
              {card.sub}
            </div>
          );
        })}
      </div>
    </div>
  );
}
