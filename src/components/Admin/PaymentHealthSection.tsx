"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentHealthData } from "@/src/types/admin.types";
import { adminService } from "@/src/services/admin.service";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format a number as Vietnamese Dong (e.g. 1.074.000 ₫) */
function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function PaymentHealthSection() {
  const t = useTranslations("PaymentHealth");
  const [data, setData] = useState<PaymentHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapMethodName = (method: number): string => {
    switch (method) {
      case 0:
        return t("methodCOD");
      case 1:
        return t("methodBanking");
      case 2:
        return t("methodEWallet");
      default:
        return t("methodUnknown");
    }
  };

  const mapTypeName = (type: number): string => {
    switch (type) {
      case 0:
        return t("typeOrderPayment");
      case 1:
        return t("typeSubscription");
      default:
        return t("typeUnknown");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const health = await adminService.getPaymentHealth();
        setData(health);
      } catch (error) {
        console.error("Failed to load payment health:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Loading skeleton ─────────────────────────────────────────────────────────

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

  // ── Top row card definitions ─────────────────────────────────────────────────

  const topCards = [
    {
      id: "payment-volume",
      label: t("cardVolume"),
      value: formatVND(data.successfulPaymentVolume),
      sub: null,
    },
    {
      id: "success-rate",
      label: t("cardSuccessRate"),
      value: `${data.paymentSuccessRate}%`,
      sub: null,
    },
    {
      id: "total-payments",
      label: t("cardTotalPayments"),
      value: data.totalPayments,
      sub: `${t("subSuccess", { n: data.successfulPayments })} | ${t(
        "subFailed",
        {
          n: data.failedPayments,
        },
      )} | ${t("subRefund", { n: data.refundedPayments })}`,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full gap-2 min-h-0">
      <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">
        {t("title")}
      </h2>

      {/* Top Row – Summary Cards */}
      <div className="shrink-0 grid grid-cols-3 gap-2">
        {topCards.map((card) => {
          return (
            <div
              key={card.id}
              className="px-3 py-2 bg-white border border-amazon-border rounded-md shadow-sm flex flex-col justify-center relative overflow-hidden transition-colors hover:bg-neutral-50"
            >
              <span className="text-[11px] text-amazon-textMuted">
                {card.label}
              </span>
              <p className="text-base font-bold text-amazon-text leading-tight mt-0.5">
                {card.value}
              </p>
              {card.sub && (
                <span className="text-[10px] text-amazon-textMuted leading-tight mt-0.5">
                  {card.sub}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Row – Method & Type Metrics */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* Metrics by Method */}
        <div className="bg-white border border-amazon-border shadow-sm rounded-md p-4 flex flex-col">
          <h3 className="text-[11px] font-bold text-amazon-text mb-2 shrink-0">
            {t("metricsByMethod")}
          </h3>

          {data.methodMetrics.length === 0 ? (
            <p className="text-sm text-amazon-textMuted">{t("noData")}</p>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              {data.methodMetrics.map(
                (
                  m: {
                    method: number;
                    total: number;
                    successful: number;
                    failed: number;
                  },
                  idx: number,
                ) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 border-b border-amazon-border last:border-b-0"
                  >
                    <span className="text-xs font-semibold text-amazon-text">
                      {mapMethodName(m.method)}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-amazon-textMuted">
                        {t("labelTotal")}{" "}
                        <span className="text-amazon-text font-bold">
                          {m.total}
                        </span>
                      </span>
                      <span className="text-[11px] text-amazon-textMuted">
                        {t("labelSuccess")}{" "}
                        <span className="text-green-600 font-bold">
                          {m.successful}
                        </span>
                      </span>
                      <span className="text-[11px] text-amazon-textMuted">
                        {t("labelFailed")}{" "}
                        <span className="text-red-500 font-bold">
                          {m.failed}
                        </span>
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Metrics by Type */}
        <div className="bg-white border border-amazon-border shadow-sm rounded-md p-4 flex flex-col">
          <h3 className="text-[11px] font-bold text-amazon-text mb-2 shrink-0">
            {t("metricsByType")}
          </h3>

          {data.typeMetrics.length === 0 ? (
            <p className="text-sm text-amazon-textMuted">{t("noData")}</p>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              {data.typeMetrics.map(
                (
                  metric: { type: number; total: number; amount: number },
                  idx: number,
                ) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 border-b border-amazon-border last:border-b-0"
                  >
                    <span className="text-xs font-semibold text-amazon-text">
                      {mapTypeName(metric.type)}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-amazon-textMuted">
                        {t("labelCount")}{" "}
                        <span className="text-amazon-text font-bold">
                          {metric.total}
                        </span>
                      </span>
                      <span className="text-[11px] text-amazon-textMuted">
                        {t("labelAmount")}{" "}
                        <span className="text-green-600 font-bold">
                          {formatVND(metric.amount)}
                        </span>
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
