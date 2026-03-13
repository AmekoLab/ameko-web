"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Keyboard, ImagePlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { submitWarrantyRequest } from "@/src/store/slices/warrantySlice";
import { PaymentHistoryOrderItem } from "@/src/types/order.types";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";

// ─── Zod Schema ────────────────────────────────────────────
const warrantySchema = z.object({
  orderItemIds: z.array(z.string()).min(1, "Please select at least 1 product"),
  type: z.number().refine((v) => v === 1 || v === 2, {
    message: "Please select request type",
  }),
  reason: z.string().min(1, "Please enter a reason"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidenceUrl: z.string().url("Please upload evidence image"),
});

type WarrantyFormValues = z.infer<typeof warrantySchema>;

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
  const { isSubmittingWarranty } = useAppSelector((state) => state.warranty);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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

  const selectedItemIds = watch("orderItemIds");

  const toggleItem = (id: string) => {
    const current = selectedItemIds || [];
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
      toast.error("Tải ảnh lên thất bại, vui lòng thử lại");
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
      const error = err as string;
      toast.error(error || "Gửi yêu cầu thất bại");
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
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
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
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">
            Warranty / Return Request
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* ── Product Selection ── */}
          <div>
            <label className={labelClass}>Select problematic product</label>
            <Controller
              name="orderItemIds"
              control={control}
              render={() => (
                <div className="space-y-2">
                  {availableItems.map((item) => {
                    const isSelected = selectedItemIds?.includes(
                      item.orderItemId,
                    );
                    return (
                      <button
                        key={item.orderItemId}
                        type="button"
                        onClick={() => toggleItem(item.orderItemId)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
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
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Keyboard className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} ×{" "}
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
            <label className={labelClass}>Request type</label>
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
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === 1
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {field.value === 1 && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Return &amp; Refund
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      Request to return the physical product to the Shop before
                      receiving a refund.
                    </p>
                  </button>

                  {/* Type 2 */}
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value === 2 ? 0 : 2)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      field.value === 2
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === 2
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {field.value === 2 && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Warranty / Instant Refund
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      No return required. Suitable for minor compensation or
                      private agreement.
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
              Complaint reason
            </label>
            <input
              id="reason"
              type="text"
              placeholder="E.g.: Product has key defect"
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
              Detailed issue description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the issue in detail (at least 10 characters)..."
              className={inputClass + " resize-none"}
              {...register("description")}
            />
            {errors.description && (
              <p className={errorClass}>{errors.description.message}</p>
            )}
          </div>

          {/* ── Evidence Upload ── */}
          <div>
            <label className={labelClass}>Evidence image</label>
            <div className="relative">
              {previewUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={previewUrl}
                    alt="Evidence"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setValue("evidenceUrl", "", { shouldValidate: true });
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                    isUploading
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="text-sm text-gray-500">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Click to upload image
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG up to 5MB
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
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingWarranty || isUploading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmittingWarranty && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWarrantyModal;
