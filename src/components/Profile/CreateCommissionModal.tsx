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
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    quantity: z.number().min(1, "Minimum quantity is 1"),
    minBudget: z.number().min(0, "Minimum budget must be >= 0"),
    maxBudget: z.number().min(0, "Maximum budget must be >= 0"),
    referenceImages: z.string().min(1, "Please upload a reference image"),
  })
  .refine((data) => data.maxBudget > data.minBudget, {
    message: "Maximum budget must be greater than minimum budget",
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
      className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-[#151515] border border-[#1e2126] rounded-sm w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2126]">
          <h3 className="text-[15px] font-black uppercase text-white tracking-widest">
            {targetedShopId
              ? "Send quotation request"
              : "Post request to Public Market"}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#202030] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Title <span className="text-[#ce2a32]">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="E.g.: Order custom keyboard"
              className="w-full border border-[#1e2126] bg-[#151515] text-white rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#f5d800] focus:border-[#f5d800] transition-colors"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Detailed description <span className="text-[#ce2a32]">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe your request..."
              className="w-full border border-[#1e2126] bg-[#151515] text-white rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#f5d800] focus:border-[#f5d800] transition-colors resize-none placeholder-gray-600"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Quantity <span className="text-[#ce2a32]">*</span>
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              className="w-full border border-[#1e2126] bg-[#151515] text-white rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#f5d800] focus:border-[#f5d800] transition-colors"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Minimum budget (VND)
              </label>
              <input
                type="number"
                {...register("minBudget", { valueAsNumber: true })}
                min={0}
                placeholder="500000"
                className="w-full border border-[#1e2126] bg-[#151515] text-white rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#f5d800] focus:border-[#f5d800] transition-colors"
              />
              {errors.minBudget && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.minBudget.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Maximum budget (VND)
              </label>
              <input
                type="number"
                {...register("maxBudget", { valueAsNumber: true })}
                min={0}
                placeholder="1000000"
                className="w-full border border-[#1e2126] bg-[#151515] text-white rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#f5d800] focus:border-[#f5d800] transition-colors"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Reference image <span className="text-[#ce2a32]">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-40 rounded-sm overflow-hidden border border-[#1e2126] bg-[#0f0f0f]">
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
                className="w-full border border-dashed border-gray-600 bg-[#202030] rounded-sm py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
                <span className="text-sm">
                  {isUploading ? "Uploading..." : "Click to select image"}
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
            className="w-full py-4 bg-[#f5d800] hover:bg-[#e6ca00] disabled:bg-[#f5d800]/50 text-black font-black uppercase tracking-widest text-[13px] rounded-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
