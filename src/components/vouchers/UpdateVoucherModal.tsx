"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateVoucherThunk } from "@/src/store/slices/voucherSlice";
import { Voucher, VoucherStatus } from "@/src/services/voucher.service";

// ─── Zod Schema ──────────────────────────────────────────

type TranslationFn = (key: string, values?: Record<string, unknown>) => string;

const updateVoucherSchema = (t: TranslationFn) =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    description: z.string().min(1, t("validation.descriptionRequired")),
    endDate: z.string().min(1, t("validation.endDateRequired")),
    usageLimit: z.string().min(1, t("validation.usageLimitRequired")),
    status: z.string().min(1, t("validation.statusRequired")),
    maxUsesPerUser: z.string().optional(),
  });

type UpdateVoucherFormValues = z.infer<ReturnType<typeof updateVoucherSchema>>;

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
  const t = useTranslations("UpdateVoucherModal");
  const tCommon = useTranslations("Common");
  const dispatch = useAppDispatch();
  const { isUpdatingVoucher } = useAppSelector((state) => state.voucher);

  const getVoucherTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      Promotion: t("voucherType.promotion"),
      Negotiation: t("voucherType.negotiation"),
      Compensation: t("voucherType.compensation"),
    };
    return map[type] ?? type;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateVoucherFormValues>({
    resolver: zodResolver(updateVoucherSchema(t as unknown as TranslationFn)),
    defaultValues: {
      name: voucher.name,
      description: voucher.description,
      endDate: toDatetimeLocal(voucher.endDate),
      usageLimit: String(voucher.usageLimit),
      status: String(statusStringToEnum(voucher.status)),
      maxUsesPerUser: voucher.maxUsesPerUser
        ? String(voucher.maxUsesPerUser)
        : "",
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
            maxUsesPerUser:
              data.maxUsesPerUser && Number(data.maxUsesPerUser) > 0
                ? Number(data.maxUsesPerUser)
                : null,
          },
        }),
      ).unwrap();
      toast.success(result.message || t("toast.updateSuccess"));
      onClose();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : t("toast.updateFailed"));
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
          <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon("close")}
            className="rounded-sm p-1.5 text-amazon-textMuted hover:bg-neutral-50 hover:text-amazon-text transition border border-transparent hover:border-amazon-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Readonly info */}
        <div className="mb-4 rounded-sm bg-neutral-50 border border-amazon-border px-4 py-3 text-[13px] text-amazon-textMuted flex items-center gap-2">
          <span className="font-medium font-mono text-amazon-text">
            {voucher.code}
          </span>
          <span className="text-neutral-300">|</span>
          <span className="font-medium">
            {getVoucherTypeLabel(voucher.type)}
          </span>
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
            <label className={labelCls}>{t("labels.voucherName")}</label>
            <input {...register("name")} className={inputCls} />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>{t("labels.description")}</label>
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
            <label className={labelCls}>{t("labels.endDate")}</label>
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
              <label className={labelCls}>{t("labels.usageLimit")}</label>
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
              <label className={labelCls}>{t("labels.maxUsesPerUser")}</label>
              <input
                type="number"
                {...register("maxUsesPerUser")}
                placeholder={t("placeholders.unlimited")}
                className={inputCls}
              />
              {errors.maxUsesPerUser && (
                <p className={errCls}>{errors.maxUsesPerUser.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>{t("labels.status")}</label>
              <select {...register("status")} className={inputCls}>
                <option value={String(VoucherStatus.Active)}>
                  {t("status.active")}
                </option>
                <option value={String(VoucherStatus.Disabled)}>
                  {t("status.disabled")}
                </option>
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
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isUpdatingVoucher}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-amazon-btnPrimary border border-amazon-border px-6 py-2.5 text-[13px] font-medium text-amazon-text transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isUpdatingVoucher && (
                <Loader2 className="h-4 w-4 animate-spin text-amazon-textMuted" />
              )}
              {isUpdatingVoucher
                ? t("actions.saving")
                : t("actions.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
