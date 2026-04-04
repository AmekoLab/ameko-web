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

  // Prevent StrictMode double-fire
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const payload = Object.fromEntries(searchParams.entries());

    // Guard: nothing to verify
    if (!payload.vnp_SecureHash) {
      setStatus("failed");
      setMessage("Thiếu thông tin xác thực giao dịch.");
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="bg-[#111111] border border-[#1e2126] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* ── Loading ────────────────────────────────────── */}
        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="w-16 h-16 animate-spin text-yellow-500 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Processing payment...
            </h2>
            <p className="text-sm text-gray-400">
              Please do not close this page.
            </p>
          </div>
        )}

        {/* ── Success ───────────────────────────────────── */}
        {status === "success" && (
          <div className="py-4">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2">
              Payment successful!
            </h2>
            <p className="text-sm text-gray-400 mb-1">{message}</p>
            {orderId && (
              <p className="text-xs text-gray-500 break-all">
                Transaction ID:{" "}
                <span className="text-gray-300 font-mono">{orderId}</span>
              </p>
            )}
            <Link
              href="/orders"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg mt-6 block w-full font-medium transition-colors"
            >
              View orders
            </Link>
          </div>
        )}

        {/* ── Failed ────────────────────────────────────── */}
        {status === "failed" && (
          <div className="py-4">
            <XCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2">
              Payment failed
            </h2>
            <p className="text-sm text-gray-400">
              {message ||
                "Payment failed. Please try again."}
            </p>
            <Link
              href="/cart"
              className="bg-[#2a2d35] hover:bg-[#3a3b3c] text-white py-2 px-6 rounded-lg mt-6 block w-full font-medium transition-colors"
            >
              Back to cart
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
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <VnPayReturnContent />
    </Suspense>
  );
}
