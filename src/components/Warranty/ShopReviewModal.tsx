"use client";

import { FC } from "react";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { submitShopWarrantyReview } from "@/src/store/slices/shopWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import WarrantyTimeline from "@/src/components/Warranty/WarrantyTimeline";

// ─── Zod Schema ────────────────────────────────────────────
const shopReviewSchema = z.object({
  approve: z.boolean({ message: "Vui lòng chọn quyết định" }),
  shopResponse: z
    .string()
    .min(5, "Vui lòng nhập phản hồi cho khách hàng (ít nhất 5 ký tự)"),
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
      toast.error(error || "Xử lý yêu cầu thất bại");
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">
            Xem xét yêu cầu bảo hành
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Customer Evidence Section */}
        <div className="px-6 py-5 border-b border-gray-100 space-y-4 bg-gray-50/50">
          {/* Customer info */}
          <div className="flex items-center gap-3">
            {issue.customerAvatar ? (
              <Image
                src={issue.customerAvatar}
                alt={issue.customerName || ""}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {issue.customerName || "Khách hàng"}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(issue.createdAt)}
              </p>
            </div>
          </div>

          {/* Reason & Description */}
          <div>
            <p className="text-sm font-bold text-gray-900">{issue.reason}</p>
            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
          </div>

          {/* Evidence Image */}
          {issue.evidenceUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-white">
              <Image
                src={issue.evidenceUrl}
                alt="Minh chứng từ khách hàng"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Refund Amount */}
          {issue.refundAmount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
              <span className="text-sm text-gray-600">
                Số tiền hoàn yêu cầu
              </span>
              <span className="text-lg font-bold text-[#ce2a32]">
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
            Lịch sử thao tác
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
              <label className={labelClass}>Quyết định của Shop</label>
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
                          Đồng ý
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Chấp nhận yêu cầu
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
                          Từ chối
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Từ chối yêu cầu
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
                Phản hồi cho khách hàng
              </label>
              <textarea
                id="shopResponse"
                rows={4}
                placeholder="Nhập hướng dẫn trả hàng hoặc lý do từ chối..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
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
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isReviewingWarranty || approveValue === undefined}
                className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${
                  approveValue === false
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isReviewingWarranty && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Xác nhận phán quyết
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Phản hồi của Shop
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {issue.shopResponse || "Không có phản hồi"}
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopReviewModal;
