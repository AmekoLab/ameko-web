"use client";

import { FC, useMemo } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { processAdminWarrantyDecision } from "@/src/store/slices/adminWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { toast } from "react-toastify";
import WarrantyTimeline from "@/src/components/Warranty/WarrantyTimeline";

// ─── Zod Schema ────────────────────────────────────────────
type Translator = (key: string) => string;

const createAdminDecisionSchema = (t: Translator) =>
  z.object({
    approve: z.boolean({ message: t("validationSelectJudgment") }),
    adminNote: z.string().min(5, t("validationAdminNoteMin")),
  });

type AdminDecisionFormValues = z.infer<
  ReturnType<typeof createAdminDecisionSchema>
>;

// ─── Props ─────────────────────────────────────────────────
interface AdminDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: WarrantyRequest | null;
  onSuccess: () => void;
}

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number, localeCode: string): string =>
  new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: "VND",
  }).format(amount);

// ─── Component ─────────────────────────────────────────────
const AdminDecisionModal: FC<AdminDecisionModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSuccess,
}) => {
  const t = useTranslations("AdminDecisionModal");
  const locale = useLocale();
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";

  const dispatch = useAppDispatch();
  const { isProcessingAdminDecision } = useAppSelector(
    (state) => state.adminWarranty,
  );
  const adminDecisionSchema = useMemo(() => createAdminDecisionSchema(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AdminDecisionFormValues>({
    resolver: zodResolver(adminDecisionSchema),
    defaultValues: {
      approve: undefined,
      adminNote: "",
    },
  });

const onSubmit = async (data: AdminDecisionFormValues) => {
    if (!issue) return;
    try {
      await dispatch(
        processAdminWarrantyDecision({
          issueId: issue.id,
          approve: data.approve,
          adminNote: data.adminNote,
        }),
      ).unwrap();
      reset();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const error = err as string;
      toast.error(error || t("toastDecisionFailed"));
    }
  };

  const handleClose = () => {
    if (!isProcessingAdminDecision) {
      reset();
      onClose();
    }
  };

  if (!isOpen || !issue) return null;

  const isFinalState = [0, 1, 3, 4, 5, 6, 7, 8].includes(issue.status);
  const isAdminActionable = !isFinalState;

  const labelClass = "block text-[11px] font-bold text-amazon-text mb-1.5";
  const errorClass = "text-[10px] text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-amazon-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-amazon-border px-4 py-3 flex items-center justify-between bg-neutral-50/50">
          <h2 className="text-[14px] font-bold text-amazon-text tracking-tight">
            {t("title")}
          </h2>
          <button
            onClick={handleClose}
            className="text-[11px] font-medium text-amazon-textMuted hover:text-amazon-text transition-colors"
          >
            {t("close")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {/* ── Section 1: The Case ── */}
          <div className="px-4 py-4 border-b border-amazon-border flex flex-col gap-4">
            {/* Customer's Claim */}
            <div>
              <h3 className="text-[11px] font-bold text-amazon-text mb-1.5 uppercase tracking-wide">
                {t("customerRequest")}
              </h3>
              <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3 flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-amazon-text">
                  {issue.reason}
                </p>
                <p className="text-[11px] text-amazon-textMuted">
                  {issue.description}
                </p>
                {issue.evidenceUrl && (
                  <div className="relative w-full h-40 max-w-sm rounded-[2px] overflow-hidden border border-amazon-border bg-white mt-1 border-dashed">
                    <Image
                      src={issue.evidenceUrl}
                      alt={t("customerEvidenceAlt")}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Shop's Defense */}
            <div>
              <h3 className="text-[11px] font-bold text-amazon-text mb-1.5 uppercase tracking-wide">
                {t("shopResponse")}
              </h3>
              <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3">
                {issue.shopResponse ? (
                  <p className="text-[11px] text-amazon-text">
                    {issue.shopResponse}
                  </p>
                ) : (
                  <p className="text-[11px] text-amazon-textMuted italic">
                    {t("shopNoResponse")}
                  </p>
                )}
              </div>
            </div>

            {/* Refund Amount */}
            {issue.refundAmount > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-neutral-50 border border-amazon-border">
                <span className="text-[11px] font-bold text-amazon-text">
                  {t("requestedRefundAmount")}
                </span>
                <span className="text-[13px] font-bold text-amazon-text">
                  {formatCurrency(issue.refundAmount, numberLocale)}
                </span>
              </div>
            )}

            {/* Expected Action */}
            <p className="text-[10px] text-amazon-textMuted italic">
              {issue.expectedAction}
            </p>
          </div>

          {/* Timeline Section */}
          <div className="px-4 py-4 border-b border-amazon-border bg-neutral-50/30">
            <h3 className="text-[11px] font-bold text-amazon-text mb-2.5 uppercase tracking-wide">
              {t("actionHistory")}
            </h3>
            <div className="text-[10px] scale-90 origin-top-left -mb-6">
              <WarrantyTimeline issueId={issue.id} />
            </div>
          </div>

          {/* ── Section 2: Admin Judgment Form or Read-Only View ── */}
          {isAdminActionable ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-4 py-4 flex flex-col gap-4"
            >
              {/* Decision Radio */}
              <div>
                <label className={labelClass}>{t("adminJudgment")}</label>
                <Controller
                  name="approve"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {/* Approve */}
                      <button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={`flex flex-col gap-1 p-3 rounded-sm border transition-colors text-left ${
                          field.value === true
                            ? "border-green-600 bg-green-50/50"
                            : "border-amazon-border hover:border-gray-300 bg-white"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold ${
                            field.value === true
                              ? "text-green-700"
                              : "text-amazon-text"
                          }`}
                        >
                          {t("approveRequest")}
                        </p>
                        <p className="text-[10px] text-amazon-textMuted">
                          {t("approveCustomerRequest")}
                        </p>
                      </button>

                      {/* Reject */}
                      <button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={`flex flex-col gap-1 p-3 rounded-sm border transition-colors text-left ${
                          field.value === false
                            ? "border-red-600 bg-red-50/50"
                            : "border-amazon-border hover:border-gray-300 bg-white"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold ${
                            field.value === false
                              ? "text-red-700"
                              : "text-amazon-text"
                          }`}
                        >
                          {t("rejectProtectShop")}
                        </p>
                        <p className="text-[10px] text-amazon-textMuted">
                          {t("rejectCustomerRequest")}
                        </p>
                      </button>
                    </div>
                  )}
                />
                {errors.approve && (
                  <p className={errorClass}>{errors.approve.message}</p>
                )}
              </div>

              {/* Admin Note */}
              <div>
                <label htmlFor="adminNote" className={labelClass}>
                  {t("judgmentNote")}
                </label>
                <textarea
                  id="adminNote"
                  rows={4}
                  {...register("adminNote")}
                  placeholder={t("judgmentNotePlaceholder")}
                  className={`w-full rounded-sm border px-3 py-2 text-[11px] font-medium text-amazon-text placeholder:text-amazon-textMuted focus:outline-none focus:border-amazon-btnPrimary transition-colors resize-none ${
                    errors.adminNote ? "border-red-400" : "border-amazon-border"
                  }`}
                />
                {errors.adminNote && (
                  <p className={errorClass}>{errors.adminNote.message}</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amazon-border mt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessingAdminDecision}
                  className="px-4 py-1.5 text-[11px] font-medium text-amazon-text bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAdminDecision}
                  className="px-4 py-1.5 text-[11px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-btnPrimary shadow-sm rounded-sm hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingAdminDecision ? t("saving") : t("saveJudgment")}
                </button>
              </div>
            </form>
          ) : (
            <div className="px-4 py-4">
              <h3 className="text-[11px] font-bold text-amazon-text mb-1.5 uppercase tracking-wide">
                {t("adminJudgment")}
              </h3>
              <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3 text-[11px] text-amazon-text whitespace-pre-wrap">
                {issue.adminNote || t("noJudgmentNote")}
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-amazon-border">
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-[11px] font-medium text-amazon-text bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDecisionModal;
