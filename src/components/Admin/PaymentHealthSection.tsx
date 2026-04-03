"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet, CheckCircle, CreditCard } from "lucide-react";
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
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Payment Health</h2>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Payment Health</h2>
        <p className="text-gray-400 text-sm">
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
      icon: Wallet,
      iconColor: "text-green-500",
      sub: null,
    },
    {
      id: "success-rate",
      label: "Success Rate",
      value: `${data.paymentSuccessRate}%`,
      icon: CheckCircle,
      iconColor: "text-blue-500",
      sub: null,
    },
    {
      id: "total-payments",
      label: "Total Payments",
      value: data.totalPayments,
      icon: CreditCard,
      iconColor: "text-purple-500",
      sub: `Success: ${data.successfulPayments} | Failed: ${data.failedPayments} | Refund: ${data.refundedPayments}`,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">Payment Health</h2>

      {/* Top Row – Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 shadow-sm flex flex-col gap-2 hover:border-[#f5d800]/50 transition-colors group"
            >
              {/* Icon + Label */}
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`p-2 rounded-lg bg-white/5 ${card.iconColor}`}
                >
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

              {/* Subtitle */}
              {card.sub && (
                <span className="text-xs text-gray-500">{card.sub}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Row – Method & Type Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Metrics by Method */}
        <div className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Metrics by Method
          </h3>

          {data.methodMetrics.length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.methodMetrics.map((m: { method: number; total: number; successful: number; failed: number }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-[#1e2126] last:border-b-0"
                >
                  <span className="text-sm font-semibold text-white">
                    {mapMethodName(m.method)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      Total:{" "}
                      <span className="text-white font-bold">{m.total}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Success:{" "}
                      <span className="text-green-400 font-bold">
                        {m.successful}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Failed:{" "}
                      <span className="text-red-400 font-bold">
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
        <div className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 shadow-sm">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Metrics by Type
          </h3>

          {data.typeMetrics.length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.typeMetrics.map((t: { type: number; total: number; amount: number }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-[#1e2126] last:border-b-0"
                >
                  <span className="text-sm font-semibold text-white">
                    {mapTypeName(t.type)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      Count:{" "}
                      <span className="text-white font-bold">{t.total}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      Amount:{" "}
                      <span className="text-green-400 font-bold">
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
