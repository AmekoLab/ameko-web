"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Package } from "lucide-react";
import { useAppDispatch } from "@/src/store/hook";
import { clearCart } from "@/src/store/slices/cartSlice";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const sessionId = searchParams.get("session_id");

  // Clear local cart state once payment is confirmed
  useEffect(() => {
    if (sessionId) {
      dispatch(clearCart());
      // Also clear localStorage cart
      try {
        localStorage.removeItem("cart");
      } catch {
        // Ignore storage errors
      }
    }
  }, [sessionId, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-green-200 animate-ping opacity-20" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-oswald font-bold text-black uppercase tracking-wide mb-3">
          Thank You for Your Order!
        </h1>

        <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
          Your payment was successful. We&apos;re preparing your custom keyboard
          build and will notify you once it ships.
        </p>

        {/* Transaction Reference */}
        {sessionId && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 mx-auto max-w-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Transaction Reference
            </p>
            <p className="text-sm text-gray-700 font-mono break-all select-all">
              {sessionId}
            </p>
          </div>
        )}

        {/* Confirmation Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              What happens next?
            </span>
          </div>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              Order confirmation sent to your email
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              Your keyboard will be assembled
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              Shipped and tracking number provided
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors duration-200 rounded-sm flex items-center gap-2"
          >
            Return to Home
            <ArrowRight className="w-4 h-4" />
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-black rounded-full" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
