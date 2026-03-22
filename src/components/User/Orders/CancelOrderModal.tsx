import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { toast } from "react-toastify";

const schema = z.object({
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string | null;
}

export default function CancelOrderModal({ isOpen, onClose, onSuccess, orderId }: CancelOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    if (!orderId) return;

    try {
      setLoading(true);
      const res = await orderIssueService.submitCancelRequest({
        orderId,
        reason: data.reason,
        description: data.description || "",
      });

      if (res.success) {
        toast.success("Request submitted successfully. Please wait for Shop approval.");
        reset();
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to submit cancel request");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/80 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-[#1e2126] rounded-sm w-full max-w-md p-6 relative">
        <h2 className="text-red-500 font-oswald tracking-widest text-xl uppercase mb-4">
          Cancel Order
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Please tell us why you want to cancel this order.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <input
              {...register("reason")}
              className="bg-[#1a1c20] text-white border border-[#1e2126] w-full p-2 mb-1"
              placeholder="Reason for cancellation..."
            />
            {errors.reason && (
              <p className="text-red-500 text-xs">{errors.reason.message}</p>
            )}
          </div>

          <div className="mb-6">
            <textarea
              {...register("description")}
              rows={3}
              className="bg-[#1a1c20] text-white border border-[#1e2126] w-full p-2 mb-1"
              placeholder="Additional details..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white px-4 py-2 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white font-bold px-4 py-2 hover:bg-red-700 uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
            >
              {loading && (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
