"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { createPromotionVoucherThunk } from "@/src/store/slices/voucherSlice";
import {
  DiscountType,
  VoucherType,
  StackingPolicy,
} from "@/src/services/voucher.service";

// ─── Zod Schema ──────────────────────────────────────────

const createVoucherSchema = z
  .object({
    code: z
      .string()
      .min(1, "Voucher code cannot be empty")
      .max(30, "Maximum 30 characters"),
    name: z.string().min(1, "Voucher name cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    discountType: z.string().min(1, "Select discount type"),
    value: z.string().min(1, "Value cannot be empty"),
    maxDiscountAmount: z.string().optional(),
    minOrderValue: z.string().min(1, "Cannot be empty"),
    usageLimit: z.string().min(1, "Cannot be empty"),
    startDate: z.string().min(1, "Select start date"),
    endDate: z.string().min(1, "Select end date"),
    allowStacking: z.boolean(),
  })
  .refine(
    (data) => {
      const val = Number(data.value);
      if (isNaN(val) || val <= 0) return false;
      if (Number(data.discountType) === DiscountType.Percentage && val > 100)
        return false;
      return true;
    },
    {
      message: "Invalid value (percentage max 100%)",
      path: ["value"],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    { message: "End date must be after start date", path: ["endDate"] },
  );

type CreateVoucherFormValues = z.infer<typeof createVoucherSchema>;

// ─── Component ───────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePromotionVoucherForm({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { isCreatingVoucher } = useAppSelector((state) => state.voucher);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateVoucherFormValues>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discountType: String(DiscountType.Percentage),
      value: "",
      maxDiscountAmount: "",
      minOrderValue: "0",
      usageLimit: "100",
      startDate: "",
      endDate: "",
      allowStacking: true,
    },
  });

  const discountType = watch("discountType");

  const onSubmit = async (data: CreateVoucherFormValues) => {
    try {
      const dt = Number(data.discountType);
      const payload = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: VoucherType.Promotion,
        discountType: dt as DiscountType,
        value: Number(data.value),
        maxDiscountAmount:
          dt === DiscountType.Percentage && data.maxDiscountAmount
            ? Number(data.maxDiscountAmount)
            : null,
        minOrderValue: Number(data.minOrderValue),
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        usageLimit: Number(data.usageLimit),
        isStackable: data.allowStacking,
        stackingPolicy: data.allowStacking
          ? StackingPolicy.AllowStacking
          : StackingPolicy.None,
      };

      const result = await dispatch(
        createPromotionVoucherThunk(payload),
      ).unwrap();
      toast.success(result.message || "Voucher created successfully!");
      reset();
      onClose();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to create voucher");
    }
  };

  if (!isOpen) return null;

  // ── Label + Input helpers ──
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1";
  const inputCls =
    " text-black w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ce2a32] focus:ring-1 focus:ring-[#ce2a32] outline-none transition";
  const errCls = "mt-1 text-xs text-red-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black uppercase tracking-tight font-oswald">
            Create Promotion Voucher
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Row 1: Code + Name ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Voucher Code</label>
              <input
                {...register("code")}
                placeholder="Eg: SALE20"
                className={`${inputCls} uppercase`}
              />
              {errors.code && <p className={errCls}>{errors.code.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Voucher Name</label>
              <input
                {...register("name")}
                placeholder="Eg: 20% Off for New Year"
                className={inputCls}
              />
              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="Brief description about the voucher..."
              className={inputCls}
            />
            {errors.description && (
              <p className={errCls}>{errors.description.message}</p>
            )}
          </div>

          {/* ── Row 2: Discount Type + Value ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discount Type</label>
              <select {...register("discountType")} className={inputCls}>
                <option value={String(DiscountType.Percentage)}>
                  Percentage Discount
                </option>
                <option value={String(DiscountType.FixedAmount)}>
                  Fixed Amount Discount
                </option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Value{" "}
                {discountType === String(DiscountType.Percentage)
                  ? "(%)"
                  : "(VND)"}
              </label>
              <input
                type="number"
                {...register("value")}
                placeholder="0"
                className={inputCls}
              />
              {errors.value && <p className={errCls}>{errors.value.message}</p>}
            </div>
          </div>

          {/* ── Max Discount (only for Percentage) ── */}
          {discountType === String(DiscountType.Percentage) && (
            <div>
              <label className={labelCls}>Max Discount (VND)</label>
              <input
                type="number"
                {...register("maxDiscountAmount")}
                placeholder="Eg: 100000"
                className={inputCls}
              />
              {errors.maxDiscountAmount && (
                <p className={errCls}>{errors.maxDiscountAmount.message}</p>
              )}
            </div>
          )}

          {/* ── Row 3: Min Order + Usage Limit ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Minimum Order (VND)</label>
              <input
                type="number"
                {...register("minOrderValue")}
                placeholder="0"
                className={inputCls}
              />
              {errors.minOrderValue && (
                <p className={errCls}>{errors.minOrderValue.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input
                type="number"
                {...register("usageLimit")}
                placeholder="100"
                className={inputCls}
              />
              {errors.usageLimit && (
                <p className={errCls}>{errors.usageLimit.message}</p>
              )}
            </div>
          </div>

          {/* ── Row 4: Dates ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <input
                type="datetime-local"
                {...register("startDate")}
                className={inputCls}
              />
              {errors.startDate && (
                <p className={errCls}>{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input
                type="datetime-local"
                {...register("endDate")}
                className={inputCls}
              />
              {errors.endDate && (
                <p className={errCls}>{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* ── Stackable Toggle ── */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              id="allowStacking"
              {...register("allowStacking")}
              className="h-4 w-4 rounded border-gray-300 text-[#ce2a32] focus:ring-[#ce2a32]"
            />
            <label htmlFor="allowStacking" className="text-sm text-gray-700">
              Allow stacking with other vouchers
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingVoucher}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ce2a32] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#b0242b] disabled:opacity-50 disabled:cursor-not-allowed font-oswald"
            >
              {isCreatingVoucher && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
