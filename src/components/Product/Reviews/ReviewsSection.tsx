"use client";
import { useState } from "react";
import { Review, ReviewStats } from "@/src/types/review";
import { ReviewItem } from "./ReviewItem";
import { Star, Image as ImageIcon, PenLine } from "lucide-react";

interface ReviewsSectionProps {
  initialReviews: Review[];
  stats: ReviewStats;
}

type FilterType = "all" | "with_media" | "5_star";

export const ReviewsSection = ({
  initialReviews,
  stats,
}: ReviewsSectionProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isWriting, setIsWriting] = useState(false);

  // Logic lọc dữ liệu (Filter)
  const filteredReviews = initialReviews.filter((review) => {
    if (activeFilter === "with_media")
      return review.images && review.images.length > 0;
    if (activeFilter === "5_star") return review.rating === 5;
    return true;
  });

  return (
    <div className="mt-24 pt-10 border-t border-gray-100 max-w-4xl mx-auto">
      {/* 1. Header & Summary (Minimalist) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight font-oswald mb-2">
            Reviews
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-black">{stats.average}</div>
            <div className="space-y-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(stats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Based on {stats.totalCount} reviews
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsWriting(!isWriting)}
          className="px-6 py-2.5 bg-black text-white text-sm font-bold uppercase rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <PenLine className="w-4 h-4" /> Write a Review
        </button>
      </div>

      {/* 2. Write Review Form (Expandable) */}
      {isWriting && (
        <div className="mb-10 p-6 bg-gray-50 rounded-xl animate-slideDown border border-gray-100">
          <h4 className="font-bold mb-4">Share your experience</h4>
          {/* Form giả lập - Sau này gắn React Hook Form vào đây */}
          <textarea
            className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black mb-4 text-sm"
            rows={4}
            placeholder="How was the product? ..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsWriting(false)}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-[#ce2a32]">
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* 3. Filter Tabs (Pills) - UX tốt hơn Dropdown */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
            activeFilter === "all"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-600 border-gray-200 hover:border-black"
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setActiveFilter("with_media")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
            activeFilter === "with_media"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-600 border-gray-200 hover:border-black"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> With Photos
        </button>
        <button
          onClick={() => setActiveFilter("5_star")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
            activeFilter === "5_star"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-600 border-gray-200 hover:border-black"
          }`}
        >
          <Star className="w-4 h-4 text-yellow-400" /> 5 Stars Only
        </button>
      </div>

      {/* 4. Review List */}
      <div className="space-y-2">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>No reviews match your filter.</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="text-black font-bold underline mt-2"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Load More (Optional) */}
      <div className="mt-10 text-center">
        <button className="text-sm font-bold text-gray-500 hover:text-black transition-colors border-b border-gray-300 pb-0.5 hover:border-black">
          Show More Reviews
        </button>
      </div>
    </div>
  );
};
