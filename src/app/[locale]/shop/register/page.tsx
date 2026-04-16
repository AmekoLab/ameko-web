"use client";

import { useState, useCallback } from "react";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { registerShop } from "@/src/store/slices/shopSlice";
import {
  RegisterShopSchema,
  RegisterShopSchemaType,
} from "@/src/features/shop/schemas/registerShop.schema";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  Camera,
  CreditCard,
  User,
  CheckCircle2,
  UploadCloud,
  Loader2,
} from "lucide-react";

interface ImageUploadProps {
  name: "logoImage" | "bannerImage";
  register: UseFormRegister<RegisterShopSchemaType>;
  setValue: UseFormSetValue<RegisterShopSchemaType>;
  preview: string | null;
  setPreview: (url: string | null) => void;
  error?: string;
  type: "banner" | "logo";
}

const ImageUpload = ({
  name,
  register,
  setValue,
  preview,
  setPreview,
  error,
  type,
}: ImageUploadProps) => {
  const t = useTranslations("ShopRegisterPage");
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        setValue(name, [file]);
        setPreview(URL.createObjectURL(file));
      }
    },
    [name, setValue, setPreview],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const containerClass =
    type === "banner"
      ? "w-full h-48 md:h-64 rounded-t-sm bg-black border border-[#1e2126] border-dashed relative overflow-hidden group hover:border-[#f5d800] transition-all"
      : "w-32 h-32 md:w-40 md:h-40 rounded-full bg-black border-4 border-[#151515] shadow-lg relative overflow-hidden group cursor-pointer hover:border-[#f5d800] transition-all";

  return (
    <div className="relative">
      <div
        className={`${containerClass} ${isDragging ? "border-blue-500 bg-blue-50" : ""} ${error ? "border-red-500" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
          {...register(name)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            register(name).onChange(e);
            handleChange(e);
          }}
        />

        {preview ? (
          <Image
            src={preview}
            alt={t("imageUpload.previewAlt")}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
            <Camera
              className={`${type === "banner" ? "w-8 h-8" : "w-6 h-6"} mb-2 ${isDragging ? "text-[#f5d800]" : ""}`}
            />
            {type === "banner" && (
              <span className="text-[11px] font-bold uppercase tracking-widest text-center px-4">
                {t("imageUpload.bannerPrompt")}
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <UploadCloud className="text-white w-8 h-8" />
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 text-center font-bold">
          {error}
        </p>
      )}
    </div>
  );
};

// --- TRANG CHÍNH ---
export default function RegisterShopPage() {
  const t = useTranslations("ShopRegisterPage");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.shop);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterShopSchemaType>({
    resolver: zodResolver(RegisterShopSchema),
  });

  const onSubmit = async (data: RegisterShopSchemaType) => {
    try {
      const res = await dispatch(registerShop(data)).unwrap();

      if (res) {
        toast.success(t("toast.submitSuccess"));

        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("toast.submitFailed"),
      );
    }
  };

  return (
    <div className="py-6 px-2 md:px-0 relative">
      <div className="max-w-5xl mx-auto">
        {/* HEADER TEXT */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-black font-oswald uppercase tracking-widest text-white">
              {t("header.title")}
            </h1>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-2">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- SECTION 1: VISUAL IDENTITY  --- */}
          <div className="bg-[#151515] rounded-sm shadow-sm border border-[#1e2126]">
            {/* 1. Banner Area */}
            <div className="relative">
              <ImageUpload
                name="bannerImage"
                type="banner"
                register={register}
                setValue={setValue}
                preview={bannerPreview}
                setPreview={setBannerPreview}
                error={errors.bannerImage?.message as string}
              />

              {/* 2. Logo Area  */}
              <div className="absolute -bottom-16 left-6 md:left-10 z-30">
                <ImageUpload
                  name="logoImage"
                  type="logo"
                  register={register}
                  setValue={setValue}
                  preview={logoPreview}
                  setPreview={setLogoPreview}
                  error={errors.logoImage?.message as string}
                />
              </div>
            </div>

            {/* Spacer for Logo */}
            <div className="pt-20 px-6 md:px-10 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel
                    label={t("fields.shopName")}
                    error={errors.shopName?.message}
                    required
                  />
                  <input
                    {...register("shopName")}
                    className="form-input text-[13px] font-black uppercase tracking-wider text-white"
                    placeholder={t("placeholders.shopName")}
                  />
                </div>
                <div>
                  <InputLabel label={t("fields.bio")} />
                  <input
                    {...register("bio")}
                    className="form-input text-[13px] font-bold text-white"
                    placeholder={t("placeholders.bio")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: CONTACT & ADDRESS --- */}
          <div className="bg-[#151515] rounded-sm shadow-sm border border-[#1e2126] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-[#1e2126] pb-4">
              <User className="text-[#f5d800] w-5 h-5" />
              <h3 className="text-[13px] font-black text-white tracking-widest uppercase">
                {t("sections.contactDetails")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <InputLabel
                  label={t("fields.contactEmail")}
                  error={errors.contactEmail?.message}
                  required
                />
                <input
                  {...register("contactEmail")}
                  className="form-input text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.contactEmail")}
                />
              </div>
              <div className="md:col-span-1">
                <InputLabel
                  label={t("fields.phoneNumber")}
                  error={errors.phoneNumber?.message}
                  required
                />
                <input
                  {...register("phoneNumber")}
                  className="form-input text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.phoneNumber")}
                />
              </div>
              <div className="md:col-span-1">
                <InputLabel
                  label={t("fields.taxCode")}
                  error={errors.taxCode?.message}
                  required
                />
                <input
                  {...register("taxCode")}
                  className="form-input text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.taxCode")}
                />
              </div>
              <div className="md:col-span-3">
                <InputLabel
                  label={t("fields.address")}
                  error={errors.address?.message}
                  required
                />
                <input
                  {...register("address")}
                  className="form-input text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.address")}
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: BANKING & LEGAL --- */}
          <div className="bg-[#151515] rounded-sm shadow-sm border border-[#1e2126] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-[#1e2126] pb-4">
              <CreditCard className="text-[#f5d800] w-5 h-5" />
              <h3 className="text-[13px] font-black text-white tracking-widest uppercase">
                {t("sections.bankingInformation")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputLabel
                  label={t("fields.citizenId")}
                  error={errors.citizenId?.message}
                  required
                />
                <input
                  {...register("citizenId")}
                  className="form-input text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.citizenId")}
                />
              </div>
              <div>
                <InputLabel
                  label={t("fields.bankName")}
                  error={errors.bankName?.message}
                  required
                />
                <input
                  {...register("bankName")}
                  className="form-input text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.bankName")}
                />
              </div>
              <div>
                <InputLabel
                  label={t("fields.bankAccountNumber")}
                  error={errors.bankAccountNumber?.message}
                  required
                />
                <input
                  {...register("bankAccountNumber")}
                  className="form-input font-mono text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.bankAccountNumber")}
                />
              </div>
              <div>
                <InputLabel
                  label={t("fields.bankAccountName")}
                  error={errors.bankAccountName?.message}
                  required
                />
                <input
                  {...register("bankAccountName")}
                  className="form-input uppercase text-[13px] font-bold text-white tracking-wider"
                  placeholder={t("placeholders.bankAccountName")}
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-[13px] font-black text-black transition-all duration-200 bg-[#f5d800] uppercase tracking-widest rounded-sm hover:bg-[#ffe500] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto shadow-[0_0_15px_rgba(245,216,0,0.3)] disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("actions.processing")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t("actions.submitApplication")}{" "}
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 2px;
          border: 1px solid #1e2126;
          background-color: black;
          transition: all 0.2s;
          outline: none;
        }
        .form-input:focus:not(:disabled) {
          border-color: #f5d800;
          box-shadow: 0 0 0 1px rgba(245, 216, 0, 0.3);
        }
        .form-input::placeholder {
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}

// Component Label
const InputLabel = ({
  label,
  error,
  required,
}: {
  label: string;
  error?: string;
  required?: boolean;
}) => (
  <div className="flex justify-between mb-2 items-end">
    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
      {label} {required && <span className="text-[#f5d800]">*</span>}
    </label>
    {error && (
      <span className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
        {error}
      </span>
    )}
  </div>
);
