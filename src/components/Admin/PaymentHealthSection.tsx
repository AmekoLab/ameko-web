"use client";

import { useEffect, useState } from "react";
import { PaymentHealthData } from "@/src/types/admin.types";
import { adminService } from "@/src/services/admin.service";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format a number as Vietnamese Dong (e.g. 1.074.000 ₫) */
function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

/** Map payment method enum to a human-readable label */
function mapMethodName(method: number): string {
  switch (method) {
    case 0:
      return "COD";
    case 1:
      return "Banking";
    case 2:
      return "E-Wallet/ZaloPay";
    default:
      return "Unknown";
  }
}

/** Map payment type enum to a human-readable label */
function mapTypeName(type: number): string {
  switch (type) {
    case 0:
      return "Order Payment";
    case 1:
      return "Subscription/Deposit";
    default:
      return "Unknown";
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function PaymentHealthSection() {
  const [data, setData] = useState<PaymentHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">Payment Health</h2>
        <div className="flex items-center justify-center flex-1">
          <p className="text-amazon-textMuted text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full w-full gap-2 min-h-0">
        <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">Payment Health</h2>
        <p className="text-amazon-textMuted text-sm">
          Failed to load payment health data.
        </p>
      </div>
    );
  }

  // ── Top row card definitions ─────────────────────────────────────────────────

  const topCards = [
    {
      id: "payment-volume",
      label: "Payment Volume",
      value: formatVND(data.successfulPaymentVolume),
      sub: null,
    },
    {
      id: "success-rate",
      label: "Success Rate",
      value: `${data.paymentSuccessRate}%`,
      sub: null,
    },
    {
      id: "total-payments",
      label: "Total Payments",
      value: data.totalPayments,
      sub: `Success: ${data.successfulPayments} | Failed: ${data.failedPayments} | Refund: ${data.refundedPayments}`,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full gap-2 min-h-0">
      <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">Payment Health</h2>

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
                <span className="text-[10px] text-amazon-textMuted leading-tight mt-0.5">{card.sub}</span>
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
            Metrics by Method
          </h3>

          {data.methodMetrics.length === 0 ? (
            <p className="text-sm text-amazon-textMuted">No data available.</p>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              {data.methodMetrics.map((m: { method: number; total: number; successful: number; failed: number }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b border-amazon-border last:border-b-0"
                >
                  <span className="text-xs font-semibold text-amazon-text">
                    {mapMethodName(m.method)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-amazon-textMuted">
                      Total:{" "}
                      <span className="text-amazon-text font-bold">{m.total}</span>
                    </span>
                    <span className="text-[11px] text-amazon-textMuted">
                      Success:{" "}
                      <span className="text-green-600 font-bold">
                        {m.successful}
                      </span>
                    </span>
                    <span className="text-[11px] text-amazon-textMuted">
                      Failed:{" "}
                      <span className="text-red-500 font-bold">
                        {m.failed}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metrics by Type */}
        <div className="bg-white border border-amazon-border shadow-sm rounded-md p-4 flex flex-col">
          <h3 className="text-[11px] font-bold text-amazon-text mb-2 shrink-0">
            Metrics by Type
          </h3>

          {data.typeMetrics.length === 0 ? (
            <p className="text-sm text-amazon-textMuted">No data available.</p>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              {data.typeMetrics.map((t: { type: number; total: number; amount: number }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b border-amazon-border last:border-b-0"
                >
                  <span className="text-xs font-semibold text-amazon-text">
                    {mapTypeName(t.type)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-amazon-textMuted">
                      Count:{" "}
                      <span className="text-amazon-text font-bold">{t.total}</span>
                    </span>
                    <span className="text-[11px] text-amazon-textMuted">
                      Amount:{" "}
                      <span className="text-green-600 font-bold">
                        {formatVND(t.amount)}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
