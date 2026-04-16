"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Package } from "lucide-react";
import { useAppDispatch } from "@/src/store/hook";
import { clearCart } from "@/src/store/slices/cartSlice";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");
  
  const referenceId = sessionId || orderId;

  // Clear local cart state once payment is confirmed
  useEffect(() => {
    if (referenceId) {
      dispatch(clearCart());
      // Also clear localStorage cart
      try {
        localStorage.removeItem("cart");
      } catch {
        // Ignore storage errors
      }
    }
  }, [referenceId, dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amazon-bgSecondary p-4 text-amazon-text font-sans">
      <Link href="/" className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-amazon-text">
          AMEKO STORE
        </h1>
      </Link>

      <div className="bg-white border border-amazon-border rounded-md p-6 sm:p-8 max-w-[420px] w-full text-center shadow-sm flex flex-col items-center">
        {/* Success Icon */}
        <div className="py-2 w-full">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 animate-[scale-in_0.5s_ease-out]">
            <CheckCircle className="text-green-600 w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold text-amazon-text mb-2 tracking-tight">
            Order Confirmed!
          </h2>
          
          <p className="text-[13px] text-amazon-textMuted mb-2 leading-relaxed">
            Your payment was successful. We're processing your order and will notify you once it ships.
          </p>

          {/* Transaction Details */}
          {referenceId && (
            <div className="mt-6 mb-6 text-left border border-amazon-border rounded-sm bg-neutral-50 p-4 w-full">
              <h3 className="text-[11px] font-bold text-amazon-textMuted mb-3 uppercase tracking-wider border-b border-amazon-border pb-2">
                Transaction Details
              </h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-amazon-textMuted font-medium shrink-0">Reference</span>
                  <span className="font-bold font-mono text-[11px] text-amazon-text bg-white px-1.5 py-0.5 rounded border border-amazon-border line-clamp-1 break-all flex-1 text-right ml-4">
                    {referenceId}
                  </span>
                </div>
                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-amazon-border">
                  <Package className="w-4 h-4 text-amazon-textMuted shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2 w-full">
                     <span className="text-[12px] font-bold text-amazon-text">Order Timeline</span>
                     <div className="flex items-center gap-2 text-[11px] text-amazon-textMuted font-medium">
                       <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">1</span>
                       Confirmation sent to email
                     </div>
                     <div className="flex items-center gap-2 text-[11px] text-amazon-textMuted font-medium">
                       <span className="w-4 h-4 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">2</span>
                       Order is processed & packed
                     </div>
                     <div className="flex items-center gap-2 text-[11px] text-amazon-textMuted font-medium">
                       <span className="w-4 h-4 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">3</span>
                       Tracking number provided
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/orders"
            className="bg-amazon-btnPrimary text-amazon-text hover:brightness-95 py-3 px-6 rounded-sm block w-full font-bold uppercase tracking-widest text-[13px] transition-all shadow-sm"
          >
            Check Order Status
          </Link>
          
          <Link
            href="/shop/all-products"
            className="mt-3 bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text py-3 px-6 rounded-sm block w-full font-bold uppercase tracking-widest text-[13px] transition-all shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-amazon-bgSecondary text-amazon-text">
          <Loader2 className="w-8 h-8 animate-spin text-amazon-textMuted" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
