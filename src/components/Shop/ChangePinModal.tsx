"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { changeWalletPin } from "@/src/store/slices/walletSlice";
import { X, Loader2, KeyRound } from "lucide-react";

// ─── PIN Input (reusable) ────────────────────────────────
function PinInput({
  value,
  onChange,
  error,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  label: string;
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
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
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
const changePinSchema = z
  .object({
    oldPin: z
      .string()
      .length(6, "Mã PIN phải gồm đúng 6 chữ số")
      .regex(/^\d{6}$/, "Mã PIN chỉ được chứa số"),
    newPin: z
      .string()
      .length(6, "Mã PIN phải gồm đúng 6 chữ số")
      .regex(/^\d{6}$/, "Mã PIN chỉ được chứa số"),
    confirmNewPin: z
      .string()
      .length(6, "Mã PIN phải gồm đúng 6 chữ số")
      .regex(/^\d{6}$/, "Mã PIN chỉ được chứa số"),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "Mã PIN xác nhận không khớp",
    path: ["confirmNewPin"],
  });

type ChangePinFormData = z.infer<typeof changePinSchema>;

// ─── Component ───────────────────────────────────────────
interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePinModal({
  isOpen,
  onClose,
}: ChangePinModalProps) {
  const dispatch = useAppDispatch();
  const { isChangingPin } = useAppSelector((state) => state.wallet);

  const [oldPinValue, setOldPinValue] = useState("");
  const [newPinValue, setNewPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ChangePinFormData>({
    resolver: zodResolver(changePinSchema),
    defaultValues: {
      oldPin: "",
      newPin: "",
      confirmNewPin: "",
    },
  });

  const handleClose = () => {
    reset();
    setOldPinValue("");
    setNewPinValue("");
    setConfirmPinValue("");
    onClose();
  };

  const onSubmit = async (data: ChangePinFormData) => {
    const result = await dispatch(
      changeWalletPin({
        oldPin: data.oldPin,
        newPin: data.newPin,
        confirmNewPin: data.confirmNewPin,
      }),
    );

    if (changeWalletPin.fulfilled.match(result)) {
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
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-black font-oswald">
              Đổi Mã PIN Rút Tiền
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Old PIN */}
          <PinInput
            label="Mã PIN hiện tại"
            value={oldPinValue}
            onChange={(val) => {
              setOldPinValue(val);
              setValue("oldPin", val, { shouldValidate: true });
            }}
            error={errors.oldPin?.message}
          />

          {/* New PIN */}
          <PinInput
            label="Mã PIN mới"
            value={newPinValue}
            onChange={(val) => {
              setNewPinValue(val);
              setValue("newPin", val, { shouldValidate: true });
            }}
            error={errors.newPin?.message}
          />

          {/* Confirm New PIN */}
          <PinInput
            label="Xác nhận mã PIN mới"
            value={confirmPinValue}
            onChange={(val) => {
              setConfirmPinValue(val);
              setValue("confirmNewPin", val, { shouldValidate: true });
            }}
            error={errors.confirmNewPin?.message}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isChangingPin}
            className="w-full rounded-lg bg-[#ce2a32] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b0242b] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-oswald flex items-center justify-center gap-2"
          >
            {isChangingPin && <Loader2 className="h-4 w-4 animate-spin" />}
            {isChangingPin ? "Đang xử lý..." : "Đổi mã PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
