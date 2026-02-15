"use client";

import Link from "next/link";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";

export default function PaymentFailPage() {
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
