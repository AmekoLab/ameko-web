"use client";

import { useEffect, useState, useCallback } from "react";
import { feedbackService } from "@/src/services/feedback.service";
import {
  PaginatedShopFeedbacks,
  ShopFeedbackItem,
} from "@/src/types/feedback.types";
import {
  Star,
  MessageCircle,
  Calendar,
  User,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import Image from "next/image";
import ShopReplyModal from "./ShopReplyModal";

export default function ShopFeedbacksPage() {
  const [data, setData] = useState<PaginatedShopFeedbacks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [replyFeedbackId, setReplyFeedbackId] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await feedbackService.getMyShopManagementFeedbacks(
        currentPage,
        pageSize,
      );
      if (response.success) {
        setData(response.data);
      } else {
        toast.error(response.message || "Không thể tải danh sách đánh giá");
      }
    } catch (error) {
      console.error("Fetch feedbacks error:", error);
      toast.error("Đã có lỗi xảy ra khi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amazon-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-amazon-primary" />
          Quản lý Đánh giá Cửa hàng
        </h1>
        <p className="text-gray-500 mt-1">
          Xem và phản hồi các đánh giá từ khách hàng về cửa hàng của bạn.
        </p>
      </div>

      {/* Stats Summary (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-semibold">
            Tổng đánh giá
          </p>
          <p className="text-2xl font-bold">{data?.totalCount || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase w-1/4">
                  Khách hàng / Đơn hàng
                </th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase w-2/5">
                  Nội dung đánh giá
                </th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase">
                  Ngày tạo
                </th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items.map((item: ShopFeedbackItem) => (
                <tr
                  key={item.feedbackId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {item.fromUserAvatar ? (
                          <Image
                            src={item.fromUserAvatar}
                            alt={item.fromUserName}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {item.fromUserName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      ID: {item.orderId.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="mb-2">{renderStars(item.rating)}</div>
                    <p className="text-gray-700 text-sm mb-3 italic">
                      "{item.comment}"
                    </p>

                    {/* Images Grid */}
                    {item.imageUrls.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {item.imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-md border border-gray-200 overflow-hidden group cursor-pointer"
                          >
                            <Image
                              src={url}
                              alt="feedback"
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Shop Reply Section */}
                    {item.shopReply ? (
                      <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400 mt-2">
                        <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Phản hồi của
                          bạn:
                        </p>
                        <p className="text-sm text-blue-700">
                          {item.shopReply}
                        </p>
                        <p className="text-[10px] text-blue-500 mt-1 italic">
                          Đã trả lời vào:{" "}
                          {format(
                            parseISO(item.shopRepliedAt!),
                            "dd/MM/yyyy HH:mm",
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-orange-500 font-medium flex items-center gap-1 mt-2">
                        (Chưa có phản hồi)
                      </p>
                    )}
                  </td>
                  <td className="p-4 align-top text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(item.createdDate), "dd/MM/yyyy")}
                    </div>
                  </td>
                  <td className="p-4 align-top text-right">
                    {!item.shopReply ? (
                      <button
                        onClick={() => setReplyFeedbackId(item.feedbackId)}
                        className="bg-amazon-primary text-amazon-text px-4 py-1.5 rounded-sm text-xs font-bold hover:brightness-95 transition-all uppercase shadow-sm border border-amazon-border"
                      >
                        Phản hồi
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-sm text-xs font-bold cursor-not-allowed uppercase border border-gray-200"
                      >
                        Đã trả lời
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-400 font-medium">
                        Chưa có đánh giá nào cho cửa hàng của bạn.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Trang <span className="font-bold">{data.currentPage}</span> /{" "}
              {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={!data.hasPreviousPage || isLoading}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!data.hasNextPage || isLoading}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <ShopReplyModal
        isOpen={!!replyFeedbackId}
        feedbackId={replyFeedbackId || ""}
        onClose={() => setReplyFeedbackId(null)}
        onSuccess={() => {
          setReplyFeedbackId(null);
          fetchFeedbacks(); // Load lại danh sách để hiện câu trả lời mới
        }}
      />
    </div>
  );
}
