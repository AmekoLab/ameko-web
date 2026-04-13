"use client";

import { FC, useMemo } from "react";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, CheckCircle2, XCircle, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { submitShopWarrantyReview } from "@/src/store/slices/shopWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import WarrantyTimeline from "@/src/components/Warranty/WarrantyTimeline";
import { AiAnalysisStatus } from "@/src/types/orderIssue.types";

// ─── SAFE AI ANALYSIS PARSER ────────────────────────────────────────────────
function parseAiAnalysis(rawString?: string | null): AiAnalysisStatus {
  if (!rawString || rawString.trim() === "") {
    return { status: "EMPTY" };
  }

  if (rawString.trim() === "AI processing failed.") {
    return { status: "FAILED", message: "AI processing failed." };
  }

  try {
    const parsed = JSON.parse(rawString);
    if (
      parsed &&
      typeof parsed === "object" &&
      "Category" in parsed &&
      "Sentiment" in parsed &&
      "Summary" in parsed &&
      "Recommendation" in parsed &&
      "ConfidenceScore" in parsed
    ) {
      return { status: "SUCCESS", data: parsed };
    }
    return { status: "FAILED", message: "AI response format is unrecognized." };
  } catch {
    return { status: "FAILED", message: "Could not parse AI analysis data." };
  }
}

// ─── Zod Schema ────────────────────────────────────────────
const shopReviewSchema = z.object({
  approve: z.boolean({ message: "Please select a decision" }),
  shopResponse: z
    .string()
    .min(5, "Please enter a response for the customer (at least 5 characters)"),
});

type ShopReviewFormValues = z.infer<typeof shopReviewSchema>;

// ─── Props ─────────────────────────────────────────────────
interface ShopReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: WarrantyRequest | null;
  onSuccess: () => void;
}

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

