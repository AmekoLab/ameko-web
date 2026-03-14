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
      className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            Submit Quote
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Quoted Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quoted Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("quotedPrice", { valueAsNumber: true })}
                min={0}
                placeholder="1000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                VND
              </span>
            </div>
            {errors.quotedPrice && (
              <p className="text-xs text-red-500 mt-1">
                {errors.quotedPrice.message}
              </p>
            )}
          </div>

          {/* Estimated Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Days <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("estimatedDays", { valueAsNumber: true })}
                min={1}
                placeholder="7"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                Days
              </span>
            </div>
            {errors.estimatedDays && (
              <p className="text-xs text-red-500 mt-1">
                {errors.estimatedDays.message}
              </p>
            )}
          </div>

          {/* Shop Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes for Customer <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("shopNotes")}
              rows={4}
              placeholder="Describe quote details, time, materials..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.shopNotes && (
              <p className="text-xs text-red-500 mt-1">
                {errors.shopNotes.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuote}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
