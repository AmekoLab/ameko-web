"use client";

import { FC, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  UserCircle2,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import { feedbackService } from "@/src/services/feedback.service";
import { PaginatedAssembledProductFeedbacks } from "@/src/types/feedback.types";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/src/store/hook";
import AssembledShopReplyModal from "@/src/app/[locale]/shop/assembled-feedbacks/AssembledShopReplyModal";
import ItemFeedbackModal from "@/src/components/User/Orders/ItemFeedbackModal";

interface ProductFeedbackListProps {
  productId: string;
  shopId?: string;
}

interface ProductFeedbacksResponse {
  success?: boolean;
  message?: string;
  data?: PaginatedAssembledProductFeedbacks;
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

export const ProductFeedbackList: FC<ProductFeedbackListProps> = ({ productId, shopId }) => {
  const t = useTranslations("ProductFeedbackList");
  const [feedbacks, setFeedbacks] = useState<PaginatedAssembledProductFeedbacks | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyFeedbackId, setReplyFeedbackId] = useState<string | null>(null);
  const [editItemConfig, setEditItemConfig] = useState<{ isOpen: boolean; orderItemId: string | null }>({ isOpen: false, orderItemId: null });
  
  const { user } = useAppSelector((state: any) => state.auth);
  const { currentShop } = useAppSelector((state: any) => state.shop);

  const myShopId = currentShop?.id || user?.shopId;
  const isOwner = shopId && myShopId && myShopId === shopId;
  const currentUserId = user?.id;

  useEffect(() => {
    setCurrentPage(1);
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setFeedbacks(null);
      return;
    }

    let isMounted = true;

    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const response = (await feedbackService.getAssembledProductFeedbacks(
          productId,
          currentPage,
        )) as ProductFeedbacksResponse | PaginatedAssembledProductFeedbacks;
        
        if (!isMounted) return;

        const wrappedResponse = response as ProductFeedbacksResponse;
        if (wrappedResponse?.success === false) {
          toast.error(
            wrappedResponse.message || t("fetchError")
          );
          setFeedbacks(null);
          return;
        }

        const data = wrappedResponse?.data ?? (response as PaginatedAssembledProductFeedbacks);
        if (data && Array.isArray(data.items)) {
          setFeedbacks({
             ...data,
             items: data.items || [],
          });
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
        const message = (error as { message?: string })?.message || t("fetchError");
        toast.error(message);
        setFeedbacks(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeedbacks();

    return () => {
      isMounted = false;
    };
  }, [productId, currentPage]);

  const refreshFeedbacks = () => {
    setCurrentPage(1);
    setFeedbacks((prev) => prev ? { ...prev, items: [] } : prev); 
    // Effect will trigger fetch thanks to dependency string updates but we also manually mutate currentPage if it was 1
    // Actually, forcing a refresh is better handled by adding a trigger state, or directly repeating the fetch logic:
  };

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
    <div className="pt-16 mb-20">
      <p className="text-[14px] font-black uppercase tracking-[0.3em] text-amazon-link mb-2">
        {t("subtitle")}
      </p>
      <h3 className="text-2xl lg:text-[28px] font-black uppercase text-amazon-text mb-2 leading-tight">
        {t("title")}
      </h3>
      <p className="text-sm text-amazon-textMuted mb-10">
        {t("totalCount", { count: totalCount })}
      </p>

      {isLoading ? (
        <div className="py-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amazon-link" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-sm text-amazon-textMuted border border-amazon-border border-dashed text-center rounded-sm">
          {t("noFeedbacks")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const normalizedRating = Math.max(
              0,
              Math.min(5, Math.round(Number(item.rating) || 0)),
            );

            return (
              <div
                key={item.feedbackId}
                className="border border-amazon-border rounded-sm p-5 bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
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
                      <p className="text-sm font-bold text-amazon-text truncate">
                        {item.fromUserName}
                      </p>
                      <p className="text-[11px] font-medium text-amazon-textMuted">
                        {formatFeedbackDate(item.createdDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <div className="flex items-center">
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
                    {currentUserId && item.fromUserId === currentUserId && (
                      <button
                        onClick={() => setEditItemConfig({ isOpen: true, orderItemId: item.orderItemId })}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amazon-link hover:text-amazon-linkDark hover:underline uppercase tracking-wider"
                      >
                        <Pencil className="w-3 h-3" />
                        {t("editReview")}
                      </button>
                    )}
                  </div>
                </div>

                {item.comment && (
                  <p className="text-sm text-amazon-text leading-relaxed whitespace-pre-wrap break-words mb-4">
                    {item.comment}
                  </p>
                )}

                {Array.isArray(item.imageUrls) && item.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
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

                {item.shopReply ? (
                  <div className="rounded-sm border border-amazon-border bg-neutral-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amazon-text mb-1">
                      {t("shopReply")}
                    </p>
                    <p className="text-sm text-amazon-text whitespace-pre-wrap break-words">
                      {item.shopReply}
                    </p>
                  </div>
                ) : (
                  isOwner && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setReplyFeedbackId(item.feedbackId)}
                        className="text-[11px] font-bold text-amazon-text bg-gray-100 hover:bg-gray-200 uppercase tracking-wider px-4 py-2 rounded-sm border border-gray-300 transition-colors"
                      >
                        {t("replyAction")}
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {!isLoading && feedbacks && feedbacks.totalPages > 0 && (
        <div className="mt-8 pt-4 border-t border-amazon-border flex items-center justify-between">
          <p className="text-[11px] font-medium text-amazon-textMuted uppercase tracking-wider">
            {t("page")} {feedbacks.currentPage} / {feedbacks.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!feedbacks.hasPreviousPage}
              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-amazon-text transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("prev")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!feedbacks.hasNextPage}
              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-amazon-text transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("next")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {replyFeedbackId && (
        <AssembledShopReplyModal
          isOpen={true}
          onClose={() => setReplyFeedbackId(null)}
          feedbackId={replyFeedbackId}
          onSuccess={() => {
            // reload window instead of complex refetch just to make sure data is synced instantly
            window.location.reload(); 
          }}
        />
      )}

      {editItemConfig.isOpen && (
        <ItemFeedbackModal
          isOpen={editItemConfig.isOpen}
          onClose={() => setEditItemConfig({ isOpen: false, orderItemId: null })}
          orderItemId={editItemConfig.orderItemId}
          mode="edit"
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
