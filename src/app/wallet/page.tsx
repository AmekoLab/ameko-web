"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchWalletDetails,
  initializeWallet,
  checkPinStatus,
} from "@/src/store/slices/walletSlice";
import { Wallet, ShieldAlert, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WithdrawModal from "@/src/components/Shop/WithdrawModal";
import ResetPinModal from "@/src/components/Shop/ResetPinModal";
import ChangePinModal from "@/src/components/Shop/ChangePinModal";
import HeldTransactionsModal from "@/src/components/Shop/HeldTransactionsModal";

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { details, loading, hasPin } = useAppSelector((state) => state.wallet);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isHeldOpen, setIsHeldOpen] = useState(false);

  const isCustomer = !pathname?.startsWith("/shop");

  useEffect(() => {
    dispatch(fetchWalletDetails());
    if (!isCustomer) {
      dispatch(checkPinStatus());
    }
  }, [dispatch, isCustomer]);

  // ─── Wallet Activation Card ────────────────────────────
  if (!details && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-10 max-w-md w-full text-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-100 relative z-10 shadow-sm">
            <Wallet className="h-10 w-10 text-neutral-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-3 relative z-10">
            Activate Your Wallet
          </h2>

          {/* Description */}
          <p className="text-neutral-500 mb-8 text-sm leading-relaxed relative z-10">
            Initialize your secure wallet to start managing your balance, processing refunds, and reviewing platform transactions.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => dispatch(initializeWallet())}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-md hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
          >
            Initialize Wallet <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neutral-400 mb-4" />
        <p className="text-sm font-medium text-neutral-500">Loading wallet securely...</p>
      </div>
    );
  }

  // ─── Wallet Dashboard ─────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 md:py-12 w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hidden sm:block shadow-sm border border-blue-100">
            <Wallet className="w-6 h-6" />
          </div>
          My Wallet
        </h1>
        <p className="mt-2 text-sm text-neutral-500 font-medium">Manage your funds, track balances, and request withdrawals.</p>
      </div>

      {/* ─── PIN Security Alert (Shop only) ──────────────────────── */}
      {!isCustomer && hasPin === false && (
        <div className="flex items-start gap-4 rounded-2xl bg-yellow-50/80 border border-yellow-200 p-5 mb-8 shadow-sm relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400"></div>
          <div className="bg-yellow-100 p-2 rounded-lg shrink-0 border border-yellow-200 group-hover:scale-105 transition-transform">
             <ShieldAlert className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 leading-snug mb-1.5">
              Action Required: Wallet Security Incomplete
            </p>
            <p className="text-sm text-yellow-800/80 mb-3">
               You need to set up a secure PIN code before you can withdraw any funds from your wallet.
            </p>
            <Link
              href="/shop/wallet/pin/setup"
              className="inline-flex items-center gap-1 text-sm font-bold text-yellow-700 hover:text-yellow-900 transition-colors bg-white/50 px-3 py-1.5 rounded-md hover:bg-white"
            >
              Set up PIN now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Wallet Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-100 relative overflow-hidden group">
        {/* Decorative flair */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-1000"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-end gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-100 shrink-0">
              <Wallet className="h-8 w-8 text-neutral-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Total Available Balance
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-bold tracking-tight text-amazon-price">
                  {details?.balance?.toLocaleString("vi-VN") ?? 0}
                </p>
                <span className="text-xl font-bold text-amazon-price/80">₫</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Balance Strip */}
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex items-center justify-between mb-8 relative z-10">
            <span className="text-sm font-semibold text-neutral-600">Pending Escrow Balance</span>
            <button
               type="button"
               onClick={() => setIsHeldOpen(true)}
               className="text-base font-bold text-neutral-900 bg-white px-4 py-1.5 rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow transition-all group-content"
             >
               {details?.heldBalance?.toLocaleString("vi-VN") ?? 0} ₫
               <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
             </button>
        </div>

        {/* Action Buttons (Shop only) */}
        {!isCustomer && (
          <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-neutral-50 pt-8 relative z-10">
            <button
              disabled={hasPin === false}
              onClick={() => setIsWithdrawOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group-action"
            >
              Withdraw Funds
            </button>

            {hasPin && (
              <button
                onClick={() => setIsChangePinOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-white border border-neutral-200 px-6 py-3.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4 text-neutral-400 group-hover:rotate-45 transition-transform" /> Change PIN
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shop-only Modals: Withdraw, Reset PIN, Change PIN */}
      {!isCustomer && (
        <>
          <WithdrawModal
            isOpen={isWithdrawOpen}
            onClose={() => setIsWithdrawOpen(false)}
            onOpenResetPin={() => setIsResetPinOpen(true)}
          />
          <ResetPinModal
            isOpen={isResetPinOpen}
            onClose={() => setIsResetPinOpen(false)}
          />
          <ChangePinModal
            isOpen={isChangePinOpen}
            onClose={() => setIsChangePinOpen(false)}
          />
        </>
      )}

      {/* Held Transactions Modal — available to all roles */}
      <HeldTransactionsModal
        isOpen={isHeldOpen}
        onClose={() => setIsHeldOpen(false)}
      />
    </div>
  );
}
