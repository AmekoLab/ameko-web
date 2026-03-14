"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  requestPinReset,
  submitPinReset,
} from "@/src/store/slices/walletSlice";
import { X, Loader2, Key, Mail, Lock, RefreshCw } from "lucide-react";

// ─── PIN Input (reusable) ────────────────────────────────
function PinInput({
  value,
  onChange,
  error,
  isPassword = false,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  isPassword?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    if (char && !/^\d$/.test(char)) return;
    const arr = digits.slice();
    arr[index] = char;
    const newVal = arr.join("").replace(/\s/g, "");
    onChange(newVal);
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type={isPassword ? "password" : "text"}
            inputMode="numeric"
            maxLength={1}
            value={digits[i]?.trim() || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-11 h-13 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-black"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

// ─── Zod Schema ──────────────────────────────────────────
const resetPinSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
    newPin: z
      .string()
      .length(6, "New PIN must be exactly 6 digits")
      .regex(/^\d{6}$/, "PIN must contain only numbers"),
    confirmNewPin: z.string(),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "Confirmation PIN does not match",
    path: ["confirmNewPin"],
  });

type ResetPinFormData = z.infer<typeof resetPinSchema>;

// ─── Component ───────────────────────────────────────────
interface ResetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPinModal({ isOpen, onClose }: ResetPinModalProps) {
  const dispatch = useAppDispatch();
  const { isRequestingOtp, isResettingPin } = useAppSelector(
    (state) => state.wallet,
  );

  const [step, setStep] = useState(1);
  const [otpValue, setOtpValue] = useState("");
  const [newPinValue, setNewPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ResetPinFormData>({
    resolver: zodResolver(resetPinSchema),
    defaultValues: {
      otp: "",
      newPin: "",
      confirmNewPin: "",
    },
  });

  const handleClose = useCallback(() => {
    setStep(1);
    setOtpValue("");
    setNewPinValue("");
    setConfirmPinValue("");
    setCooldown(0);
    reset();
    onClose();
  }, [onClose, reset]);

  const handleRequestOtp = async () => {
    const result = await dispatch(requestPinReset());
    if (requestPinReset.fulfilled.match(result)) {
      setStep(2);
      setCooldown(60);
    }
  };

  const handleResendOtp = async () => {
    const result = await dispatch(requestPinReset());
    if (requestPinReset.fulfilled.match(result)) {
      setCooldown(60);
    }
  };

  const onOtpChange = (val: string) => {
    setOtpValue(val);
    setValue("otp", val, { shouldValidate: true });
  };

  const onNewPinChange = (val: string) => {
    setNewPinValue(val);
    setValue("newPin", val, { shouldValidate: true });
  };

  const onConfirmPinChange = (val: string) => {
    setConfirmPinValue(val);
    setValue("confirmNewPin", val, { shouldValidate: true });
  };

  const onSubmit = async (data: ResetPinFormData) => {
    const result = await dispatch(
      submitPinReset({ otp: data.otp, newPin: data.newPin }),
    );
    if (submitPinReset.fulfilled.match(result)) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
              <Key className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-black font-oswald">
              Reset PIN
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ─── Step 1: Request OTP ─────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">
                  Verify via Email
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We will send a 6-digit OTP code to your registered email.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp}
                className="w-full rounded-lg bg-[#ce2a32] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b0242b] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-oswald flex items-center justify-center gap-2"
              >
                {isRequestingOtp && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isRequestingOtp ? "Sending..." : "Send verification code"}
              </button>
            </div>
          )}

          {/* ─── Step 2: Submit new PIN ──────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-500" />
                    OTP Code
                  </div>
                </label>
                <PinInput
                  value={otpValue}
                  onChange={onOtpChange}
                  error={errors.otp?.message}
                />

                {/* Resend OTP */}
                <div className="flex justify-center mt-3">
                  {cooldown > 0 ? (
                    <span className="text-xs text-gray-400">
                      Resend code in{" "}
                      <strong className="text-gray-600">{cooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isRequestingOtp}
                      className="flex items-center gap-1 text-xs font-medium text-[#ce2a32] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {isRequestingOtp ? "Sending..." : "Resend code"}
                    </button>
                  )}
                </div>
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-gray-500" />
                    New PIN
                  </div>
                </label>
                <PinInput
                  value={newPinValue}
                  onChange={onNewPinChange}
                  error={errors.newPin?.message}
                  isPassword
                />
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Confirm New PIN
                  </div>
                </label>
                <PinInput
                  value={confirmPinValue}
                  onChange={onConfirmPinChange}
                  error={errors.confirmNewPin?.message}
                  isPassword
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isResettingPin}
                className="w-full rounded-lg bg-[#ce2a32] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b0242b] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-oswald flex items-center justify-center gap-2"
              >
                {isResettingPin && <Loader2 className="h-4 w-4 animate-spin" />}
                {isResettingPin ? "Processing..." : "Reset PIN"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
