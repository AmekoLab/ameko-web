"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { setupWalletPin } from "@/src/store/slices/walletSlice";
import { ShieldCheck, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Zod Schema ──────────────────────────────────────────
const pinSetupSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPin: z
      .string()
      .length(6, "Mã PIN phải gồm đúng 6 chữ số")
      .regex(/^\d{6}$/, "Mã PIN chỉ được chứa số"),
    confirmPin: z.string().min(1, "Vui lòng xác nhận mã PIN"),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "Mã PIN xác nhận không khớp",
    path: ["confirmPin"],
  });

type PinSetupFormData = z.infer<typeof pinSetupSchema>;

// ─── PIN Input Component ─────────────────────────────────
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
            className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all ${
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

// ─── Page Component ──────────────────────────────────────
export default function PinSetupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { pinSetupLoading } = useAppSelector((state) => state.wallet);

  const [showPassword, setShowPassword] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PinSetupFormData>({
    resolver: zodResolver(pinSetupSchema),
    defaultValues: {
      currentPassword: "",
      newPin: "",
      confirmPin: "",
    },
  });

  const onPinChange = (val: string) => {
    setPinValue(val);
    setValue("newPin", val, { shouldValidate: true });
  };

  const onConfirmPinChange = (val: string) => {
    setConfirmPinValue(val);
    setValue("confirmPin", val, { shouldValidate: true });
  };

  const onSubmit = async (data: PinSetupFormData) => {
    const result = await dispatch(
      setupWalletPin({
        currentPassword: data.currentPassword,
        newPin: data.newPin,
      }),
    );

    if (setupWalletPin.fulfilled.match(result)) {
      router.push("/shop/wallet");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Main Form Card ─────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-black font-oswald">
                Thiết lập mã PIN rút tiền
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu tài khoản"
                    className={`w-full border-2 rounded-lg p-3 pr-12 outline-none transition-all ${
                      errors.currentPassword
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                    {...register("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mã PIN mới (6 chữ số)
                </label>
                <PinInput
                  value={pinValue}
                  onChange={onPinChange}
                  error={errors.newPin?.message}
                />
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Xác nhận mã PIN
                </label>
                <PinInput
                  value={confirmPinValue}
                  onChange={onConfirmPinChange}
                  error={errors.confirmPin?.message}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pinSetupLoading}
                className="w-full rounded-lg bg-[#ce2a32] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b0242b] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-oswald flex items-center justify-center gap-2"
              >
                {pinSetupLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {pinSetupLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Security Tips Sidebar ──────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 font-oswald">
                Lưu ý bảo mật
              </h3>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#ce2a32] flex-shrink-0" />
                Mã PIN dùng để xác nhận các giao dịch rút tiền. Không chia sẻ mã
                này với bất kỳ ai.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#ce2a32] flex-shrink-0" />
                Chọn mã PIN không dễ đoán, tránh dùng ngày sinh hoặc số lặp lại
                (123456, 000000...).
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#ce2a32] flex-shrink-0" />
                Nếu quên mã PIN, bạn có thể đặt lại thông qua xác minh tài
                khoản.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
