"use client";

import { FC, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  UserCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { feedbackService } from "@/src/services/feedback.service";
import { PaginatedShopFeedbacks } from "@/src/types/feedback.types";

interface ShopFeedbackListProps {
  shopId: string;
}

interface ShopFeedbacksResponse {
  success?: boolean;
  message?: string;
  data?: PaginatedShopFeedbacks;
}

const DEFAULT_PAGE_SIZE = 10;

const formatFeedbackDate = (dateValue: string): string => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const ShopFeedbackList: FC<ShopFeedbackListProps> = ({ shopId }) => {
  const [feedbacks, setFeedbacks] = useState<PaginatedShopFeedbacks | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [shopId]);

  useEffect(() => {
    if (!shopId) {
      setFeedbacks(null);
      return;
    }

    let isMounted = true;

    const fetchShopFeedbacks = async () => {
      setIsLoading(true);
      try {
        const response = (await feedbackService.getShopFeedbacks(
          shopId,
          currentPage,
        )) as ShopFeedbacksResponse | PaginatedShopFeedbacks;
        if (!isMounted) return;

        const wrappedResponse = response as ShopFeedbacksResponse;
        if (wrappedResponse?.success === false) {
          toast.error(
            wrappedResponse.message ||
              "Không thể tải danh sách đánh giá cửa hàng.",
          );
          setFeedbacks(null);
          return;
        }

        const data =
          wrappedResponse?.data ?? (response as PaginatedShopFeedbacks);
        if (data && Array.isArray(data.items)) {
          setFeedbacks(data);
          return;
        }

        setFeedbacks({
          items: [],
          totalCount: 0,
          currentPage,
          pageSize: DEFAULT_PAGE_SIZE,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      } catch (error: unknown) {
        if (!isMounted) return;
        const message =
          (error as { message?: string }).message ||
          "Không thể tải danh sách đánh giá cửa hàng.";
        toast.error(message);
        setFeedbacks(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchShopFeedbacks();

    return () => {
      isMounted = false;
    };
  }, [shopId, currentPage]);

  const handlePrevious = () => {
    if (!feedbacks?.hasPreviousPage) return;
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (!feedbacks?.hasNextPage) return;
    setCurrentPage((prev) => prev + 1);
  };

  const totalCount = feedbacks?.totalCount ?? 0;
  const items = feedbacks?.items ?? [];

  return (
    <div className="bg-white border border-amazon-border rounded-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amazon-text">
          Đánh giá cửa hàng
        </h3>
        <p className="text-xs font-medium text-amazon-textMuted">
          Tổng số: {totalCount} đánh giá
        </p>
      </div>

      {isLoading ? (
        <div className="py-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amazon-link" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-amazon-textMuted">
          Chưa có đánh giá nào.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const normalizedRating = Math.max(
              0,
              Math.min(5, Math.round(Number(item.rating) || 0)),
            );

            return (
              <div
                key={item.feedbackId}
                className="border border-amazon-border rounded-sm p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.fromUserAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.fromUserAvatar}
                        alt={item.fromUserName}
                        className="w-10 h-10 rounded-full object-cover border border-amazon-border"
                      />
                    ) : (
                      <UserCircle2 className="w-10 h-10 text-neutral-400" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-amazon-text truncate">
                        {item.fromUserName}
                      </p>
                      <p className="text-xs text-amazon-textMuted">
                        {formatFeedbackDate(item.createdDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <Star
                        key={`${item.feedbackId}-star-${starValue}`}
                        className={`w-4 h-4 ${
                          starValue <= normalizedRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {item.comment && (
                  <p className="mt-3 text-sm text-amazon-text leading-relaxed whitespace-pre-wrap break-words">
                    {item.comment}
                  </p>
                )}

                {Array.isArray(item.imageUrls) && item.imageUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {item.imageUrls.map((url, index) => (
                      <div
                        key={`${item.feedbackId}-image-${index}`}
                        className="aspect-square border border-amazon-border rounded-sm overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`feedback-image-${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {item.shopReply && (
                  <div className="mt-3 rounded-sm border border-neutral-200 bg-neutral-100 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Phản hồi từ Shop
                    </p>
                    <p className="text-sm text-neutral-800 whitespace-pre-wrap break-words">
                      {item.shopReply}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && feedbacks && feedbacks.totalPages > 0 && (
        <div className="mt-5 pt-4 border-t border-amazon-border flex items-center justify-between">
          <p className="text-xs font-medium text-amazon-textMuted">
            Trang {feedbacks.currentPage} / {feedbacks.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!feedbacks.hasPreviousPage}
              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-3 py-1.5 text-xs font-medium text-amazon-text transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!feedbacks.hasNextPage}
              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-3 py-1.5 text-xs font-medium text-amazon-text transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFeedbackList;
