"use client";

import { FC, useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, ImagePlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateWarranty } from "@/src/store/slices/warrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";

// ─── Zod Schema ────────────────────────────────────────────
const updateWarrantySchema = z.object({
  type: z.number().refine((v) => v === 0 || v === 1 || v === 2, {
    message: "Please select request type",
  }),
  reason: z.string().min(1, "Please enter a reason"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidenceUrl: z.string().url("Please upload evidence image"),
});

type UpdateWarrantyFormValues = z.infer<typeof updateWarrantySchema>;

// ─── Props ─────────────────────────────────────────────────
interface UpdateWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: WarrantyRequest | null;
  onSuccess: () => void;
}

// ─── Helpers ───────────────────────────────────────────────
const stripItemsPrefix = (desc: string): string =>
  desc.replace(/^\[Items:[^\]]*\]\s*/, "");

// ─── Component ─────────────────────────────────────────────
const UpdateWarrantyModal: FC<UpdateWarrantyModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isUpdatingWarranty } = useAppSelector((state) => state.warranty);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateWarrantyFormValues>({
    resolver: zodResolver(updateWarrantySchema),
    defaultValues: {
      type: 0,
      reason: "",
      description: "",
      evidenceUrl: "",
    },
  });

  // Reset form with issue values when modal opens
  useEffect(() => {
    if (isOpen && issue) {
      const cleanDescription = stripItemsPrefix(issue.description || "");
      reset({
        type: issue.type,
        reason: issue.reason,
        description: cleanDescription,
        evidenceUrl: issue.evidenceUrl || "",
      });
      setPreviewUrl(issue.evidenceUrl || null);
    }
  }, [isOpen, issue, reset]);

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

  const onSubmit = async (data: UpdateWarrantyFormValues) => {
    if (!issue) return;
    try {
      await dispatch(
        updateWarranty({
          issueId: issue.id,
          payload: {
            type: data.type,
            reason: data.reason,
            description: data.description,
            evidenceUrl: data.evidenceUrl,
          },
        }),
      ).unwrap();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const error = err as string;
      toast.error(error || "Cập nhật yêu cầu thất bại");
    }
  };

  const handleClose = () => {
    if (!isUpdatingWarranty && !isUploading) {
      reset();
      setPreviewUrl(null);
      onClose();
    }
  };

  if (!isOpen || !issue) return null;

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
            Update warranty request
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* ── Request Type ── */}
          <div>
            <label className={labelClass}>Request type</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {/* Type 0 — Cancel */}
                  {/* <button
                    type="button"
                    onClick={() => field.onChange(field.value === 0 ? -1 : 0)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      field.value === 0
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === 0
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {field.value === 0 && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Hủy đơn hàng
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      Yêu cầu hủy đơn và hoàn tiền ngay.
                    </p>
                  </button> */}

                  {/* Type 1 — Return & Refund */}
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value === 1 ? -1 : 1)}
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

                  {/* Type 2 — Warranty Claim */}
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value === 2 ? -1 : 2)}
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
              disabled={isUpdatingWarranty}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingWarranty || isUploading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isUpdatingWarranty && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateWarrantyModal;
