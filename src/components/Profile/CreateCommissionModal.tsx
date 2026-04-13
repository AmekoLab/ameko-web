"use client";
import { FC, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2, AlertTriangle } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/index";
import { createCommissionRequest } from "@/src/store/slices/commissionSlice";
import { uploadImage } from "@/src/utils/uploadImage";
import { toast } from "react-toastify";
import Image from "next/image";

const commissionSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty"),
    layout: z.string().min(1, "Please specify a layout"),
    switchPref: z.string().min(1, "Please specify switch preferences"),
    keycapPref: z.string().min(1, "Please specify keycap preferences"),
    casePlatePref: z.string().min(1, "Please specify case & plate preferences"),
    additionalNotes: z.string().optional(),
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
  const [submitType, setSubmitType] = useState<"draft" | "send">("send");

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
      layout: "",
      switchPref: "",
      keycapPref: "",
      casePlatePref: "",
      additionalNotes: "",
      quantity: 1,
      minBudget: 0,
      maxBudget: 0,
      referenceImages: "",
      shopResponseWindowHours: 72,
      customerResponseWindowHours: 72,
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
      toast.error("Upload image failed, please try again");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CommissionFormData) => {
    const isDraft = submitType === "draft";

    // Compile the detailed description
    const compiledDescription = `
Layout: ${data.layout}
Switch Preferences: ${data.switchPref}
Keycap Preferences: ${data.keycapPref}
Case & Plate: ${data.casePlatePref}
Additional Notes: ${data.additionalNotes || "None"}
    `.trim();

    try {
      await dispatch(
        createCommissionRequest({
          ...(targetedShopId ? { targetedShopId } : {}),
          title: data.title,
          description: compiledDescription,
          referenceImages: data.referenceImages,
          minBudget: data.minBudget,
          maxBudget: data.maxBudget,
          quantity: data.quantity,
          isDraft,
          shopResponseWindowHours: data.shopResponseWindowHours,
          customerResponseWindowHours: data.customerResponseWindowHours,
        }),
      ).unwrap();

      toast.success(isDraft ? "Saved as draft!" : "Request sent successfully!");
      reset();
      setPreviewUrl(null);
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to send request");
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
            {targetedShopId
              ? "Send Quotation Request"
              : "Post Public Request"}
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
             {targetedShopId ? "Send Request" : "Post to Market"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Layout */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Layout Preference <span className="text-red-500">*</span>
              </label>
              <select
                {...register("layout")}
                className={`w-full border ${errors.layout ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors appearance-none cursor-pointer`}
              >
                <option value="">Select layout</option>
                <option value="60%">60%</option>
                <option value="65%">65%</option>
                <option value="75%">75%</option>
                <option value="TKL (80%)">TKL (80%)</option>
                <option value="Full-size (100%)">Full-size (100%)</option>
                <option value="Alice/Arisu">Alice/Arisu</option>
                <option value="Other">Other</option>
              </select>
              {errors.layout && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> {errors.layout.message}
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
                className={`w-full border ${errors.quantity ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-neutral-200 pb-2">Component Details</h4>
            {/* Switch Preferences */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Switches <span className="text-red-500">*</span>
              </label>
              <input
                {...register("switchPref")}
                placeholder="e.g., Thocky linear, tactile, silent, etc."
                className={`w-full border ${errors.switchPref ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.switchPref && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {errors.switchPref.message}</p>
              )}
            </div>

            {/* Keycap Preferences */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Keycaps <span className="text-red-500">*</span>
              </label>
              <input
                {...register("keycapPref")}
                placeholder="e.g., Cherry profile, PBT material, dark colors"
                className={`w-full border ${errors.keycapPref ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.keycapPref && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {errors.keycapPref.message}</p>
              )}
            </div>

            {/* Case & Plate */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Case & Plate <span className="text-red-500">*</span>
              </label>
              <input
                {...register("casePlatePref")}
                placeholder="e.g., Aluminum case (black), FR4 plate"
                className={`w-full border ${errors.casePlatePref ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.casePlatePref && (
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {errors.casePlatePref.message}</p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Additional Notes
            </label>
            <textarea
              {...register("additionalNotes")}
              rows={2}
              placeholder="Any other specific requirements?"
              className="w-full border border-neutral-200 bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors resize-none placeholder-neutral-400"
            />
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
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {errors.minBudget.message}</p>
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.maxBudget.message}
                </p>
              )}
            </div>
          </div>

          {/* SLA Response Windows */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Shop response window (hours)
              </label>
              <input
                type="number"
                {...register("shopResponseWindowHours", { valueAsNumber: true })}
                min={24}
                placeholder="72"
                className={`w-full border ${errors.shopResponseWindowHours ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.shopResponseWindowHours && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.shopResponseWindowHours.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Customer response window (hours)
              </label>
              <input
                type="number"
                {...register("customerResponseWindowHours", { valueAsNumber: true })}
                min={24}
                placeholder="72"
                className={`w-full border ${errors.customerResponseWindowHours ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"} bg-white text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
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
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
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
                <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {errors.referenceImages.message}</p>
              )}
          </div>

          {/* Submit Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-neutral-100 sticky bottom-0 bg-white shadow-[0_-12px_12px_-12px_rgba(0,0,0,0.05)]">
            <button
              type="submit"
              disabled={isBusy}
              onClick={() => setSubmitType("draft")}
              className="w-full py-3.5 bg-white hover:bg-neutral-50 disabled:bg-white/50 text-neutral-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 border border-neutral-200 shadow-sm active:scale-[0.98]"
            >
              {isSubmitting && submitType === "draft" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </button>
            <button
              type="submit"
              disabled={isBusy}
              onClick={() => setSubmitType("send")}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-800/50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting && submitType === "send" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : targetedShopId ? (
                "Send Request"
              ) : (
                "Post to Pool"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
