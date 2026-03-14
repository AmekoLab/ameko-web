"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { approveShopWithdrawal } from "@/src/store/slices/adminWalletSlice";
import { X, Loader2, Upload, ImageIcon, CheckCircle } from "lucide-react";
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
      toast.error("Tải ảnh lên thất bại. Vui lòng thử lại.");
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
      toast.error("Vui lòng tải lên ảnh minh chứng chuyển khoản.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-black font-oswald">
              Approve withdrawal request
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Transfer Amount Display */}
          <div className="bg-red-50 rounded-xl p-5 text-center border border-red-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-oswald mb-1">
              Amount to transfer
            </p>
            <p className="text-3xl font-black text-[#ce2a32] font-oswald">
              {amount.toLocaleString("vi-VN")}
              <span className="text-base ml-1">₫</span>
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Approval reason
            </label>
            <textarea
              rows={3}
              placeholder="Enter reason..."
              className={`w-full border-2 rounded-lg p-3 outline-none transition-all resize-none ${
                errors.reason
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-black"
              }`}
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Evidence Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transfer evidence image
            </label>

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </button>
            ) : (
              <div className="relative rounded-xl border-2 border-gray-200 overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Evidence preview"
                  width={500}
                  height={300}
                  className="w-full h-48 object-contain bg-gray-50"
                />

                {/* Upload status overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </div>
                  </div>
                )}

                {uploadedUrl && !uploading && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}

                {/* Replace button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white transition-colors shadow-sm border border-gray-200"
                >
                  <ImageIcon className="h-3.5 w-3.5 inline mr-1" />
                  Change image
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
          <button
            type="submit"
            disabled={isProcessing || !uploadedUrl}
            className="w-full rounded-lg bg-green-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-oswald flex items-center justify-center gap-2"
          >
            {approveLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {approveLoading ? "Processing..." : "Confirm approval"}
          </button>
        </form>
      </div>
    </div>
  );
}
