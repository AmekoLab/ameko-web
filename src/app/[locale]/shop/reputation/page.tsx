"use client";

import { useEffect, useState } from "react";
import { 
  shopReputationService, 
  ShopReputationCurrent, 
  ShopReputationBreakdown,
  ShopBadgeHistory,
  ShopReputationLog
} from "@/src/services/shopReputation.service";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  ThumbsUp, 
  TrendingUp, 
  Award,
  Loader2,
  History,
  CheckCircle
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function ShopReputationPage() {
  const t = useTranslations("ShopReputation");
  const [currentRep, setCurrentRep] = useState<ShopReputationCurrent | null>(null);
  const [breakdown, setBreakdown] = useState<ShopReputationBreakdown | null>(null);
  const [badgeHistory, setBadgeHistory] = useState<ShopBadgeHistory[]>([]);
  const [logs, setLogs] = useState<ShopReputationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      shopReputationService.getMyCurrent(),
      shopReputationService.getMyBreakdown(),
      shopReputationService.getMyLogs(1, 10),
      shopReputationService.getMyBadgeHistory()
    ])
      .then(([currentRes, breakdownRes, logsRes, badgeHistRes]) => {
        if (currentRes.success) setCurrentRep(currentRes.data);
        if (breakdownRes.success) setBreakdown(breakdownRes.data);
        if (logsRes.success && logsRes.data) setLogs(logsRes.data.items);
        if (badgeHistRes.success && badgeHistRes.data) setBadgeHistory(badgeHistRes.data);
      })
      .catch(err => console.error("Error fetching shop reputation:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Helpers for Badge styling
  const getBadgeColor = (badge: string | undefined) => {
    switch (badge) {
      case "Premium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Verified": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title") || "Uy tín cửa hàng"}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle") || "Theo dõi hiệu suất và chất lượng dịch vụ của bạn"}</p>
      </div>

      {/* TOP CARDS: SCORE & BADGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Score Card */}
        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-2">{t("currentScore") || "Điểm chất lượng hiện tại"}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-neutral-900">{currentRep?.currentQualityScore || 0}</span>
              <span className="text-lg font-medium text-neutral-400">/ 100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Badge Card */}
        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-2">{t("currentBadge") || "Huy hiệu cửa hàng"}</p>
            <div className={`inline-flex px-4 py-1.5 rounded-lg border font-bold text-lg ${getBadgeColor(currentRep?.badge)}`}>
              {currentRep?.badge || "Basic"}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {currentRep?.badge === "Premium" ? t("highestLevel") : t("improveRep")} 
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* BREAKDOWN METRICS */}
      {breakdown && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
            <h2 className="font-bold text-lg text-neutral-900">{t("breakdownTitle") || "Phân tích chỉ số chi tiết"}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-neutral-600">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-sm">{t("issueRate") || "Tỉ lệ đơn có sự cố"}</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{breakdown.issueRate}%</p>
              <p className="text-xs text-neutral-400 mt-2">{t("lowerIsBetter") || "Càng thấp càng tốt"}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-neutral-600">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-sm">{t("avgResponse") || "Thời gian phản hồi"}</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{breakdown.avgResponseHours} <span className="text-lg font-medium text-neutral-400">giờ</span></p>
              <p className="text-xs text-neutral-400 mt-2">{t("avgResponse") || "Thời gian phản hồi"}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-neutral-600">
                <RotateCcw className="w-5 h-5 text-red-500" />
                <span className="font-medium text-sm">{t("refundRate") || "Tỉ lệ hoàn tiền"}</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{breakdown.refundRate}%</p>
              <p className="text-xs text-neutral-400 mt-2">{t("refundRateDescription") || "Tỉ lệ đơn hàng bị trả lại / hoàn tiền"}</p>
            </div>

            <div className="p-6 md:border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-4 text-neutral-600">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-medium text-sm">{t("repurchaseRate") || "Tỉ lệ mua lại"}</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{breakdown.repurchaseRate}%</p>
              <p className="text-xs text-neutral-400 mt-2">{t("repurchaseRate") || "Tỉ lệ mua lại"}</p>
            </div>

            <div className="p-6 md:border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-4 text-neutral-600">
                <ThumbsUp className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-sm">{t("positiveFeedback") || "Tỉ lệ đánh giá tốt"}</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{breakdown.positiveFeedbackRate}%</p>
              <p className="text-xs text-neutral-400 mt-2">{t("positiveFeedback") || "Tỉ lệ đánh giá tốt"}</p>
            </div>

          </div>
        </div>
      )}

      {/* ================= BADGE HISTORY TIMELINE ================= */}
      {badgeHistory && badgeHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mt-8 p-6">
          <div className="mb-6">
            <h2 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              {t("badgeHistoryTitle") || "Lịch sử thăng hạng"}
            </h2>
          </div>

          <div className="relative border-l-2 border-neutral-100 ml-3 md:ml-4 space-y-8 py-2">
            {badgeHistory.map((history, index) => (
              <div key={index} className="relative pl-8 md:pl-10">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${
                  history.newBadge === "Premium" ? "bg-yellow-100 text-yellow-600" :
                  history.newBadge === "Verified" ? "bg-blue-100 text-blue-600" :
                  "bg-neutral-100 text-neutral-500"
                }`}>
                  {history.newBadge === "Premium" ? <Award className="w-4 h-4" /> : 
                   history.newBadge === "Verified" ? <ShieldCheck className="w-4 h-4" /> : 
                   <CheckCircle className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        history.newBadge === "Premium" ? "bg-yellow-50 text-amber-700 border-yellow-300" :
                        history.newBadge === "Verified" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }`}>
                      {history.newBadge} Shop
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {new Date(history.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-snug">
                    {history.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
