"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  X,
  Send,
} from "lucide-react";
import { Review } from "@/src/types/review";
import { format } from "date-fns";

export const ReviewItem = ({ review }: { review: Review }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;

    // TODO: Gọi API lưu reply tại đây
    alert(`Đã gửi trả lời: "${replyText}"`);

    // Reset form
    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className="py-8 border-b border-gray-100 last:border-0 animate-fadeIn">
      {/* --- HEADER: Avatar + Name + Rating --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            {review.author.avatar ? (
              <Image
                src={review.author.avatar}
                alt={review.author.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                {review.author.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              {review.author.name}
              {review.author.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              )}
            </h4>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= review.rating
                      ? "fill-black text-black"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {format(new Date(review.date), "MMM d, yyyy")}
        </span>
      </div>

      {/* --- CONTENT --- */}
      <div className="pl-[52px]">
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          {review.content}
        </p>

        {/* Gallery Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {review.images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-100 cursor-zoom-in"
              >
                <Image
                  src={img}
                  alt="Review attachment"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* --- ACTIONS BAR --- */}
        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.likes})
          </button>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
              isReplying ? "text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Reply
          </button>
        </div>

        {isReplying && (
          <div className="mt-4 animate-slideDown">
            <div className="flex gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {/* Avatar người đang trả lời (thường là user hiện tại) */}
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                  Me
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all resize-none"
                  placeholder="Write your reply..."
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-md hover:bg-[#ce2a32] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3" /> Post Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EXISTING REPLIES (Phản hồi cũ từ Shop) --- */}
        {review.reply && (
          <div className="mt-4 ml-2 pl-4 border-l-2 border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-black text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                Ameko Team
              </span>
              <span className="text-[10px] text-gray-400">
                {format(new Date(review.reply.date), "MMM d")}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{review.reply.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};
