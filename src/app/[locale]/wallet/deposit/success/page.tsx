"use client";

import { useEffect, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, RefreshCw, Wallet } from "lucide-react";
import { paymentService } from "@/src/services/payment.service";

function DepositSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");
  
  const referenceId = sessionId || orderId;
  const [isVerifying, setIsVerifying] = useState(!!sessionId);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  // Poll verify-session endpoint for Stripe payments
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isMounted = true;

    if (sessionId && isPaid !== true) {
      setIsVerifying(true);
      const verify = async () => {
        try {
          const res = await paymentService.verifySession(sessionId);
          if (res.data?.isPaid && isMounted) {
            setIsPaid(true);
            setIsVerifying(false);
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Verification error:", e);
        }
      };

      verify();
      interval = setInterval(verify, 3000);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    } else if (!sessionId) {
      setIsVerifying(false);
      setIsPaid(true);
    }
  }, [sessionId, isPaid]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <Link href="/wallet" className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          AMEKO WALLET
        </h1>
      </Link>

      <div className="bg-white border border-gray-200 rounded-md p-6 sm:p-8 max-w-[420px] w-full text-center shadow-sm flex flex-col items-center">
        {/* Status Icon */}
        <div className="py-2 w-full">
          {isVerifying ? (
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <RefreshCw className="text-blue-600 w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 animate-[scale-in_0.5s_ease-out]">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
          )}
          
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
            {isVerifying ? "Processing Deposit..." : "Deposit Successful!"}
          </h2>
          
          <p className="text-[13px] text-gray-500 mb-2 leading-relaxed">
            {isVerifying
              ? "We're verifying your transaction with the gateway. This may take a few seconds..."
              : "Your funds have been successfully added to your wallet."}
          </p>

          {/* Transaction Details */}
          {referenceId && (
            <div className="mt-6 mb-6 text-left border border-gray-200 rounded-sm bg-neutral-50 p-4 w-full">
              <h3 className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider border-b border-gray-200 pb-2">
                Transaction Details
              </h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-500 font-medium shrink-0">Reference</span>
                  <span className="font-bold font-mono text-[11px] text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-200 line-clamp-1 break-all flex-1 text-right ml-4">
                    {referenceId}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/wallet"
            className="bg-black text-white hover:bg-gray-800 py-3 px-6 rounded-sm block w-full font-bold uppercase tracking-widest text-[13px] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" /> Go to Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DepositSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <DepositSuccessContent />
    </Suspense>
  );
}
