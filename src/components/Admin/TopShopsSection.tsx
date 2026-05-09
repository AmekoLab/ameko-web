"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/src/services/admin.service";
import { TopShopsResponse } from "@/src/types/admin.types";
import { Store, TrendingUp, Search } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TopShopsSection() {
  const t = useTranslations("AdminDashboard");
  const [data, setData] = useState<TopShopsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States cho bộ lọc
  const [top, setTop] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchTopShops = async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getTopShopsByOrders(
        top,
        startDate || undefined,
        endDate || undefined
      );
      setData(result);
    } catch (error) {
      console.error("Lỗi khi tải Top Shops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopShops();
  }, []);

  return (
    <div className="bg-white border border-amazon-border rounded-md shadow-sm overflow-hidden flex flex-col mt-4">
      {/* Header & Bộ Lọc */}
      <div className="p-4 border-b border-amazon-border bg-neutral-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-amazon-text">{t("topShopsTitle")}</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-amazon-textMuted uppercase tracking-wider">{t("topLabel")}</label>
            <input
              type="number"
              min="1"
              value={top}
              onChange={(e) => setTop(Number(e.target.value))}
              className="w-16 border border-amazon-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-amazon-textMuted uppercase tracking-wider">{t("startDateLabel")}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-amazon-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-amazon-textMuted uppercase tracking-wider">{t("endDateLabel")}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-amazon-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchTopShops}
            className="bg-neutral-900 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> {t("filterButton")}
          </button>
        </div>
      </div>

      {/* Danh sách Shop */}
      <div className="p-4">
        {isLoading ? (
          <p className="text-sm text-amazon-textMuted text-center py-6">{t("loadingTopShops")}</p>
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-amazon-textMuted text-center py-6">{t("noDataTopShops")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.items.map((shop, index) => (
              <div
                key={shop.shopId}
                className="flex items-center justify-between p-3 border border-neutral-200 rounded-md bg-white hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amazon-text">{shop.shopName}</p>
                    <p className="text-[11px] text-amazon-textMuted flex items-center gap-1">
                      <Store className="w-3 h-3" /> {shop.shopId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-amazon-text">{shop.orderCount}</p>
                  <p className="text-[10px] text-amazon-textMuted uppercase">{t("ordersCountLabel")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}