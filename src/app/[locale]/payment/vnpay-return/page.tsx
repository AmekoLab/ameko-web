"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { paymentService } from "@/src/services/payment.service";

// ─── Types ─────────────────────────────────────────────────
type Status = "loading" | "success" | "failed";

// ─── Inner Component (reads searchParams) ──────────────────
function VnPayReturnContent() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Đang xử lý...");
  const [orderId, setOrderId] = useState<string | null>(null);

  // VNPay Extraction
  const amountStr = searchParams.get("vnp_Amount");
  const bankCode = searchParams.get("vnp_BankCode");
  const transactionNo = searchParams.get("vnp_TransactionNo");
  const orderInfo = searchParams.get("vnp_OrderInfo");

  const amountDisplay = amountStr ? (parseInt(amountStr) / 100).toLocaleString("vi-VN") : "0";

  // Prevent StrictMode double-fire
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const payload = Object.fromEntries(searchParams.entries());

    // Guard: nothing to verify
    if (!payload.vnp_SecureHash) {
      setStatus("failed");
      setMessage("Missing transaction parameters.");
      return;
    }

    hasFetched.current = true;

    const verify = async () => {
      const response = await paymentService.confirmVnPay(payload);

      if (response.success && response.paid) {
        setStatus("success");
        setOrderId(response.orderId);
        setMessage(response.message || "Payment successful!");
      } else {
        setStatus("failed");
        setMessage(
          response.message ||
            "Payment failed. Please try again.",
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amazon-bgSecondary p-4 text-amazon-text font-sans">
      <Link href="/" className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-amazon-text">
          AMEKO STORE
        </h1>
      </Link>
      
      <div className="bg-white border border-amazon-border rounded-md p-6 sm:p-8 max-w-[420px] w-full text-center shadow-sm flex flex-col items-center">
        {/* ── Loading ────────────────────────────────────── */}
        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="w-12 h-12 animate-spin text-amazon-btnSecondary mx-auto mb-6" />
            <h2 className="text-lg font-bold text-amazon-text mb-2 tracking-tight">
              Processing payment...
            </h2>
            <p className="text-[13px] text-amazon-textMuted">
              Please wait while we verify your transaction. Do not refresh this page.
            </p>
          </div>
        )}

        {/* ── Success ───────────────────────────────────── */}
        {status === "success" && (
          <div className="py-2 w-full">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
               <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-amazon-text mb-2 tracking-tight">
              Payment Successful
            </h2>
            <p className="text-[13px] text-amazon-textMuted mb-2">{message}</p>
            
            <div className="mt-6 mb-6 text-left border border-amazon-border rounded-sm bg-neutral-50 p-4 w-full">
              <h3 className="text-[11px] font-bold text-amazon-textMuted mb-3 uppercase tracking-wider border-b border-amazon-border pb-2">
                Transaction Details
              </h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-amazon-textMuted font-medium">Bank</span>
                  <span className="font-bold text-amazon-text flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-px"></span>
                    {bankCode || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-amazon-textMuted font-medium">Amount</span>
                  <span className="font-bold text-amazon-price text-[14px]">
                    {amountDisplay}₫
                  </span>
                </div>
                {/* <div className="flex justify-between items-center gap-4">
                  <span className="text-amazon-textMuted font-medium">Txn ID</span>
                  <span className="font-bold font-mono text-[11px] text-amazon-text bg-white px-1.5 py-0.5 rounded border border-amazon-border">
                    {transactionNo || "N/A"}
                  </span>
                </div> */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-amazon-textMuted font-medium shrink-0 pt-0.5">Info</span>
                  <span className="font-medium text-amazon-text text-right line-clamp-2 leading-snug">
                    {orderInfo ? decodeURIComponent(orderInfo.replace(/\+/g, " ")) : "Payment via VNPay"}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/orders"
              className="bg-amazon-btnPrimary text-amazon-text hover:brightness-95 py-3 px-6 rounded-sm block w-full font-bold uppercase tracking-widest text-[13px] transition-all shadow-sm"
            >
              View Orders
            </Link>
          </div>
        )}

        {/* ── Failed ────────────────────────────────────── */}
        {status === "failed" && (
          <div className="py-2 w-full">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
               <XCircle className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-amazon-text mb-2 tracking-tight">
              Payment Failed
            </h2>
            <p className="text-[13px] text-amazon-textMuted mb-6">
              {message ||
                "There was an error processing your transaction via VNPay."}
            </p>

            <Link
              href="/cart"
              className="bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text py-3 px-6 rounded-sm block w-full font-bold uppercase tracking-widest text-[13px] transition-all shadow-sm"
            >
              Return to Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page Export (Suspense boundary for useSearchParams) ────
export default function VnPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-amazon-bgSecondary text-amazon-text">
          <Loader2 className="w-8 h-8 animate-spin text-amazon-textMuted" />
        </div>
      }
    >
      <VnPayReturnContent />
    </Suspense>
  );
}
