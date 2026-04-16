"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { createPromotionVoucherThunk } from "@/src/store/slices/voucherSlice";
import {
  DiscountType,
  VoucherType,
  StackingPolicy,
  CreatePromotionVoucherPayload,
} from "@/src/services/voucher.service";

// ─── Zod Schema ──────────────────────────────────────────

type TranslationFn = (key: string, values?: Record<string, unknown>) => string;

const createVoucherSchema = (t: TranslationFn) =>
  z
    .object({
      code: z
        .string()
        .min(1, t("validation.codeRequired"))
        .max(30, t("validation.codeMax")),
      name: z.string().min(1, t("validation.nameRequired")),
      description: z.string().min(1, t("validation.descriptionRequired")),
      discountType: z.string().min(1, t("validation.discountTypeRequired")),
      value: z.string().min(1, t("validation.valueRequired")),
      maxDiscountAmount: z.string().optional(),
      minOrderValue: z.string().min(1, t("validation.minOrderRequired")),
      usageLimit: z.string().min(1, t("validation.usageLimitRequired")),
      maxUsesPerUser: z.string().optional(),
      startDate: z.string().min(1, t("validation.startDateRequired")),
      endDate: z.string().min(1, t("validation.endDateRequired")),
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
        message: t("validation.invalidValue"),
        path: ["value"],
      },
    )
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true;
        return new Date(data.endDate) > new Date(data.startDate);
      },
      {
        message: t("validation.endDateAfterStartDate"),
        path: ["endDate"],
      },
    );

type CreateVoucherFormValues = z.infer<ReturnType<typeof createVoucherSchema>>;

// ─── Component ───────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePromotionVoucherForm({ isOpen, onClose }: Props) {
  const t = useTranslations("CreatePromotionVoucherForm");
  const tCommon = useTranslations("Common");
  const dispatch = useAppDispatch();
  const { isCreatingVoucher } = useAppSelector((state) => state.voucher);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateVoucherFormValues>({
    resolver: zodResolver(createVoucherSchema(t as unknown as TranslationFn)),
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

  const discountType = useWatch({
    control,
    name: "discountType",
  });

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
      toast.success(result.message || t("toast.createSuccess"));
      reset();
      onClose();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : t("toast.createFailed"));
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Row 1: Code + Name ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t("labels.voucherCode")}</label>
              <input
                {...register("code")}
                placeholder={t("placeholders.code")}
                className={`${inputCls} uppercase`}
              />
              {errors.code && <p className={errCls}>{errors.code.message}</p>}
            </div>
            <div>
              <label className={labelCls}>{t("labels.voucherName")}</label>
              <input
                {...register("name")}
                placeholder={t("placeholders.name")}
                className={inputCls}
              />
              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <label className={labelCls}>{t("labels.description")}</label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder={t("placeholders.description")}
              className={`${inputCls} resize-none`}
            />
            {errors.description && (
              <p className={errCls}>{errors.description.message}</p>
            )}
          </div>

          {/* ── Row 2: Discount Type + Value ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t("labels.discountType")}</label>
              <select {...register("discountType")} className={inputCls}>
                <option value={String(DiscountType.Percentage)}>
                  {t("discountTypeOptions.percentage")}
                </option>
                <option value={String(DiscountType.FixedAmount)}>
                  {t("discountTypeOptions.fixedAmount")}
                </option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                {t("labels.value")}
                {discountType === String(DiscountType.Percentage)
                  ? t("units.percentWrapped")
                  : t("units.vndWrapped")}
              </label>
              <input
                type="number"
                {...register("value")}
                placeholder={t("placeholders.value")}
                className={inputCls}
              />
              {errors.value && <p className={errCls}>{errors.value.message}</p>}
            </div>
          </div>

          {/* ── Max Discount (only for Percentage) ── */}
          {discountType === String(DiscountType.Percentage) && (
            <div>
              <label className={labelCls}>{t("labels.maxDiscount")}</label>
              <input
                type="number"
                {...register("maxDiscountAmount")}
                placeholder={t("placeholders.maxDiscount")}
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
              <label className={labelCls}>{t("labels.minimumOrder")}</label>
              <input
                type="number"
                {...register("minOrderValue")}
                placeholder={t("placeholders.minOrder")}
                className={inputCls}
              />
              {errors.minOrderValue && (
                <p className={errCls}>{errors.minOrderValue.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>{t("labels.usageLimit")}</label>
              <input
                type="number"
                {...register("usageLimit")}
                placeholder={t("placeholders.usageLimit")}
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
                placeholder={t("placeholders.maxUsesPerUser")}
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
              <label className={labelCls}>{t("labels.startDate")}</label>
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
          </div>

          {/* ── Stackable Toggle ── */}
          <div className="flex items-center gap-3 rounded-sm border border-amazon-border px-4 py-3.5 bg-neutral-50/50 mt-2">
            <input
              type="checkbox"
              id="allowStacking"
              {...register("allowStacking")}
              className="h-4 w-4 rounded-sm border-amazon-border text-amazon-focus focus:ring-amazon-focus transition-colors"
            />
            <label
              htmlFor="allowStacking"
              className="text-[13px] text-amazon-text font-medium cursor-pointer"
            >
              {t("labels.allowStacking")}
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-amazon-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-amazon-border bg-white px-5 py-2.5 text-[13px] font-medium text-amazon-textMuted transition hover:bg-neutral-50 hover:text-amazon-text"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isCreatingVoucher}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-amazon-btnPrimary border border-amazon-border px-6 py-2.5 text-[13px] font-medium text-amazon-text transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isCreatingVoucher && (
                <Loader2 className="h-4 w-4 animate-spin text-amazon-textMuted" />
              )}
              {isCreatingVoucher
                ? t("actions.creating")
                : t("actions.createVoucher")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
