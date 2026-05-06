"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { requestWithdraw } from "@/src/store/slices/walletSlice";
import { X, Loader2, Wallet, AlertCircle } from "lucide-react";

// ─── PIN Input (reusable) ────────────────────────────────
function PinInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
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
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]?.trim() || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-11 h-13 text-center text-xl font-bold rounded-sm border outline-none transition-all ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-amazon-border focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus"
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

// ─── Component ───────────────────────────────────────────
interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResetPin?: () => void;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  onOpenResetPin,
}: WithdrawModalProps) {
  const dispatch = useAppDispatch();
  const { details, withdrawLoading } = useAppSelector((state) => state.wallet);
  const availableBalance = details?.balance ?? 0;

  const [pinValue, setPinValue] = useState("");
  const [wrongPinError, setWrongPinError] = useState(false);

  // ─── Zod schema (uses runtime balance for max validation)
  const withdrawSchema = z.object({
    amount: z
      .string()
      .min(1, "Please enter a valid amount")
      .refine((val) => {
        const num = Number(val.replace(/\D/g, ""));
        return num > 0;
      }, "Amount must be greater than 0")
      .refine((val) => {
        const num = Number(val.replace(/\D/g, ""));
        return num <= availableBalance;
      }, "Amount exceeds available balance"),
    walletPin: z
      .string()
      .length(6, "PIN must be exactly 6 digits")
      .regex(/^\d{6}$/, "PIN must contain only numbers"),
  });

  type WithdrawFormData = z.infer<typeof withdrawSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      walletPin: "",
    },
  });

  const onPinChange = (val: string) => {
    setPinValue(val);
    setWrongPinError(false);
    setValue("walletPin", val, { shouldValidate: true });
  };

  const fillMax = () => {
    const formatted = new Intl.NumberFormat("vi-VN").format(availableBalance);
    setValue("amount", formatted, { shouldValidate: true });
  };

  const handleClose = () => {
    reset();
    setPinValue("");
    setWrongPinError(false);
    onClose();
  };

  const handleOpenResetPin = () => {
    handleClose();
    onOpenResetPin?.();
  };

  const onSubmit = async (data: WithdrawFormData) => {
    setWrongPinError(false);
    const rawAmount = Number(data.amount.replace(/\D/g, ""));
    const result = await dispatch(
      requestWithdraw({
        amount: rawAmount,
        walletPin: data.walletPin,
      }),
    );

    if (requestWithdraw.fulfilled.match(result)) {
      handleClose();
    }

    if (requestWithdraw.rejected.match(result)) {
      const msg = (result.payload as string) || "";
      if (
        msg.toLowerCase().includes("pin") ||
        msg.toLowerCase().includes("incorrect") ||
        msg.toLowerCase().includes("invalid")
      ) {
        setWrongPinError(true);
      }
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
      <div className="relative bg-white rounded-sm shadow-xl border border-amazon-border w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amazon-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <Wallet className="h-5 w-5 text-neutral-600" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-amazon-text ">
              Withdraw to Bank
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-sm hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-amazon-textMuted" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-neutral-50 border border-amazon-border rounded-sm p-4 text-center">
            <p className="text-xs text-amazon-textMuted uppercase tracking-wide  mb-1">
              Available Balance
            </p>
            <p className="text-2xl font-black text-amazon-price ">
              {availableBalance.toLocaleString("en-US")}
              <span className="text-base ml-1">₫</span>
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-amazon-text mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter amount"
                className={`w-full border rounded-sm p-3 pr-20 outline-none transition-all ${
                  errors.amount
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-amazon-border focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus"
                }`}
                {...register("amount")}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  if (!rawValue) {
                    setValue("amount", "", { shouldValidate: true });
                  } else {
                    const formatted = new Intl.NumberFormat("vi-VN").format(Number(rawValue));
                    setValue("amount", formatted, { shouldValidate: true });
                  }
                }}
              />
              <button
                type="button"
                onClick={fillMax}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm bg-neutral-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amazon-text hover:bg-neutral-300 transition-colors  border border-amazon-border"
              >
                Max
              </button>
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-semibold text-amazon-text mb-3">
              Wallet PIN
            </label>
            <PinInput
              value={pinValue}
              onChange={onPinChange}
              error={errors.walletPin?.message}
            />

            {/* Wrong PIN inline alert */}
            {wrongPinError && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  Incorrect PIN.{" "}
                  <button
                    type="button"
                    onClick={handleOpenResetPin}
                    className="font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Reset PIN now
                  </button>
                </p>
              </div>
            )}

            {/* Forgot PIN link */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleOpenResetPin}
                className="text-xs text-amazon-link hover:text-amazon-focus hover:underline transition-colors"
              >
                Forgot PIN?
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={withdrawLoading}
            className="w-full rounded-sm bg-amazon-btnPrimary px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-amazon-text transition-all hover:brightness-95 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed  flex items-center justify-center gap-2"
          >
            {withdrawLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {withdrawLoading ? "Processing..." : "Confirm Withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
}
