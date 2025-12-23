"use client";
import { Star } from "lucide-react";
import { ReviewStats } from "@/src/types/review";

export const ReviewSummary = ({ stats }: { stats: ReviewStats }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
      {/* Cột Trái: Điểm trung bình */}
      <div className="text-center md:text-left min-w-[150px]">
        <div className="text-5xl font-black text-[#ce2a32] mb-2 font-oswald">
          {stats.average}
          <span className="text-2xl text-gray-400 font-medium">/5</span>
        </div>
        <div className="flex justify-center md:justify-start gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(stats.average)
                  ? "fill-[#ce2a32] text-[#ce2a32]"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 font-bold">
          {stats.totalCount} Verified Reviews
        </p>
      </div>

      {/* Cột Phải: Biểu đồ phân bố */}
      <div className="flex-1 w-full space-y-2">
        {stats.distribution.map((item) => (
          <div key={item.star} className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 w-12 font-bold text-gray-700">
              {item.star}{" "}
              <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
            </div>
            {/* Progress Bar */}
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ce2a32] rounded-full"
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>
            <span className="w-10 text-right text-gray-400 text-xs">
              {item.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
