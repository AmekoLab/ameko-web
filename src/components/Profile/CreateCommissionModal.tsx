"use client";
import { FC, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/index";
import { createCommissionRequest } from "@/src/store/slices/commissionSlice";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import Image from "next/image";

const commissionSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().min(1, "Mô tả không được để trống"),
    quantity: z.number().min(1, "Số lượng tối thiểu là 1"),
    minBudget: z.number().min(0, "Ngân sách tối thiểu phải >= 0"),
    maxBudget: z.number().min(0, "Ngân sách tối đa phải >= 0"),
    referenceImages: z.string().min(1, "Vui lòng tải lên ảnh tham khảo"),
  })
  .refine((data) => data.maxBudget > data.minBudget, {
    message: "Ngân sách tối đa phải lớn hơn ngân sách tối thiểu",
    path: ["maxBudget"],
  });

type CommissionFormData = z.infer<typeof commissionSchema>;

interface CreateCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetedShopId?: string;
  onSuccess?: () => void;
}

export const CreateCommissionModal: FC<CreateCommissionModalProps> = ({
  isOpen,
  onClose,
  targetedShopId,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommissionFormData>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      title: "",
      description: "",
      quantity: 1,
      minBudget: 0,
      maxBudget: 0,
      referenceImages: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setValue("referenceImages", url, { shouldValidate: true });
      setPreviewUrl(url);
    } catch {
      toast.error("Upload ảnh thất bại, vui lòng thử lại");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CommissionFormData) => {
    try {
      await dispatch(
        createCommissionRequest({
          ...(targetedShopId ? { targetedShopId } : {}),
          title: data.title,
          description: data.description,
          referenceImages: data.referenceImages,
          minBudget: data.minBudget,
          maxBudget: data.maxBudget,
          quantity: data.quantity,
        }),
      ).unwrap();

      toast.success("Gửi yêu cầu thành công!");
      reset();
      setPreviewUrl(null);
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Gửi yêu cầu thất bại");
    }
  };

  const handleClose = () => {
    reset();
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  const isBusy = isSubmitting || isUploading;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {targetedShopId
              ? "Gửi yêu cầu báo giá"
              : "Đăng yêu cầu lên Chợ chung"}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="VD: Đặt bàn phím custom"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Mô tả yêu cầu của bạn..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Budget Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngân sách tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                {...register("minBudget", { valueAsNumber: true })}
                min={0}
                placeholder="500000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.minBudget && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.minBudget.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngân sách tối đa (VNĐ)
              </label>
              <input
                type="number"
                {...register("maxBudget", { valueAsNumber: true })}
                min={0}
                placeholder="1000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.maxBudget && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.maxBudget.message}
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh tham khảo <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setValue("referenceImages", "", { shouldValidate: true });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
                <span className="text-sm">
                  {isUploading ? "Đang tải lên..." : "Nhấn để chọn ảnh"}
                </span>
              </button>
            )}
            {errors.referenceImages && (
              <p className="text-xs text-red-500 mt-1">
                {errors.referenceImages.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isBusy}
            className="w-full bg-[#ce2a32] hover:bg-[#b02028] text-white font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
              </>
            ) : (
              "Gửi yêu cầu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
