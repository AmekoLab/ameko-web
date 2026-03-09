"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, ImagePlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { submitWarrantyReturnShipment } from "@/src/store/slices/warrantySlice";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import WarrantyTimeline from "@/src/components/Warranty/WarrantyTimeline";

// ─── Zod Schema ────────────────────────────────────────────
const customerShipSchema = z.object({
  evidenceUrl: z.string().url("Vui lòng tải lên ảnh chụp hóa đơn vận chuyển"),
  comment: z.string().min(1, "Vui lòng nhập ghi chú hoặc mã vận đơn"),
});

type CustomerShipFormValues = z.infer<typeof customerShipSchema>;

// ─── Props ─────────────────────────────────────────────────
interface CustomerShipModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  onSuccess: () => void;
}

// ─── Component ─────────────────────────────────────────────
const CustomerShipModal: FC<CustomerShipModalProps> = ({
  isOpen,
  onClose,
  issueId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isSubmittingShipment } = useAppSelector((state) => state.warranty);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerShipFormValues>({
    resolver: zodResolver(customerShipSchema),
    defaultValues: {
      evidenceUrl: "",
      comment: "",
    },
  });

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

  const onSubmit = async (data: CustomerShipFormValues) => {
    try {
      await dispatch(
        submitWarrantyReturnShipment({
          issueId,
          evidenceUrl: data.evidenceUrl,
          comment: data.comment,
        }),
      ).unwrap();
      reset();
      setPreviewUrl(null);
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const error = err as string;
      toast.error(error || "Gửi thông tin thất bại");
    }
  };

  const handleClose = () => {
    if (!isSubmittingShipment && !isUploading) {
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
            Gửi Thông Tin Trả Hàng
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Subtext */}
          <p className="text-sm text-gray-500">
            Vui lòng chụp lại hóa đơn gửi hàng từ bưu cục hoặc ghi rõ mã vận đơn
            để Shop có thể đối soát.
          </p>

          {/* Timeline Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Lịch sử thao tác
            </h3>
            <WarrantyTimeline issueId={issueId} />
          </div>

          {/* ── Evidence Upload ── */}
          <div>
            <label className={labelClass}>Ảnh hóa đơn vận chuyển</label>
            <div className="relative">
              {previewUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={previewUrl}
                    alt="Shipping evidence"
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
                        Đang tải lên...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Nhấn để tải ảnh lên
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG tối đa 5MB
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

          {/* ── Comment ── */}
          <div>
            <label htmlFor="comment" className={labelClass}>
              Ghi chú / Mã vận đơn
            </label>
            <textarea
              id="comment"
              rows={4}
              placeholder="Ví dụ: Mình gửi qua Giao Hàng Tiết Kiệm, mã vận đơn là..."
              className={inputClass + " resize-none"}
              {...register("comment")}
            />
            {errors.comment && (
              <p className={errorClass}>{errors.comment.message}</p>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmittingShipment}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmittingShipment || isUploading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmittingShipment && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Gửi Minh Chứng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerShipModal;
