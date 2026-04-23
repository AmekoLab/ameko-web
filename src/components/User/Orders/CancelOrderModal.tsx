import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { CartData } from "@/src/types/order.types";

const createCancelOrderSchema = (t: (key: string) => string) =>
  z.object({
    reason: z.string().min(3, t("validationReasonMin")),
    description: z.string().optional(),
  });

type FormData = {
  reason: string;
  description?: string;
};

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order: CartData | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export default function CancelOrderModal({
  isOpen,
  onClose,
  onSuccess,
  order,
}: CancelOrderModalProps) {
  const t = useTranslations("CancelOrderModal");
  const [loading, setLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const schema = React.useMemo(() => createCancelOrderSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Reset selected items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItemIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Only items that are not already cancelled
  const activeItems =
    order?.orderItems.filter((i) => i.itemStatus !== "Cancelled") || [];

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isFullCancel =
    activeItems.length > 0 && selectedItemIds.length === activeItems.length;
  const selectedItems = activeItems.filter((i) =>
    selectedItemIds.includes(i.orderItemId)
  );
  const itemsRefund = selectedItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.totalPrice),
    0
  );
  const totalRefund = isFullCancel
    ? itemsRefund + (order?.shippingFee || 0)
    : itemsRefund;

  const onSubmit = async (data: FormData) => {
    if (!order) return;

    try {
      setLoading(true);
      const res = await orderIssueService.submitCancelRequest({
        orderId: order.orderId,
        reason: data.reason,
        description: data.description || "",
        itemIds: isFullCancel ? [] : selectedItemIds, // Send empty array for full cancel
      });

      if (res.success) {
        toast.success(t("toastSubmitSuccess"));
        reset();
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || t("toastSubmitFailed"));
      }
    } catch (error: any) {
      // Interceptor already unwraps to error.message
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        t("toastUnknownError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/80 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-amazon-border rounded-sm w-full max-w-md p-6 relative shadow-xl">
        <h2 className="text-red-600 font-bold text-xl mb-4">{t("title")}</h2>
        <p className="text-amazon-textMuted text-[13px] mb-4">
          {t("description")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Item Selection for Partial Cancel */}
          {order?.orderStatus === "Processing" && activeItems.length > 0 && (
            <div className="mb-4 bg-neutral-50 p-3 border border-neutral-200 rounded-sm">
              <p className="text-sm font-bold text-amazon-text mb-2">
                {t("selectItemsToCancel")}
              </p>
              <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                {activeItems.map((item) => (
                  <label
                    key={item.orderItemId}
                    className="flex items-start gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedItemIds.includes(item.orderItemId)}
                      onChange={() => handleToggleItem(item.orderItemId)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amazon-text line-clamp-1 group-hover:text-amazon-link">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-amazon-textMuted">
                        {t("quantityAbbr")} {item.quantity} | {t("refundAbbr")}{" "}
                        <span className="text-amazon-price font-medium">
                          {formatCurrency(item.finalPrice ?? item.totalPrice)}
                        </span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-200 border-dashed">
                <p className="text-xs text-red-600 italic mb-1">
                  {t("shippingFeeWarning")}
                </p>
                {selectedItemIds.length > 0 && (
                  <p className="text-sm font-medium text-amazon-text bg-yellow-50 p-2 rounded-sm border border-yellow-200">
                    {t("refundPreview", { amount: formatCurrency(totalRefund), count: selectedItemIds.length })}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <input
              {...register("reason")}
              className="bg-white text-amazon-text border border-amazon-border rounded-sm w-full py-2 px-3 text-[13px] focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400 mb-1"
              placeholder={t("reasonPlaceholder")}
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <textarea
              {...register("description")}
              rows={3}
              className="bg-white text-amazon-text border border-amazon-border rounded-sm w-full py-2 px-3 text-[13px] focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus placeholder-neutral-400 mb-1 resize-none"
              placeholder={t("detailsPlaceholder")}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 px-4 py-2 transition-colors rounded-sm border border-amazon-border bg-white font-medium text-sm"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white font-medium px-4 py-2 hover:bg-red-700 rounded-sm flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              {loading && (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {loading ? t("submitting") : t("submitRequest")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
