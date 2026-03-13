"use client";

import { FC } from "react";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { processAdminWarrantyDecision } from "@/src/store/slices/adminWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { toast } from "react-toastify";
import WarrantyTimeline from "@/src/components/Warranty/WarrantyTimeline";

// ─── Zod Schema ────────────────────────────────────────────
const adminDecisionSchema = z.object({
  approve: z.boolean({ message: "Please select a judgment" }),
  adminNote: z
    .string()
    .min(
      5,
      "Please enter a reason/note for the judgment (at least 5 characters)",
    ),
});

type AdminDecisionFormValues = z.infer<typeof adminDecisionSchema>;

// ─── Props ─────────────────────────────────────────────────
interface AdminDecisionModalProps {
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

// ─── Component ─────────────────────────────────────────────
const AdminDecisionModal: FC<AdminDecisionModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isProcessingAdminDecision } = useAppSelector(
    (state) => state.adminWarranty,
  );

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

  const approveValue = useWatch({ control, name: "approve" });

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
      toast.error(error || "Xử lý phán quyết thất bại");
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

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">
            Judge warranty request
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Section 1: The Case ── */}
        <div className="px-6 py-5 border-b border-gray-100 space-y-4">
          {/* Customer's Claim */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Customer request
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-bold text-gray-900">{issue.reason}</p>
              <p className="text-sm text-gray-700">{issue.description}</p>
              {issue.evidenceUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-blue-200 bg-white mt-2">
                  <Image
                    src={issue.evidenceUrl}
                    alt="Minh chứng từ khách hàng"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Shop's Defense */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Shop's response
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              {issue.shopResponse ? (
                <p className="text-sm text-gray-700">{issue.shopResponse}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Shop has not responded yet.
                </p>
              )}
            </div>
          </div>

          {/* Refund Amount */}
          {issue.refundAmount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="text-sm font-medium text-gray-700">
                Requested refund amount
              </span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(issue.refundAmount)}
              </span>
            </div>
          )}

          {/* Expected Action */}
          <p className="text-xs text-gray-500 italic">{issue.expectedAction}</p>
        </div>

        {/* Timeline Section */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Action history
          </h3>
          <WarrantyTimeline issueId={issue.id} />
        </div>

        {/* ── Section 2: Admin Judgment Form or Read-Only View ── */}
        {isAdminActionable ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-5"
          >
            {/* Decision Radio */}
            <div>
              <label className={labelClass}>Admin's judgment</label>
              <Controller
                name="approve"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Approve */}
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                        field.value === true
                          ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-6 h-6 flex-shrink-0 ${
                          field.value === true
                            ? "text-green-600"
                            : "text-gray-300"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            field.value === true
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          Approve request
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Approve customer's request
                        </p>
                      </div>
                    </button>

                    {/* Reject */}
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                        field.value === false
                          ? "border-red-500 bg-red-50 ring-1 ring-red-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <XCircle
                        className={`w-6 h-6 flex-shrink-0 ${
                          field.value === false
                            ? "text-red-600"
                            : "text-gray-300"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            field.value === false
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          Reject, protect Shop
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Reject customer's request
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

            {/* Admin Note */}
            <div>
              <label htmlFor="adminNote" className={labelClass}>
                Judgment note
              </label>
              <textarea
                id="adminNote"
                rows={4}
                {...register("adminNote")}
                placeholder="Enter Admin's reason/note for judgment..."
                className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.adminNote
                    ? "border-red-300 focus:ring-red-200"
                    : approveValue === true
                      ? "border-green-300 focus:ring-green-200"
                      : approveValue === false
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-purple-200"
                }`}
              />
              {errors.adminNote && (
                <p className={errorClass}>{errors.adminNote.message}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessingAdminDecision}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingAdminDecision}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingAdminDecision && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Judgment
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Admin's judgment
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {issue.adminNote || "No judgment note"}
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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

export default AdminDecisionModal;
