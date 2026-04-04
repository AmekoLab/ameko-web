// ============================================================
// Payment Types (VNPay, etc.)
// ============================================================

/** Response from POST /Payment/vnpay-confirm */
export interface VnPayConfirmResponse {
  success: boolean;
  paid: boolean;
  orderId: string;
  transactionId: string;
  responseCode: string;
  message: string;
}
