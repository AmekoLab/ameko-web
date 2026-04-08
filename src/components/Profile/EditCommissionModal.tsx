"use client";
import { FC, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2 } from "lucide-react";
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

      // toast.success("Cập nhật thành công!");
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
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm custom-scrollbar"
      onClick={handleClose}
    >
      <div
        className="bg-white border border-amazon-border rounded-sm w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amazon-border">
          <h3 className="text-[15px] font-black uppercase text-amazon-text tracking-widest">
            Edit Draft Request
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="E.g.: Order custom keyboard"
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
              Detailed description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe your request..."
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors resize-none placeholder-gray-400"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
                Minimum budget (VND)
              </label>
              <input
                type="number"
                {...register("minBudget", { valueAsNumber: true })}
                min={0}
                placeholder="500000"
                className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
              />
              {errors.minBudget && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.minBudget.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
                Maximum budget (VND)
              </label>
              <input
                type="number"
                {...register("maxBudget", { valueAsNumber: true })}
                min={0}
                placeholder="1000000"
                className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
              />
              {errors.maxBudget && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.maxBudget.message}
                </p>
              )}
            </div>
          </div>

          {/* SLA Response Windows */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
                Shop response window (hours)
              </label>
              <input
                type="number"
                {...register("shopResponseWindowHours", {
                  valueAsNumber: true,
                })}
                min={24}
                placeholder="72"
                className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
              />
              {errors.shopResponseWindowHours && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.shopResponseWindowHours.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
                Customer response window (hours)
              </label>
              <input
                type="number"
                {...register("customerResponseWindowHours", {
                  valueAsNumber: true,
                })}
                min={24}
                placeholder="72"
                className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
              />
              {errors.customerResponseWindowHours && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.customerResponseWindowHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-text mb-1.5">
              Reference image <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-40 rounded-sm overflow-hidden border border-amazon-border bg-neutral-100">
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
                  className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full text-amazon-text transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-amazon-border bg-neutral-50 rounded-sm py-8 flex flex-col items-center gap-2 text-neutral-400 hover:border-neutral-400 hover:text-amazon-text transition-colors disabled:opacity-50"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-4 bg-amazon-btnPrimary hover:brightness-95 disabled:opacity-50 text-amazon-text font-black uppercase tracking-widest text-[13px] rounded-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
