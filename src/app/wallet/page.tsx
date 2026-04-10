"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchWalletDetails,
  initializeWallet,
  checkPinStatus,
} from "@/src/store/slices/walletSlice";
import { Wallet, ShieldAlert } from "lucide-react";
import Link from "next/link";
import WithdrawModal from "@/src/components/Shop/WithdrawModal";
import ResetPinModal from "@/src/components/Shop/ResetPinModal";
import ChangePinModal from "@/src/components/Shop/ChangePinModal";
import HeldTransactionsModal from "@/src/components/Shop/HeldTransactionsModal";

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const { details, loading, hasPin } = useAppSelector((state) => state.wallet);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isHeldOpen, setIsHeldOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWalletDetails());
    dispatch(checkPinStatus());
  }, [dispatch]);

  // ─── Wallet Activation Card ────────────────────────────
  if (!details && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-sm shadow-sm p-10 max-w-md w-full text-center border border-amazon-border">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
            <Wallet className="h-10 w-10 text-neutral-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black uppercase tracking-tight text-amazon-text  mb-3">
            Activate your wallet
          </h2>

          {/* Description */}
          <p className="text-amazon-textMuted mb-8 text-sm leading-relaxed">
            Initialize your wallet to start managing your balance and making
            transactions on the platform.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => dispatch(initializeWallet())}
            className="w-full rounded-sm bg-amazon-btnPrimary px-6 py-3 text-sm font-bold uppercase tracking-wider text-amazon-text transition-all shadow-sm hover:brightness-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed  "
          >
            Initialize wallet now
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ce2a32]" />
      </div>
    );
  }

  // ─── Wallet Dashboard ─────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black uppercase tracking-tight text-amazon-text  mb-6">
        My Wallet
      </h1>

      {/* ─── PIN Security Alert ──────────────────────── */}
      {hasPin === false && (
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-300 p-4 mb-6">
          <ShieldAlert className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              Wallet security is incomplete! You need to set up a PIN to be able
              to withdraw money.
            </p>
            <Link
              href="/shop/wallet/pin/setup"
              className="mt-2 inline-block text-sm font-bold uppercase tracking-wide text-amazon-link hover:text-amazon-focus hover:underline "
            >
              Set up now →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-sm p-8 border border-amazon-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <Wallet className="h-7 w-7 text-neutral-600" />
          </div>
          <div>
            <p className="text-sm text-amazon-textMuted uppercase tracking-wide ">
              Current Balance
            </p>
            <p className="text-3xl font-black text-amazon-price ">
              {details?.balance?.toLocaleString("vi-VN") ?? 0}

              <span className="text-lg ml-1">₫</span>
            </p>
            <p className="text-sm text-amazon-textMuted mt-1">
              Pending balance:{" "}
              <button
                type="button"
                onClick={() => setIsHeldOpen(true)}
                className="font-semibold text-amazon-link hover:text-amazon-focus hover:underline cursor-pointer"
              >
                {details?.heldBalance?.toLocaleString("vi-VN") ?? 0} ₫
              </button>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            disabled={hasPin === false}
            onClick={() => setIsWithdrawOpen(true)}
            className="rounded-sm bg-amazon-btnPrimary px-6 py-3 text-sm font-bold uppercase tracking-wider text-amazon-text shadow-sm transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed  "
          >
            Withdraw
          </button>

          {hasPin && (
            <button
              onClick={() => setIsChangePinOpen(true)}
              className="rounded-sm border border-amazon-border px-6 py-3 text-sm font-bold uppercase tracking-wider text-amazon-text transition-all hover:bg-neutral-50 active:scale-[0.98] shadow-sm "
            >
              Change PIN
            </button>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onOpenResetPin={() => setIsResetPinOpen(true)}
      />

      {/* Reset PIN Modal */}
      <ResetPinModal
        isOpen={isResetPinOpen}
        onClose={() => setIsResetPinOpen(false)}
      />

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />

      {/* Held Transactions Modal */}
      <HeldTransactionsModal
        isOpen={isHeldOpen}
        onClose={() => setIsHeldOpen(false)}
      />
    </div>
  );
}
