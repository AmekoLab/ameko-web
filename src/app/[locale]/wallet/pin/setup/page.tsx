"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { setupWalletPin } from "@/src/store/slices/walletSlice";
import { ShieldCheck, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

// ─── Zod Schema ──────────────────────────────────────────
const getPinSetupSchema = (t: any) =>
  z
    .object({
      currentPassword: z.string().min(1, t("valCurrentPassword")),
      newPin: z
        .string()
        .length(6, t("valNewPinLen"))
        .regex(/^\d{6}$/, t("valNewPinNum")),
      confirmPin: z.string().min(1, t("valConfirmPin")),
    })
    .refine((data) => data.newPin === data.confirmPin, {
      message: t("valConfirmPinMatch"),
      path: ["confirmPin"],
    });

type PinSetupFormData = z.infer<ReturnType<typeof getPinSetupSchema>>;

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
            className={` w-12 h-14 text-center text-xl font-bold rounded-sm border outline-none transition-all ${
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

// ─── Page Component ──────────────────────────────────────
export default function PinSetupPage() {
  const t = useTranslations("PinSetupPage");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { pinSetupLoading } = useAppSelector((state) => state.wallet);

  const [showPassword, setShowPassword] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");
  const schema = useMemo(() => getPinSetupSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PinSetupFormData>({
    resolver: zodResolver(schema),
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
          <div className="bg-white rounded-sm shadow-sm border border-amazon-border p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <ShieldCheck className="h-6 w-6 text-neutral-600" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-amazon-text font-oswald">
                {t("pageTitle")}
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-amazon-text mb-2">
                  {t("currentPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("currentPasswordPlaceholder")}
                    className={`text-amazon-text bg-white w-full border rounded-sm p-3 pr-12 outline-none transition-all ${
                      errors.currentPassword
                        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-amazon-border focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus"
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
              <div className="text-amazon-text">
                <label className="block text-sm font-semibold text-amazon-text mb-3">
                  {t("newPin")}
                </label>
                <PinInput
                  value={pinValue}
                  onChange={onPinChange}
                  error={errors.newPin?.message}
                
                />
              </div>

              {/* Confirm PIN */}
              <div className="text-amazon-text">
                <label className="block text-sm font-semibold text-amazon-text mb-3">
                  {t("confirmPin")}
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
                className="w-full rounded-sm bg-amazon-btnPrimary px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-amazon-text transition-all hover:brightness-95 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-oswald flex items-center justify-center gap-2"
              >
                {pinSetupLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {pinSetupLoading ? t("processing") : t("confirmBtn")}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Security Tips Sidebar ──────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 rounded-sm border border-amazon-border p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-amazon-textMuted" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-amazon-text font-oswald">
                {t("securityNotes")}
              </h3>
            </div>

            <ul className="space-y-3 text-sm text-amazon-textMuted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                {t("securityNote1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                {t("securityNote2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                {t("securityNote3")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
