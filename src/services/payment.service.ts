import api from "@/src/utils/api";
import { VnPayConfirmResponse } from "@/src/types/payment.types";

export const paymentService = {
  /**
   * Confirm a VNPay transaction by forwarding all return query params.
   * POST /Payment/vnpay-confirm
   *
   * The backend validates the secure hash, verifies payment status,
   * and returns a flat response (not wrapped in ApiResponse<T>).
   */
  confirmVnPay: async (
    payload: Record<string, string>,
  ): Promise<VnPayConfirmResponse> => {
    try {
      // api interceptor already unwraps response.data
      return await api.post("/Payment/vnpay-confirm", payload);
    } catch (error: unknown) {
      // Return a typed failure so the UI can display an appropriate message
      const err = error as { message?: string };
      return {
        success: false,
        paid: false,
        orderId: "",
        transactionId: "",
        responseCode: "99",
        message: err.message || "Không thể xác thực giao dịch. Vui lòng thử lại.",
      };
    }
  },
};
