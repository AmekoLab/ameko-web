"use client";
import { FC } from "react";
import { Star } from "lucide-react";
import { ReviewStats as IReviewStats } from "@/src/types/profile";

export const ReviewStats: FC<{ stats: IReviewStats }> = ({ stats }) => {
  return (
    <div className="bg-white p-6 rounded-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-8">
      {/* Cột trái: Điểm số to */}
      <div className="text-center md:text-left min-w-[120px]">
        <div className="text-5xl font-black text-[#ce2a32] mb-1">
          {stats.average}{" "}
          <span className="text-2xl text-gray-400 font-medium">/ 5</span>
        </div>
        <div className="flex justify-center md:justify-start gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(stats.average)
                  ? "fill-[#ce2a32] text-[#ce2a32]"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 font-medium">
          {stats.total} Reviews
        </p>
      </div>

      {/* Cột phải: Thanh Progress */}
      <div className="flex-grow w-full space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.breakdown[star] || 0;
          const percent = (count / stats.total) * 100;
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 w-12 shrink-0 font-bold text-gray-600">
                {star} <Star className="w-3 h-3 text-gray-400" />
              </div>
              <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ce2a32]"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="w-8 shrink-0 text-right text-gray-400 text-xs">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
