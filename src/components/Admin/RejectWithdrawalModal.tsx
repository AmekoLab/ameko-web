"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { rejectShopWithdrawal } from "@/src/store/slices/adminWalletSlice";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

// ─── Zod Schema ──────────────────────────────────────────
const createRejectSchema = (t: (key: string) => string) =>
  z.object({
    reason: z.string().min(1, t("validationReasonRequired")),
  });

type RejectFormData = z.infer<ReturnType<typeof createRejectSchema>>;

// ─── Component ───────────────────────────────────────────
interface RejectWithdrawalModalProps {
  isOpen: boolean;
  paymentId: string;
  amount: number;
  shopName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RejectWithdrawalModal({
  isOpen,
  paymentId,
  amount,
  shopName,
  onClose,
  onSuccess,
}: RejectWithdrawalModalProps) {
  const t = useTranslations("RejectWithdrawalModal");
  const locale = useLocale();
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";

  const dispatch = useAppDispatch();
  const { rejectLoading } = useAppSelector((state) => state.adminWallet);
  const rejectSchema = useMemo(() => createRejectSchema(t), [t]);

  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl("");

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setUploadedUrl(url);
    } catch {
      toast.error(t("toastUploadFailed"));
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    reset();
    setImageFile(null);
    setImagePreview(null);
    setUploadedUrl("");
    onClose();
  };

  const onSubmit = async (data: RejectFormData) => {
    const result = await dispatch(
      rejectShopWithdrawal({
        paymentId,
        data: {
          reason: data.reason,
          evidenceImageUrl: uploadedUrl,
        },
      }),
    );

    if (rejectShopWithdrawal.fulfilled.match(result)) {
      handleClose();
      onSuccess?.();
    }
  };

  const isProcessing = uploading || rejectLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-md shadow-xl w-full max-w-lg border border-amazon-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amazon-border bg-white">
          <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="px-2 py-1 text-[11px] font-medium text-amazon-textMuted rounded-sm hover:bg-neutral-50 border border-transparent hover:border-amazon-border transition-colors"
          >
            {t("close")}
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Shop & Amount Info */}
          <div className="bg-neutral-50 rounded-sm p-3 border border-amazon-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amazon-textMuted">
                  {t("shopLabel")}
                </p>
                <p className="text-[11px] font-bold text-amazon-text">
                  {shopName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-amazon-textMuted">
                  {t("amountLabel")}
                </p>
                <p className="text-lg font-bold text-red-600">
                  {amount.toLocaleString(numberLocale)}₫
                </p>
              </div>
            </div>
          </div>

          {/* Auto-refund Warning Banner */}
          <div className="flex flex-col gap-0.5 bg-yellow-50 border border-yellow-200 rounded-sm p-3">
            <p className="text-[11px] font-bold text-yellow-800">
              {t("autoRefundTitle")}
            </p>
            <p className="text-[10px] text-yellow-700">
              {t("autoRefundDescription")}
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-amazon-text">
              {t("reasonForRejection")} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder={t("reasonPlaceholder")}
              className={`w-full border rounded-sm p-2 outline-none transition-colors resize-none text-[11px] text-amazon-text ${
                errors.reason
                  ? "border-red-400 focus:border-red-500"
                  : "border-amazon-border focus:border-amazon-btnPrimary"
              }`}
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-[10px] text-red-500">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Evidence Image Upload (optional) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-amazon-text">
                {t("evidenceImage")}
              </label>
              <span className="text-[10px] text-amazon-textMuted">
                {t("optional")}
              </span>
            </div>

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-amazon-border rounded-sm py-6 flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors bg-white"
              >
                <p className="text-[11px] font-medium text-blue-600">
                  {t("clickToUploadImage")}
                </p>
                <p className="text-[10px] text-amazon-textMuted">
                  {t("uploadHint")}
                </p>
              </button>
            ) : (
              <div className="relative rounded-sm border border-amazon-border overflow-hidden bg-neutral-100 mt-2">
                <Image
                  src={imagePreview}
                  alt={t("evidencePreviewAlt")}
                  width={500}
                  height={300}
                  className="w-full h-40 object-contain"
                />

                {/* Upload status overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium">
                      {t("uploading")}
                    </span>
                  </div>
                )}

                {uploadedUrl && !uploading && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                    {t("uploaded")}
                  </div>
                )}

                {/* Replace button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 rounded-sm bg-white border border-amazon-border px-2 py-1 text-[10px] font-medium text-amazon-text hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  {t("change")}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-amazon-border flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 text-[11px] font-medium border border-amazon-border rounded-sm hover:bg-neutral-50 text-amazon-text transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-sm bg-red-600 border border-red-700 text-[11px] font-medium text-white transition-colors hover:bg-red-700 hover:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejectLoading ? t("processing") : t("rejectAndRefund")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
