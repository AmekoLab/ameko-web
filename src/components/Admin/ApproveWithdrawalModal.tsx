"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { approveShopWithdrawal } from "@/src/store/slices/adminWalletSlice";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import Image from "next/image";

// ─── Zod Schema ──────────────────────────────────────────
const approveSchema = z.object({
  reason: z.string().min(1, "Please enter a reason"),
});

type ApproveFormData = z.infer<typeof approveSchema>;

// ─── Component ───────────────────────────────────────────
interface ApproveWithdrawalModalProps {
  isOpen: boolean;
  paymentId: string;
  amount: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApproveWithdrawalModal({
  isOpen,
  paymentId,
  amount,
  onClose,
  onSuccess,
}: ApproveWithdrawalModalProps) {
  const dispatch = useAppDispatch();
  const { approveLoading } = useAppSelector((state) => state.adminWallet);

  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApproveFormData>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      reason: "Transfer successful",
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl(null);

    // Upload immediately
    try {
      setUploading(true);
      const url = await uploadImage(file);
      setUploadedUrl(url);
    } catch {
      toast.error("Upload image failed. Please try again.");
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
    setUploadedUrl(null);
    onClose();
  };

  const onSubmit = async (data: ApproveFormData) => {
    if (!uploadedUrl) {
      toast.error("Please upload transfer evidence image.");
      return;
    }

    const result = await dispatch(
      approveShopWithdrawal({
        paymentId,
        data: {
          reason: data.reason,
          evidenceImageUrl: uploadedUrl,
        },
      }),
    );

    if (approveShopWithdrawal.fulfilled.match(result)) {
      handleClose();
      onSuccess?.();
    }
  };

  const isProcessing = uploading || approveLoading;

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
          <h2 className="text-lg font-bold text-amazon-text">
            Approve Withdrawal
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="px-2 py-1 text-[11px] font-medium text-amazon-textMuted rounded-sm hover:bg-neutral-50 border border-transparent hover:border-amazon-border transition-colors"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-5">
          {/* Transfer Amount Display */}
          <div className="bg-neutral-50 rounded-sm p-3 border border-amazon-border text-center flex flex-col gap-1">
            <p className="text-[11px] text-amazon-textMuted">
              Amount to transfer
            </p>
            <p className="text-lg font-bold text-green-600">
              {amount.toLocaleString("vi-VN")}₫
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-amazon-text">
              Approval reason
            </label>
            <textarea
              rows={2}
              placeholder="Enter reason..."
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

          {/* Evidence Image Upload */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-amazon-text">
              Transfer evidence image
            </label>

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-amazon-border rounded-sm py-6 flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors bg-white"
              >
                <p className="text-[11px] font-medium text-blue-600">
                  Click to upload image
                </p>
                <p className="text-[10px] text-amazon-textMuted">
                  PNG, JPG up to 5MB
                </p>
              </button>
            ) : (
              <div className="relative rounded-sm border border-amazon-border overflow-hidden bg-neutral-100 mt-2">
                <Image
                  src={imagePreview}
                  alt="Evidence preview"
                  width={500}
                  height={300}
                  className="w-full h-40 object-contain"
                />

                {/* Upload status overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium">
                      Uploading...
                    </span>
                  </div>
                )}

                {uploadedUrl && !uploading && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                    Uploaded
                  </div>
                )}

                {/* Replace button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 rounded-sm bg-white border border-amazon-border px-2 py-1 text-[10px] font-medium text-amazon-text hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  Change
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
          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 text-[11px] font-medium border border-amazon-border rounded-sm hover:bg-neutral-50 text-amazon-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !uploadedUrl}
              className="px-4 py-1.5 rounded-sm bg-green-600 border border-green-700 text-[11px] font-medium text-white transition-colors hover:bg-green-700 hover:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approveLoading ? "Processing..." : "Confirm Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
