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
  CreatePromotionVoucherPayload,
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
    maxUsesPerUser: z.string().optional(),
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
      maxUsesPerUser: "",
      startDate: "",
      endDate: "",
      allowStacking: true,
    },
  });

  const discountType = watch("discountType");

  const onSubmit = async (data: CreateVoucherFormValues) => {
    try {
      const dt = Number(data.discountType);
      const payload: CreatePromotionVoucherPayload = {
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

      if (data.maxUsesPerUser && Number(data.maxUsesPerUser) > 0) {
        payload.maxUsesPerUser = Number(data.maxUsesPerUser);
      }

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
  const labelCls = "block text-[13px] font-medium text-amazon-text mb-1";
  const inputCls =
    " text-[13px] text-amazon-text bg-white w-full rounded-sm border border-amazon-border px-3 py-2.5 focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus outline-none transition placeholder-neutral-400";
  const errCls = "mt-1 text-[11px] text-red-500 font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm bg-white p-6 shadow-xl border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-amazon-border">
          <h2 className="text-lg font-bold text-amazon-text">
            Create Promotion Voucher
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-50 hover:text-amazon-text transition border border-transparent hover:border-amazon-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Row 1: Code + Name ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              className={`${inputCls} resize-none`}
            />
            {errors.description && (
              <p className={errCls}>{errors.description.message}</p>
            )}
          </div>

          {/* ── Row 2: Discount Type + Value ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {/* ── Row 3: Min Order + Usage Limit + Max Uses Per User ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
            <div>
              <label className={labelCls}>Max Uses / User</label>
              <input
                type="number"
                {...register("maxUsesPerUser")}
                placeholder="Unlimited if empty"
                className={inputCls}
              />
              {errors.maxUsesPerUser && (
                <p className={errCls}>{errors.maxUsesPerUser.message}</p>
              )}
            </div>
          </div>

          {/* ── Row 4: Dates ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          <div className="flex items-center gap-3 rounded-sm border border-amazon-border px-4 py-3.5 bg-neutral-50/50 mt-2">
            <input
              type="checkbox"
              id="allowStacking"
              {...register("allowStacking")}
              className="h-4 w-4 rounded-sm border-amazon-border text-amazon-focus focus:ring-amazon-focus transition-colors"
            />
            <label htmlFor="allowStacking" className="text-[13px] text-amazon-text font-medium cursor-pointer">
              Allow stacking with other vouchers
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-amazon-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-amazon-border bg-white px-5 py-2.5 text-[13px] font-medium text-amazon-textMuted transition hover:bg-neutral-50 hover:text-amazon-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingVoucher}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-amazon-btnPrimary border border-amazon-border px-6 py-2.5 text-[13px] font-medium text-amazon-text transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isCreatingVoucher && (
                <Loader2 className="h-4 w-4 animate-spin text-amazon-textMuted" />
              )}
              Create Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
