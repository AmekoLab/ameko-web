"use client";

import { FC, useMemo, useState } from "react";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Keyboard, ImagePlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { submitWarrantyRequest } from "@/src/store/slices/warrantySlice";
import { PaymentHistoryOrderItem } from "@/src/types/order.types";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ─── Zod Schema ────────────────────────────────────────────
const createWarrantySchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    orderItemIds: z
      .array(z.string())
      .min(1, t("validation.selectAtLeastOneProduct", { min: 1 })),
    type: z.number().refine((v) => v === 1 || v === 2, {
      message: t("validation.selectRequestType"),
    }),
    reason: z.string().min(1, t("validation.reasonRequired")),
    description: z
      .string()
      .min(10, t("validation.descriptionMinLength", { min: 10 })),
    evidenceUrl: z.string().url(t("validation.uploadEvidenceImage")),
  });

type WarrantyFormValues = z.infer<ReturnType<typeof createWarrantySchema>>;

// ─── Props ─────────────────────────────────────────────────
interface CreateWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderGroupId: string;
  availableItems: PaymentHistoryOrderItem[];
}

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

// ─── Component ─────────────────────────────────────────────
const CreateWarrantyModal: FC<CreateWarrantyModalProps> = ({
  isOpen,
  onClose,
  orderGroupId,
  availableItems,
}) => {
  const dispatch = useAppDispatch();
  const t = useTranslations("CreateWarrantyModal");
  const tCommon = useTranslations("Common");
  const warrantySchema = useMemo(() => createWarrantySchema(t), [t]);
  const { isSubmittingWarranty } = useAppSelector((state) => state.warranty);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantySchema),
    defaultValues: {
      orderItemIds: [],
      type: 0,
      reason: "",
      description: "",
      evidenceUrl: "",
    },
  });

  const selectedItemIds = useWatch({ control, name: "orderItemIds" }) || [];

  const toggleItem = (id: string) => {
    const current = selectedItemIds;
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    setValue("orderItemIds", next, { shouldValidate: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setValue("evidenceUrl", url, { shouldValidate: true });
      setPreviewUrl(url);
    } catch {
      toast.error(t("uploadImageFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: WarrantyFormValues) => {
    try {
      await dispatch(
        submitWarrantyRequest({
          orderGroupId,
          payload: {
            orderItemIds: data.orderItemIds,
            type: data.type,
            reason: data.reason,
            description: data.description,
            evidenceUrl: data.evidenceUrl,
          },
        }),
      ).unwrap();
      reset();
      setPreviewUrl(null);
      onClose();
    } catch (err: unknown) {
      let errorMessage = t("submitWarrantyRequestFailed");
      if (typeof err === "string" && err) {
        errorMessage = err;
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isSubmittingWarranty && !isUploading) {
      reset();
      setPreviewUrl(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-lg border border-amazon-border px-3 py-2.5 text-sm text-amazon-text placeholder-neutral-400 focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-amazon-text mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-amazon-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
          <button
            onClick={handleClose}
            aria-label={tCommon("close")}
            className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-amazon-textMuted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* ── Product Selection ── */}
          <div>
            <label className={labelClass}>
              {t("selectProblematicProduct")}
            </label>
            <Controller
              name="orderItemIds"
              control={control}
              render={() => (
                <div className="space-y-2">
                  {availableItems.map((item) => {
                    const isSelected = selectedItemIds?.includes(
                      item.orderItemId,
                    );
                    const isDisabled = item.hasActiveIssue;
                    return (
                      <button
                        key={item.orderItemId}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) toggleItem(item.orderItemId);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                          isDisabled
                            ? "opacity-50 bg-neutral-100 border-neutral-200 cursor-not-allowed"
                            : isSelected
                              ? "border-amazon-btnPrimary bg-yellow-50"
                              : "border-amazon-border hover:border-neutral-300 cursor-pointer"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                            isSelected
                              ? "bg-amazon-btnPrimary border-amazon-btnPrimary"
                              : "border-amazon-border"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Product Image */}
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white border border-amazon-border flex-shrink-0">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                              <Keyboard className="w-5 h-5 text-neutral-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-medium text-amazon-text truncate">
                              {item.productName}
                            </p>
                            {isDisabled && (
                              <span className="shrink-0 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm border border-red-100">
                                Đã yêu cầu
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amazon-textMuted">
                            {tCommon("qty")}: {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.orderItemIds && (
              <p className={errorClass}>{errors.orderItemIds.message}</p>
            )}
          </div>

          {/* ── Request Type ── */}
          <div>
            <label className={labelClass}>{t("requestType")}</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {/* Type 1 */}
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value === 1 ? 0 : 1)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      field.value === 1
                        ? "border-amazon-btnPrimary bg-yellow-50"
                        : "border-amazon-border hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === 1
                            ? "border-amazon-btnPrimary"
                            : "border-amazon-border"
                        }`}
                      >
                        {field.value === 1 && (
                          <div className="w-2 h-2 rounded-full bg-amazon-btnPrimary" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-amazon-text">
                        {t("requestTypeOptions.returnAndRefund")}
                      </span>
                    </div>
                    <p className="text-xs text-amazon-textMuted mt-1 ml-7">
                      {t("requestTypeOptions.returnAndRefundDescription")}
                    </p>
                  </button>

                  {/* Type 2 */}
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value === 2 ? 0 : 2)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      field.value === 2
                        ? "border-amazon-btnPrimary bg-yellow-50"
                        : "border-amazon-border hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === 2
                            ? "border-amazon-btnPrimary"
                            : "border-amazon-border"
                        }`}
                      >
                        {field.value === 2 && (
                          <div className="w-2 h-2 rounded-full bg-amazon-btnPrimary" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-amazon-text">
                        {t("requestTypeOptions.warrantyInstantRefund")}
                      </span>
                    </div>
                    <p className="text-xs text-amazon-textMuted mt-1 ml-7">
                      {t("requestTypeOptions.warrantyInstantRefundDescription")}
                    </p>
                  </button>
                </div>
              )}
            />
            {errors.type && <p className={errorClass}>{errors.type.message}</p>}
          </div>

          {/* ── Reason ── */}
          <div>
            <label htmlFor="reason" className={labelClass}>
              {t("complaintReason")}
            </label>
            <input
              id="reason"
              type="text"
              placeholder={t("complaintReasonPlaceholder")}
              className={inputClass}
              {...register("reason")}
            />
            {errors.reason && (
              <p className={errorClass}>{errors.reason.message}</p>
            )}
          </div>

          {/* ── Description ── */}
          <div>
            <label htmlFor="description" className={labelClass}>
              {t("detailedIssueDescription")}
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder={t("detailedIssueDescriptionPlaceholder", {
                min: 10,
              })}
              className={inputClass + " resize-none"}
              {...register("description")}
            />
            {errors.description && (
              <p className={errorClass}>{errors.description.message}</p>
            )}
          </div>

          {/* ── Evidence Upload ── */}
          <div>
            <label className={labelClass}>{t("evidenceImage")}</label>
            <div className="relative">
              {previewUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-amazon-border">
                  <Image
                    src={previewUrl}
                    alt={t("evidenceImage")}
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setValue("evidenceUrl", "", { shouldValidate: true });
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-neutral-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-amazon-textMuted" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                    isUploading
                      ? "border-amazon-border bg-neutral-50"
                      : "border-amazon-border hover:border-amazon-btnPrimary hover:bg-yellow-50"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-amazon-btnPrimary animate-spin" />
                      <span className="text-sm text-amazon-textMuted">
                        {t("uploading")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-8 h-8 text-neutral-400" />
                      <span className="text-sm text-amazon-textMuted">
                        {t("clickToUploadImage")}
                      </span>
                      <span className="text-xs text-amazon-textMuted">
                        {t("imageFormatHint")}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {errors.evidenceUrl && (
              <p className={errorClass}>{errors.evidenceUrl.message}</p>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmittingWarranty}
              className="px-5 py-2.5 text-sm font-medium text-amazon-text bg-white border border-amazon-border rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmittingWarranty || isUploading}
              className="px-5 py-2.5 text-sm font-medium text-amazon-text bg-amazon-btnPrimary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmittingWarranty && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {t("sendRequest")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWarrantyModal;
