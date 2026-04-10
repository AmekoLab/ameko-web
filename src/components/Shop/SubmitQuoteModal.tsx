"use client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import { submitCommissionQuote } from "@/src/store/slices/commissionSlice";

const quoteSchema = z.object({
  quotedPrice: z.number().gt(0, "Invalid quoted price"),
  estimatedDays: z.number().min(1, "Estimated days must be at least 1"),
  shopNotes: z.string().min(10, "Please enter detailed notes for the customer"),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface SubmitQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  onSuccess: () => void;
}

export const SubmitQuoteModal: FC<SubmitQuoteModalProps> = ({
  isOpen,
  onClose,
  requestId,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmittingQuote } = useSelector(
    (state: RootState) => state.commission,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quotedPrice: 0,
      estimatedDays: 1,
      shopNotes: "",
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await dispatch(
        submitCommissionQuote({
          requestId,
          payload: {
            quotedPrice: data.quotedPrice,
            estimatedDays: data.estimatedDays,
            shopNotes: data.shopNotes,
          },
        }),
      ).unwrap();

      reset();
      onClose();
      onSuccess();
    } catch {
      // toast already handled in thunk
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-sm border border-amazon-border w-full max-w-[480px] shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amazon-border">
          <h3 className="text-lg font-bold text-amazon-text">
            Submit Quote
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-50 rounded-sm transition-colors text-amazon-textMuted hover:text-amazon-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Quoted Price */}
          <div>
            <label className="block text-[13px] font-medium text-amazon-text mb-1">
              Quoted Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("quotedPrice", { valueAsNumber: true })}
                min={0}
                placeholder="1000000"
                className="w-full px-3 py-2 pr-14 border border-amazon-border rounded-sm text-[13px] font-medium text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition placeholder:text-neutral-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400 font-medium">
                VND
              </span>
            </div>
            {errors.quotedPrice && (
              <p className="text-[11px] font-medium text-red-500 mt-1">
                {errors.quotedPrice.message}
              </p>
            )}
          </div>

          {/* Estimated Days */}
          <div>
            <label className="block text-[13px] font-medium text-amazon-text mb-1">
              Estimated Days <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("estimatedDays", { valueAsNumber: true })}
                min={1}
                placeholder="7"
                className="w-full px-3 py-2 pr-14 border border-amazon-border rounded-sm text-[13px] font-medium text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition placeholder:text-neutral-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400 font-medium">
                Days
              </span>
            </div>
            {errors.estimatedDays && (
              <p className="text-[11px] font-medium text-red-500 mt-1">
                {errors.estimatedDays.message}
              </p>
            )}
          </div>

          {/* Shop Notes */}
          <div>
            <label className="block text-[13px] font-medium text-amazon-text mb-1">
              Notes for Customer <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("shopNotes")}
              rows={4}
              placeholder="Describe quote details, time, materials..."
              className="w-full px-3 py-2 border border-amazon-border rounded-sm text-[13px] font-medium text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition placeholder:text-neutral-400 resize-none"
            />
            {errors.shopNotes && (
              <p className="text-[11px] font-medium text-red-500 mt-1">
                {errors.shopNotes.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-5 border-t border-amazon-border mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuote}
              className="px-5 py-2 text-[13px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-border rounded-sm hover:brightness-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isSubmittingQuote ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                "Submit Quote"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
