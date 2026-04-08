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
  evidenceUrl: z.string().url("Please upload a photo of the shipping invoice"),
  comment: z.string().min(1, "Please enter a note or tracking code"),
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
      toast.error("Upload failed, please try again");
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
      toast.error(error || "Failed to submit return information");
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
    "w-full rounded-lg border border-amazon-border px-3 py-2.5 text-sm text-amazon-text placeholder-neutral-400 focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-amazon-text mb-1.5";
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
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-amazon-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-amazon-text">
            Submit Return Information
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-amazon-textMuted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Subtext */}
          <p className="text-sm text-amazon-textMuted">
            Please take a photo of the shipping invoice from the post office or
            clearly write the tracking code so the Shop can verify.
          </p>

          {/* Timeline Section */}
          <div className="border border-amazon-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amazon-text mb-3 uppercase tracking-wide">
              Action history
            </h3>
            <WarrantyTimeline issueId={issueId} />
          </div>

          {/* ── Evidence Upload ── */}
          <div>
            <label className={labelClass}>Shipping invoice image</label>
            <div className="relative">
              {previewUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-amazon-border">
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
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-neutral-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-amazon-textMuted" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                    isUploading
                      ? "border-amazon-border bg-neutral-50"
                      : "border-amazon-border hover:border-amazon-btnPrimary hover:bg-yellow-50"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-amazon-btnPrimary animate-spin" />
                      <span className="text-sm text-amazon-textMuted">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-8 h-8 text-neutral-400" />
                      <span className="text-sm text-amazon-textMuted">
                        Click to upload image
                      </span>
                      <span className="text-xs text-amazon-textMuted">
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

          {/* ── Comment ── */}
          <div>
            <label htmlFor="comment" className={labelClass}>
              Note / Tracking code
            </label>
            <textarea
              id="comment"
              rows={4}
              placeholder="E.g.: I shipped via Giao Hàng Tiết Kiệm, tracking code is..."
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
              className="px-5 py-2.5 text-sm font-medium text-amazon-text bg-white border border-amazon-border rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingShipment || isUploading}
              className="px-5 py-2.5 text-sm font-medium text-amazon-text bg-amazon-btnPrimary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmittingShipment && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Submit Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerShipModal;
