"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateShopProfile } from "@/src/store/slices/shopSlice";
import {
  UpdateShopSchema,
  UpdateShopSchemaType,
} from "@/src/features/shop/schemas/updateShop.schema";
import { ShopResponse } from "@/src/types/shop.types";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  X,
  Camera,
  CreditCard,
  User,
  CheckCircle2,
  UploadCloud,
  AlertCircle,
} from "lucide-react";

interface UpdateShopApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopData: ShopResponse | null;
}

export const UpdateShopApplicationModal = ({
  isOpen,
  onClose,
  shopData,
}: UpdateShopApplicationModalProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.shop);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateShopSchemaType>({
    resolver: zodResolver(UpdateShopSchema),
  });

  // Pre-fill form with existing shop data when modal opens
  useEffect(() => {
    if (isOpen && shopData) {
      reset({
        shopName: shopData.shopName || "",
        bio: shopData.bio || "",
        address: shopData.address || "",
        phoneNumber: shopData.phoneNumber || "",
        contactEmail: shopData.contactEmail || "",
        bankName: shopData.bankName || "",
        bankAccountNumber: shopData.bankAccountNumber || "",
        bankAccountName: shopData.bankAccountName || "",
      });
    }
  }, [isOpen, shopData, reset]);

  // Update image previews from existing shop data
  useEffect(() => {
    if (isOpen && shopData) {
      setLogoPreview(shopData.logoUrl || null);
      setBannerPreview(shopData.bannerUrl || null);
    }
  }, [isOpen, shopData]);

  if (!isOpen || !shopData) return null;

  const onSubmit = async (data: UpdateShopSchemaType) => {
    try {
      await dispatch(updateShopProfile(data)).unwrap();
      toast.success(
        "Application updated successfully! Please wait for approval.",
      );
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Update failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold font-oswald uppercase text-gray-900 flex items-center gap-3">
              Update Shop Application
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Update your information and resubmit for approval.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY (SCROLLABLE FORM) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-0 bg-gray-50"
        >
          {/* Admin Note (if rejected) */}
          {shopData.adminNote && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {shopData.adminNote}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: VISUAL IDENTITY (BANNER & LOGO) */}
          <div className="m-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="relative">
              {/* Banner Upload */}
              <ImageUploadArea
                name="bannerImage"
                type="banner"
                register={register}
                setValue={setValue}
                preview={bannerPreview}
                setPreview={setBannerPreview}
                error={errors.bannerImage?.message as string}
              />

              {/* Logo Upload (Overlapping) */}
              <div className="absolute -bottom-16 left-6 md:left-10 z-30">
                <ImageUploadArea
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

            {/* Spacer + Shop Name & Bio */}
            <div className="pt-20 px-6 md:px-10 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel
                    label="Shop Name"
                    error={errors.shopName?.message}
                    required
                  />
                  <input
                    {...register("shopName")}
                    className="form-input text-lg font-bold"
                    placeholder="Shop Name..."
                  />
                </div>
                <div>
                  <InputLabel label="Slogan / Bio" />
                  <input
                    {...register("bio")}
                    className="form-input"
                    placeholder="Short slogan or description..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT & ADDRESS */}
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <User className="text-[#ce2a32]" />
              <h3 className="text-lg font-bold text-gray-800 uppercase">
                Contact Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputLabel
                  label="Contact Email"
                  error={errors.contactEmail?.message}
                  required
                />
                <input
                  {...register("contactEmail")}
                  className="form-input"
                  placeholder="email@domain.com"
                />
              </div>
              <div>
                <InputLabel
                  label="Phone Number"
                  error={errors.phoneNumber?.message}
                  required
                />
                <input
                  {...register("phoneNumber")}
                  className="form-input"
                  placeholder="09xxx..."
                />
              </div>
              <div className="md:col-span-2">
                <InputLabel
                  label="Pickup Address"
                  error={errors.address?.message}
                  required
                />
                <input
                  {...register("address")}
                  className="form-input"
                  placeholder="Warehouse pickup address..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: BANKING */}
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <CreditCard className="text-[#ce2a32]" />
              <h3 className="text-lg font-bold text-gray-800 uppercase">
                Banking Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputLabel
                  label="Bank Name"
                  error={errors.bankName?.message}
                  required
                />
                <input
                  {...register("bankName")}
                  className="form-input"
                  placeholder="Bank Name"
                />
              </div>
              <div>
                <InputLabel
                  label="Account Holder Name"
                  error={errors.bankAccountName?.message}
                  required
                />
                <input
                  {...register("bankAccountName")}
                  className="form-input uppercase"
                  placeholder="Account Holder Name"
                />
              </div>
              <div className="md:col-span-2">
                <InputLabel
                  label="Account Number"
                  error={errors.bankAccountNumber?.message}
                  required
                />
                <input
                  {...register("bankAccountNumber")}
                  className="form-input font-mono"
                  placeholder="Account Number"
                />
              </div>
            </div>
          </div>

          {/* FOOTER: Submit */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-wider rounded-lg hover:bg-[#ce2a32] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">Processing...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Resubmit Application <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            font-size: 0.95rem;
            transition: all 0.2s;
            outline: none;
          }
          .form-input:focus {
            border-color: #ce2a32;
            background-color: #fff;
            box-shadow: 0 0 0 4px rgba(206, 42, 50, 0.1);
          }
          .form-input::placeholder {
            color: #9ca3af;
          }
        `}</style>
      </div>
    </div>
  );
};

// --- Image Upload Area ---
interface ImageUploadAreaProps {
  name: "logoImage" | "bannerImage";
  register: any;
  setValue: any;
  preview: string | null;
  setPreview: (url: string | null) => void;
  error?: string;
  type: "banner" | "logo";
}

const ImageUploadArea = ({
  name,
  register,
  setValue,
  preview,
  setPreview,
  error,
  type,
}: ImageUploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        setValue(name, dt.files);
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
      ? "w-full h-48 md:h-56 rounded-t-2xl bg-gray-100 border-2 border-dashed border-gray-300 relative overflow-hidden group hover:border-gray-400 transition-all"
      : "w-28 h-28 md:w-36 md:h-36 rounded-full bg-white border-4 border-white shadow-lg relative overflow-hidden group cursor-pointer hover:brightness-95 transition-all";

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
          onChange={(e) => {
            register(name).onChange(e);
            handleChange(e);
          }}
        />

        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-10">
            <Camera
              className={`${type === "banner" ? "w-8 h-8" : "w-6 h-6"} mb-2`}
            />
            {type === "banner" && (
              <span className="text-sm font-medium">
                Drag Banner Here or Click
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

// --- InputLabel ---
const InputLabel = ({
  label,
  error,
  required,
}: {
  label: string;
  error?: string;
  required?: boolean;
}) => (
  <div className="flex justify-between mb-1.5 items-end">
    <label className="text-sm font-bold text-gray-700">
      {label} {required && <span className="text-[#ce2a32]">*</span>}
    </label>
    {error && (
      <span className="text-[#ce2a32] text-xs font-semibold animate-pulse">
        {error}
      </span>
    )}
  </div>
);
