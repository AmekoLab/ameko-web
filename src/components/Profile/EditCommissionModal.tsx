"use client";
import { FC, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2, AlertTriangle } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/index";
import { updateCommissionRequestThunk } from "@/src/store/slices/commissionSlice";
import { CommissionRequest } from "@/src/types/commission.types";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import Image from "next/image";

const editSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    quantity: z.number().min(1, "Minimum quantity is 1"),
    minBudget: z.number().min(0, "Minimum budget must be >= 0"),
    maxBudget: z.number().min(0, "Maximum budget must be >= 0"),
    referenceImages: z.string().min(1, "Please upload a reference image"),
    shopResponseWindowHours: z.number().min(24),
    customerResponseWindowHours: z.number().min(24),
  })
  .refine((data) => data.maxBudget > data.minBudget, {
    message: "Maximum budget must be greater than minimum budget",
    path: ["maxBudget"],
  });

type EditFormData = z.infer<typeof editSchema>;

interface EditCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CommissionRequest;
}

export const EditCommissionModal: FC<EditCommissionModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    request.referenceImages || null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: request.title,
      description: request.description,
      quantity: request.quantity,
      minBudget: request.minBudget,
      maxBudget: request.maxBudget,
      referenceImages: request.referenceImages,
      shopResponseWindowHours: request.shopResponseWindowHours ?? 72,
      customerResponseWindowHours: request.customerResponseWindowHours ?? 72,
    },
  });

  // Re-sync form when `request` prop changes (e.g. after a refetch)
  useEffect(() => {
    reset({
      title: request.title,
      description: request.description,
      quantity: request.quantity,
      minBudget: request.minBudget,
      maxBudget: request.maxBudget,
      referenceImages: request.referenceImages,
      shopResponseWindowHours: request.shopResponseWindowHours ?? 72,
      customerResponseWindowHours: request.customerResponseWindowHours ?? 72,
    });
    setPreviewUrl(request.referenceImages || null);
  }, [request, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setValue("referenceImages", url, { shouldValidate: true });
      setPreviewUrl(url);
    } catch {
      toast.error("Upload failed, please try again");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      await dispatch(
        updateCommissionRequestThunk({
          id: request.commissionRequestId,
          payload: {
            title: data.title,
            description: data.description,
            referenceImages: data.referenceImages,
            minBudget: data.minBudget,
            maxBudget: data.maxBudget,
            quantity: data.quantity,
            shopResponseWindowHours: data.shopResponseWindowHours,
            customerResponseWindowHours: data.customerResponseWindowHours,
          },
        }),
      ).unwrap();

      // toast.success("Update successfully!");
      onClose();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Update failed");
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const isBusy = isSubmitting || isUploading;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm custom-scrollbar"
      onClick={handleClose}
    >
      <div
        className="bg-white border border-neutral-100 rounded-2xl w-full max-w-[560px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white sticky top-0 z-10 hidden sm:flex">
          <h3 className="text-lg font-semibold text-neutral-900">
            Edit Draft Request
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded-lg transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile Header (Shows only on small screens) */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 sm:hidden bg-white">
           <h3 className="text-lg font-semibold text-neutral-900">
             Edit Draft Request
           </h3>
           <button onClick={handleClose} className="p-1 text-neutral-400 bg-neutral-50 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Request Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="E.g.: Custom Alice Build with Oil Kings"
              className={`w-full border ${errors.title ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3"/> {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe your request..."
              className={`w-full flex-1 min-h-[140px] border ${errors.description ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors resize-y placeholder-neutral-400 leading-relaxed`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3"/> {errors.description.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              className={`w-full border ${errors.quantity ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors w-full sm:w-1/2`}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3"/> {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Budget Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 border-t border-neutral-100 pt-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Min Budget (VND)
              </label>
              <input
                type="number"
                {...register("minBudget", { valueAsNumber: true })}
                min={0}
                placeholder="500000"
                className={`w-full border ${errors.minBudget ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.minBudget && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> {errors.minBudget.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Max Budget (VND)
              </label>
              <input
                type="number"
                {...register("maxBudget", { valueAsNumber: true })}
                min={0}
                placeholder="1000000"
                className={`w-full border ${errors.maxBudget ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.maxBudget && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> {errors.maxBudget.message}
                </p>
              )}
            </div>
          </div>

          {/* SLA Response Windows */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Shop Response Window (hrs)
              </label>
              <input
                type="number"
                {...register("shopResponseWindowHours", {
                  valueAsNumber: true,
                })}
                min={24}
                placeholder="72"
                className={`w-full border ${errors.shopResponseWindowHours ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.shopResponseWindowHours && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> {errors.shopResponseWindowHours.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Client Response Window (hrs)
              </label>
              <input
                type="number"
                {...register("customerResponseWindowHours", {
                  valueAsNumber: true,
                })}
                min={24}
                placeholder="72"
                className={`w-full border ${errors.customerResponseWindowHours ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.customerResponseWindowHours && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> {errors.customerResponseWindowHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Reference Image <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-inner group">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setValue("referenceImages", "", { shouldValidate: true });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 rounded-full text-neutral-600 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed ${errors.referenceImages ? "border-red-300 bg-red-50 hover:border-red-400" : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100"} rounded-2xl py-10 flex flex-col items-center gap-2 text-neutral-500 transition-colors disabled:opacity-50`}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                ) : (
                  <Upload className={`w-8 h-8 ${errors.referenceImages ? "text-red-400" : "text-neutral-400"}`} />
                )}
                <span className={`text-sm font-medium ${errors.referenceImages ? "text-red-600" : ""}`}>
                  {isUploading ? "Uploading image..." : "Click to select image"}
                </span>
              </button>
            )}
            {errors.referenceImages && (
              <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3"/> {errors.referenceImages.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-6 border-t border-neutral-100 sticky bottom-0 bg-white shadow-[0_-12px_12px_-12px_rgba(0,0,0,0.05)]">
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
