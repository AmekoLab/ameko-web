"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateVoucherThunk } from "@/src/store/slices/voucherSlice";
import { Voucher, VoucherStatus } from "@/src/services/voucher.service";

// ─── Zod Schema ──────────────────────────────────────────

const updateVoucherSchema = z.object({
  name: z.string().min(1, "Voucher name cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
  endDate: z.string().min(1, "Select end date"),
  usageLimit: z.string().min(1, "Cannot be empty"),
  status: z.string().min(1, "Select status"),
  maxUsesPerUser: z.string().optional(),
});

type UpdateVoucherFormValues = z.infer<typeof updateVoucherSchema>;

// ─── Helpers ─────────────────────────────────────────────

/** Convert an ISO / datetime string to the `datetime-local` input format */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Map the string status from the API to the VoucherStatus enum value */
function statusStringToEnum(s: string): VoucherStatus {
  const map: Record<string, VoucherStatus> = {
    Active: VoucherStatus.Active,
    Expired: VoucherStatus.Expired,
    Depleted: VoucherStatus.Depleted,
    Disabled: VoucherStatus.Disabled,
  };
  return map[s] ?? VoucherStatus.Active;
}

// ─── Component ───────────────────────────────────────────

interface Props {
  voucher: Voucher;
  onClose: () => void;
}

export default function UpdateVoucherModal({ voucher, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { isUpdatingVoucher } = useAppSelector((state) => state.voucher);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateVoucherFormValues>({
    resolver: zodResolver(updateVoucherSchema),
    defaultValues: {
      name: voucher.name,
      description: voucher.description,
      endDate: toDatetimeLocal(voucher.endDate),
      usageLimit: String(voucher.usageLimit),
      status: String(statusStringToEnum(voucher.status)),
      maxUsesPerUser: voucher.maxUsesPerUser ? String(voucher.maxUsesPerUser) : "",
    },
  });

  const onSubmit = async (data: UpdateVoucherFormValues) => {
    try {
      const result = await dispatch(
        updateVoucherThunk({
          id: voucher.id,
          payload: {
            name: data.name,
            description: data.description,
            endDate: new Date(data.endDate).toISOString(),
            usageLimit: Number(data.usageLimit),
            status: Number(data.status) as VoucherStatus,
            maxUsesPerUser: (data.maxUsesPerUser && Number(data.maxUsesPerUser) > 0) ? Number(data.maxUsesPerUser) : null,
          },
        }),
      ).unwrap();
      toast.success(result.message || "Voucher updated successfully!");
      onClose();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to update voucher");
    }
  };

  const labelCls = "block text-[13px] font-medium text-amazon-text mb-1";
  const inputCls =
    " text-[13px] text-amazon-text bg-white w-full rounded-sm border border-amazon-border px-3 py-2.5 focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus outline-none transition placeholder-neutral-400";
  const errCls = "mt-1 text-[11px] text-red-500 font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-white p-6 shadow-xl border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-amazon-border">
          <h2 className="text-lg font-bold text-amazon-text">
            Update Voucher
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-50 hover:text-amazon-text transition border border-transparent hover:border-amazon-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Readonly info */}
        <div className="mb-4 rounded-sm bg-neutral-50 border border-amazon-border px-4 py-3 text-[13px] text-amazon-textMuted flex items-center gap-2">
          <span className="font-medium font-mono text-amazon-text">{voucher.code}</span>
          <span className="text-neutral-300">|</span>
          <span className="font-medium">{voucher.type}</span>
          <span className="text-neutral-300">|</span>
          <span className="font-medium">
            {voucher.discountType === "Percentage"
              ? `${voucher.value}%`
              : `${voucher.value.toLocaleString("vi-VN")}đ`}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Voucher Name</label>
            <input {...register("name")} className={inputCls} />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...register("description")}
              rows={2}
              className={`${inputCls} resize-none`}
            />
            {errors.description && (
              <p className={errCls}>{errors.description.message}</p>
            )}
          </div>

          {/* End Date */}
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

          {/* Usage Limit + Status + Max Uses Per User row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input
                type="number"
                {...register("usageLimit")}
                className={inputCls}
              />
              {errors.usageLimit && (
                <p className={errCls}>{errors.usageLimit.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Max Uses / User</label>
              <input type="number" {...register("maxUsesPerUser")} placeholder="Unlimited" className={inputCls} />
              {errors.maxUsesPerUser && <p className={errCls}>{errors.maxUsesPerUser.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...register("status")} className={inputCls}>
                <option value={String(VoucherStatus.Active)}>Active</option>
                <option value={String(VoucherStatus.Disabled)}>Disabled</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-amazon-border bg-white px-5 py-2.5 text-[13px] font-medium text-amazon-textMuted transition hover:bg-neutral-50 hover:text-amazon-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingVoucher}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-amazon-btnPrimary border border-amazon-border px-6 py-2.5 text-[13px] font-medium text-amazon-text transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isUpdatingVoucher && (
                <Loader2 className="h-4 w-4 animate-spin text-amazon-textMuted" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
