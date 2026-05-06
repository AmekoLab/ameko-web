"use client";

import { useEffect, useState } from "react";
import { walletService, WalletStatementResponse, WalletTransactionResponse } from "@/src/services/wallet.service";
import { Loader2, Wallet, TrendingUp, TrendingDown, Building2, AlertCircle, RefreshCcw, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const getTransactionDisplay = (tx: WalletTransactionResponse) => {
  // 1. In flow
  if (tx.flowDirection === "In") return { sign: "+", color: "text-green-600" };
  
  // 2. Held flow
  if (tx.flowDirection === "Held") {
    if (tx.type === "SalesPending") return { sign: "+", color: "text-orange-500" };
    if (tx.description?.includes("REFUND DEDUCTION")) return { sign: "-", color: "text-red-600" };
  }
  
  // 3. Out flow
  if (tx.flowDirection === "Out") return { sign: "-", color: "text-red-600" };

  // Fallback if missing
  return { sign: tx.amount > 0 ? "+" : "", color: tx.amount > 0 ? "text-green-600" : "text-red-600" };
};

export default function ShopWalletDashboard() {
  const t = useTranslations("Financial");
  const [statement, setStatement] = useState<WalletStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchStatements = async () => {
    setLoading(true);
    try {
      const res = await walletService.getWalletStatements(month, year);
      if (res.success && res.data) {
        setStatement(res.data);
      } else {
        toast.error(res.message || "Không thể tải dữ liệu ví.");
        setStatement(null);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu ví. Vui lòng thử lại.");
      setStatement(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [month, year]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            {t("title")}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>

        {/* Date Filters */}
        <div className="flex gap-3 bg-white p-2 rounded-xl border border-neutral-200 shadow-sm">
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border-none bg-transparent font-medium text-neutral-700 focus:ring-0 cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
          <span className="text-neutral-300">|</span>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-none bg-transparent font-medium text-neutral-700 focus:ring-0 cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : !statement ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-900">{t("noData")}</h3>
          <p className="text-neutral-500 text-sm mt-2">{t("noDataDesc")}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <p className="text-sm font-medium text-neutral-500 mb-1">{t("closingBalance")}</p>
              <h3 className="text-2xl font-bold text-neutral-900">{formatCurrency(statement.closingBalance)}</h3>
              <div className="text-xs text-neutral-500 mt-1">{t("heldBalance")}: {formatCurrency(statement.closingHeldBalance)}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <p className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-green-500"/> {t("revenue")}</p>
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(statement.totalSalesRevenue)}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <p className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-orange-500"/> {t("pending")}</p>
              <h3 className="text-2xl font-bold text-orange-600">{formatCurrency(statement.totalSalesPending)}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <p className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-red-500"/> {t("platformFees")}</p>
              <h3 className="text-2xl font-bold text-red-600">-{formatCurrency(statement.totalPlatformFees)}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <p className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5"><RefreshCcw className="w-4 h-4 text-orange-500"/> {t("refundsDeducted")}</p>
              <h3 className="text-2xl font-bold text-red-600">-{formatCurrency(statement.totalRefundsDeducted)}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
              <p className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-red-500"/> {t("withdrawals")}</p>
              <h3 className="text-2xl font-bold text-red-600">-{formatCurrency(statement.totalWithdrawals)}</h3>
              <div className="text-xs text-neutral-500 mt-1">{t("pendingWithdrawals")}: {formatCurrency(statement.totalPendingWithdrawals)}</div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-lg font-bold text-neutral-900">{t("transactionHistory")} ({statement.transactionCount})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">{t("table.time")}</th>
                    <th className="px-6 py-4 font-medium">{t("table.description")}</th>
                    <th className="px-6 py-4 font-medium">{t("table.type")}</th>
                    <th className="px-6 py-4 font-medium text-right">{t("table.amount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {statement.transactions?.map((tx) => {
                    const display = getTransactionDisplay(tx);
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-neutral-500">
                          {tx.createdAt ? format(parseISO(tx.createdAt), "dd/MM/yyyy HH:mm") : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-900">{tx.description}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs font-semibold">
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right`}>
                          <div className={`font-bold ${display.color}`}>
                            {display.sign}{formatCurrency(Math.abs(tx.netAmount))}
                          </div>
                          {tx.feeAmount > 0 && (
                            <div className="text-[11px] text-neutral-400 font-normal mt-0.5">
                              (Tổng: {formatCurrency(tx.amount)} - Phí: {formatCurrency(tx.feeAmount)})
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(!statement.transactions || statement.transactions.length === 0) && (
                     <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">{t("noDataDesc")}</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
