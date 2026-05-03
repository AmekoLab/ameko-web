"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Wallet } from "lucide-react";
import { walletService } from "@/src/services/wallet.service";
import { toast } from "react-hot-toast";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [loading, setLoading] = useState(false);

  const depositSchema = z.object({
    amount: z
      .number({ error: "Please enter a valid amount" })
      .min(10000, "Minimum deposit is 10,000 VND")
      .max(100000000, "Maximum deposit is 100,000,000 VND"),
  });

  type DepositFormData = z.infer<typeof depositSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: DepositFormData) => {
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      
      const res = await walletService.deposit({
        amount: data.amount,
        successUrl: `${origin}/wallet/deposit/success`,
        cancelUrl: `${origin}/wallet`,
      });

      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.message || "Failed to initiate deposit");
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-sm shadow-xl border border-amazon-border w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-amazon-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-amazon-text">
              Deposit Funds
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-sm hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-amazon-textMuted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-amazon-text mb-2">
              Amount (VND)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 500000"
                className={`w-full border rounded-sm p-3 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  errors.amount
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-amazon-border focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus"
                }`}
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-blue-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-blue-700 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
