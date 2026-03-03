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
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-gray-100">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black">
            <Wallet className="h-10 w-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black uppercase tracking-tight text-black font-oswald mb-3">
            Kích hoạt ví của bạn
          </h2>

          {/* Description */}
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Khởi tạo ví để bắt đầu quản lý số dư và thực hiện các giao dịch trên
            nền tảng.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => dispatch(initializeWallet())}
            className="w-full rounded-lg bg-[#ce2a32] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b0242b] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-oswald"
          >
            Khởi tạo ví ngay
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
      <h1 className="text-2xl font-black uppercase tracking-tight text-black font-oswald mb-6">
        Ví của tôi
      </h1>

      {/* ─── PIN Security Alert ──────────────────────── */}
      {hasPin === false && (
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-300 p-4 mb-6">
          <ShieldAlert className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              Bảo mật ví chưa hoàn thiện! Bạn cần thiết lập mã PIN để có thể
              thực hiện rút tiền.
            </p>
            <Link
              href="/shop/wallet/pin/setup"
              className="mt-2 inline-block text-sm font-bold uppercase tracking-wide text-[#ce2a32] hover:underline font-oswald"
            >
              Thiết lập ngay →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide font-oswald">
              Số dư hiện tại
            </p>
            <p className="text-3xl font-black text-[#ce2a32] font-oswald">
              {details?.balance?.toLocaleString("vi-VN") ?? 0}

              <span className="text-lg ml-1">₫</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Số dư đang chờ xử lý:{" "}
              <button
                type="button"
                onClick={() => setIsHeldOpen(true)}
                className="font-semibold text-orange-500 hover:underline cursor-pointer"
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
            className="rounded-lg bg-black px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-oswald"
          >
            Rút tiền
          </button>

          {hasPin && (
            <button
              onClick={() => setIsChangePinOpen(true)}
              className="rounded-lg border-2 border-gray-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] font-oswald"
            >
              Đổi PIN
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
