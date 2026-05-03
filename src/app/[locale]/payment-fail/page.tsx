"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  
  const [referenceId, setReferenceId] = useState<string | null>(
    sessionId || orderId || vnpTxnRef
  );

  useEffect(() => {
    // If not in URL, try to recover from localStorage
    if (!referenceId) {
      const storedSessionId = localStorage.getItem("pending_session_id");
      const storedOrderId = localStorage.getItem("pending_order_id");
      
      if (storedSessionId) {
        setReferenceId(storedSessionId);
        router.replace(`/payment-fail?session_id=${storedSessionId}`);
      } else if (storedOrderId) {
        setReferenceId(storedOrderId);
        // Append it to URL bar to match user expectations
        router.replace(`/payment-fail?orderId=${storedOrderId}`);
      }
    }
    // Clean up
    try {
      localStorage.removeItem("pending_session_id");
      localStorage.removeItem("pending_order_id");
    } catch {}
  }, [referenceId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Failure Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-14 h-14 text-red-500" />
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-red-200 animate-ping opacity-20" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-oswald font-bold text-black uppercase tracking-wide mb-3">
          Payment Failed
        </h1>

        <p className="text-gray-500 text-base mb-4 max-w-md mx-auto">
          Your payment was not completed or was canceled. Don&apos;t worry —
          your cart items are still saved.
        </p>

        {/* Common Reasons */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left max-w-sm mx-auto">
          <p className="text-sm font-medium text-gray-700 mb-3">
            This may have happened because:
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              The payment was canceled by you
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              Your card was declined
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>A network issue
              interrupted the process
            </li>
          </ul>
        </div>

        {/* Transaction Details */}
        {referenceId && (
          <div className="mt-4 mb-8 text-left border border-gray-200 rounded-lg p-4 w-full bg-white max-w-sm mx-auto">
            <h3 className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">
              Transaction Details
            </h3>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-medium shrink-0">Reference</span>
                <span className="font-bold font-mono text-[11px] text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 line-clamp-1 break-all flex-1 text-right ml-4">
                  {referenceId}
                </span>
              </div>
              <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-100">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2 w-full">
                   <span className="text-[12px] font-bold text-gray-700">Payment Status</span>
                   <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                     The transaction could not be processed. No funds were deducted.
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/cart"
            className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors duration-200 rounded-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Return to Cart
          </Link>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 px-8 py-3 text-sm font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors duration-200 rounded-sm flex items-center gap-2"
          >
            Go to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" />}>
      <PaymentFailContent />
    </Suspense>
  );
}
