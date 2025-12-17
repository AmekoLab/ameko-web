"use client";
import { FC } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Review } from "@/src/types/profile";

export const ReviewItem: FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="bg-white p-6 rounded-sm border border-gray-100 mb-4 last:mb-0">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
          <Image
            src={review.author.avatar}
            alt={review.author.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-grow">
          {/* Header Review */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                {review.author.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-[#ce2a32]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating ? "fill-current" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">| {review.date}</span>
              </div>
            </div>
          </div>

          {/* Sản phẩm đã mua */}
          <div className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-sm mb-3">
            Variations:{" "}
            <span className="font-bold text-gray-700">
              {review.productName}
            </span>
          </div>

          {/* Nội dung */}
          <p className="text-sm text-gray-800 leading-relaxed mb-3">
            {review.content}
          </p>

          {/* Ảnh Feedback */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-sm overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer hover:opacity-90"
                >
                  <Image
                    src={img}
                    alt="Feedback"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Shop Reply */}
          {review.reply && (
            <div className="bg-gray-50 p-3 rounded-sm text-sm text-gray-600 border-l-2 border-[#ce2a32] mt-2">
              <span className="font-bold text-[#ce2a32] text-xs block mb-1">
                Response from Seller:
              </span>
              {review.reply}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