// ─── Component ─────────────────────────────────────────────
const ShopReviewModal: FC<ShopReviewModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isReviewingWarranty } = useAppSelector((state) => state.shopWarranty);

  // Memoized AI analysis — avoids re-parsing JSON on every form keystroke
  const aiAnalysis = useMemo(() => parseAiAnalysis(issue?.aiAnalysisResult), [issue?.aiAnalysisResult]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ShopReviewFormValues>({
    resolver: zodResolver(shopReviewSchema),
    defaultValues: {
      approve: undefined,
      shopResponse: "",
    },
  });

  const approveValue = useWatch({ control, name: "approve" });

  const onSubmit = async (data: ShopReviewFormValues) => {
    if (!issue) return;
    try {
      await dispatch(
        submitShopWarrantyReview({
          issueId: issue.id,
          approve: data.approve,
          shopResponse: data.shopResponse,
        }),
      ).unwrap();
      reset();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const error = err as string;
      toast.error(error || "Failed to process warranty request");
    }
  };

  const handleClose = () => {
    if (!isReviewingWarranty) {
      reset();
      onClose();
    }
  };

  if (!isOpen || !issue) return null;

  const isActionable = issue.status === 1;

  const labelClass = "block text-sm font-medium text-amazon-text mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-md shadow-2xl border border-amazon-border w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-50 rounded-t-md border-b border-amazon-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-amazon-text">
            Review warranty request
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5 text-amazon-textMuted" />
          </button>
        </div>

        {/* Customer Evidence Section */}
        <div className="px-6 py-5 border-b border-amazon-border space-y-4 bg-white">
          {/* Customer info */}
          <div className="flex items-center gap-3">
            {issue.customerAvatar ? (
              <Image
                src={issue.customerAvatar}
                alt={issue.customerName || ""}
                width={40}
                height={40}
                className="rounded-full object-cover border border-amazon-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-200 border border-amazon-border" />
            )}
            <div>
              <p className="text-sm font-medium text-amazon-text">
                {issue.customerName || "Customer"}
              </p>
              <p className="text-xs text-amazon-textMuted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(issue.createdAt)}
              </p>
            </div>
          </div>

          {/* Reason & Description */}
          <div>
            <p className="text-sm font-medium text-amazon-text">{issue.reason}</p>
            <p className="text-sm text-amazon-textMuted mt-1">{issue.description}</p>
          </div>

          {/* Evidence Image */}
          {issue.evidenceUrl && (
            <div className="relative w-full h-48 rounded-sm overflow-hidden borderbg-white">
              <Image
                src={issue.evidenceUrl}
                alt="Evidence from customer"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Refund Amount */}
          {issue.refundAmount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-sm bg-neutral-50 border border-amazon-border">
              <span className="text-sm text-amazon-text">
                Requested refund amount
              </span>
              <span className="text-lg font-bold text-amazon-price">
                {formatCurrency(issue.refundAmount)}
              </span>
            </div>
          )}

          {/* Expected Action */}
          <p className="text-xs text-amazon-textMuted italic">{issue.expectedAction}</p>
        </div>

        {/* ── AI ANALYSIS SECTION ── */}
        {aiAnalysis.status !== "EMPTY" && (
          <div className="mx-6 my-5 border border-amazon-border rounded-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-amazon-border">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-[18px] font-bold text-violet-700 tracking-wide">Ameko Assistant</span>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-amazon-textMuted">(Ameko Assistant is AI and can make mistakes.)</span>
              </div>
            </div>

            {aiAnalysis.status === "FAILED" ? (
              /* ─── FAILED STATE ─── */
              <div className="px-4 py-3 bg-red-50/60 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-600">Analysis Unavailable</p>
                  <p className="text-[11px] text-red-500/80 mt-0.5">{aiAnalysis.message}</p>
                </div>
              </div>
            ) : (
              /* ─── SUCCESS STATE ─── */
              <div className="px-4 py-3 space-y-3 bg-white">
                {/* Row 1: Category & Sentiment side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-amazon-textMuted text-[10px] block mb-0.5 font-medium">Category</span>
                    <span className="text-amazon-text text-xs font-semibold">{aiAnalysis.data.Category}</span>
                  </div>
                  <div>
                    <span className="text-amazon-textMuted text-[10px] block mb-0.5 font-medium">Sentiment</span>
                    <span className="text-amazon-text text-xs font-semibold">{aiAnalysis.data.Sentiment}</span>
                  </div>
                </div>

                {/* Row 2: Summary */}
                <div>
                  <span className="text-amazon-textMuted text-[10px] block mb-0.5 font-medium">Summary</span>
                  <p className="text-amazon-text text-xs leading-relaxed bg-neutral-50 border border-amazon-border rounded-sm p-2.5">
                    {aiAnalysis.data.Summary}
                  </p>
                </div>

                {/* Row 3: Recommendation & Confidence */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amazon-textMuted text-[10px] font-medium">Recommendation:</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        aiAnalysis.data.Recommendation.toLowerCase().includes("approve")
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : aiAnalysis.data.Recommendation.toLowerCase().includes("reject")
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {aiAnalysis.data.Recommendation}
                    </span>
                  </div>
                  <span className="text-[12px] text-amazon-text font-medium">
                    Confidence: {typeof aiAnalysis.data.ConfidenceScore === "number"
                      ? `${(aiAnalysis.data.ConfidenceScore * 100).toFixed(0)}%`
                      : aiAnalysis.data.ConfidenceScore}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Section */}
        <div className="px-6 py-5 border-b border-amazon-border">
          <h3 className="text-sm font-bold text-amazon-text mb-3">
            Action history
          </h3>
          <WarrantyTimeline issueId={issue.id} />
        </div>

        {/* Form Section (actionable) or Read-Only View */}
        {isActionable ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-5"
          >
            {/* ── Decision Radio ── */}
            <div>
              <label className={labelClass}>Shop's decision</label>
              <Controller
                name="approve"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Approve */}
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`flex items-center gap-3 p-4 rounded-sm border text-left transition-all ${
                        field.value === true
                          ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                          : "border-amazon-border hover:bg-neutral-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-6 h-6 flex-shrink-0 ${
                          field.value === true
                            ? "text-green-600"
                            : "text-amazon-border"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            field.value === true
                              ? "text-green-700"
                              : "text-amazon-text"
                          }`}
                        >
                          Approve
                        </p>
                        <p className="text-xs text-amazon-textMuted mt-0.5">
                          Accept request
                        </p>
                      </div>
                    </button>

                    {/* Reject */}
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`flex items-center gap-3 p-4 rounded-sm border text-left transition-all ${
                        field.value === false
                          ? "border-red-500 bg-red-50 ring-1 ring-red-500"
                          : "border-amazon-border hover:bg-neutral-50"
                      }`}
                    >
                      <XCircle
                        className={`w-6 h-6 flex-shrink-0 ${
                          field.value === false
                            ? "text-red-600"
                            : "text-amazon-border"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            field.value === false
                              ? "text-red-700"
                              : "text-amazon-text"
                          }`}
                        >
                          Reject
                        </p>
                        <p className="text-xs text-amazon-textMuted mt-0.5">
                          Reject request
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              />
              {errors.approve && (
                <p className={errorClass}>{errors.approve.message}</p>
              )}
            </div>

            {/* ── Shop Response ── */}
            <div>
              <label htmlFor="shopResponse" className={labelClass}>
                Response to customer
              </label>
              <textarea
                id="shopResponse"
                rows={4}
                placeholder="Enter return instructions or reason for rejection..."
                className="w-full rounded-sm border border-amazon-border px-3 py-2.5 text-sm text-amazon-text placeholder-neutral-400 focus:border-amazon-btnPrimary focus:ring-1 focus:ring-amazon-btnPrimary outline-none transition-colors resize-none"
                {...register("shopResponse")}
              />
              {errors.shopResponse && (
                <p className={errorClass}>{errors.shopResponse.message}</p>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isReviewingWarranty}
                className="px-5 py-2 text-sm font-medium text-amazon-text bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReviewingWarranty || approveValue === undefined}
                className={`px-6 py-2 text-sm font-medium rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm ${
                  approveValue === false
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-amazon-btnPrimary hover:brightness-95 text-amazon-text"
                }`}
              >
                {isReviewingWarranty && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Confirm decision
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5">
            <h3 className="text-sm font-bold text-amazon-text mb-2">
              Shop's response
            </h3>
            <div className="bg-white border border-amazon-border rounded-sm p-4 text-sm text-amazon-text whitespace-pre-wrap">
              {issue.shopResponse || "No response"}
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-sm font-medium text-amazon-text bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopReviewModal;
