"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchCurrentShop,
  patchShopProfile,
} from "@/src/store/slices/shopSlice";
import {
  UpdateShopSchema,
  UpdateShopSchemaType,
} from "@/src/features/shop/schemas/updateShop.schema";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  Camera,
  CreditCard,
  User,
  Save,
  UploadCloud,
  Store,
  Loader2,
} from "lucide-react";

// ==================== IMAGE UPLOAD COMPONENT ====================
interface ImageUploadProps {
  name: "logoImage" | "bannerImage";
  register: any;
  setValue: any;
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
      ? "w-full h-48 md:h-64 rounded-t-2xl bg-gray-100 border-2 border-dashed border-gray-300 relative overflow-hidden group hover:border-gray-400 transition-all"
      : "w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-white shadow-lg relative overflow-hidden group cursor-pointer hover:brightness-95 transition-all";

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
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-10">
            <Camera
              className={`${type === "banner" ? "w-8 h-8" : "w-6 h-6"} mb-2`}
            />
            {type === "banner" && (
              <span className="text-sm font-medium">
                Drag or click to upload banner
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

// ==================== INPUT LABEL COMPONENT ====================
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

// ==================== MAIN PAGE ====================
export default function ShopProfilePage() {
  const dispatch = useAppDispatch();
  const { currentShop, loading } = useAppSelector((state) => state.shop);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateShopSchemaType>({
    resolver: zodResolver(UpdateShopSchema),
  });

  // Fetch shop data on mount
  useEffect(() => {
    dispatch(fetchCurrentShop());
  }, [dispatch]);

  // Populate form when shop data loads
  useEffect(() => {
    if (currentShop) {
      reset({
        shopName: currentShop.shopName || "",
        bio: currentShop.bio || "",
        address: currentShop.address || "",
        phoneNumber: currentShop.phoneNumber || "",
        contactEmail: currentShop.contactEmail || "",
        bankName: currentShop.bankName || "",
        bankAccountNumber: currentShop.bankAccountNumber || "",
        bankAccountName: currentShop.bankAccountName || "",
      });

      if (currentShop.logoUrl) {
        setLogoPreview(currentShop.logoUrl);
      }
      if (currentShop.bannerUrl) {
        setBannerPreview(currentShop.bannerUrl);
      }
    }
  }, [currentShop, reset]);

  const onSubmit = async (data: UpdateShopSchemaType) => {
    setIsSubmitting(true);
    try {
      await dispatch(patchShopProfile(data)).unwrap();
      toast.success("Shop profile updated successfully!");
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to update shop profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading && !currentShop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          <p className="text-gray-500 text-sm">Loading shop profile...</p>
        </div>
      </div>
    );
  }

  // No shop found
  if (!loading && !currentShop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            No Shop Found
          </h2>
          <p className="text-gray-500">
            You haven&apos;t registered a shop yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-2 md:px-0">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black font-oswald uppercase text-gray-900">
              Shop Profile
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Update your shop&apos;s information and settings.
            </p>
          </div>
          {currentShop && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                currentShop.status === 1
                  ? "bg-green-100 text-green-700"
                  : currentShop.status === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : currentShop.status === 3
                      ? "bg-red-100 text-red-700"
                      : currentShop.status === 4
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-500"
              }`}
            >
              {currentShop.status === 1
                ? "Active"
                : currentShop.status === 0
                  ? "Pending"
                  : currentShop.status === 3
                    ? "Rejected"
                    : currentShop.status === 4
                      ? "Banned"
                      : "Inactive"}
            </span>
          )}
        </div>

        {/* Admin note (if rejected) */}
        {currentShop?.adminNote && currentShop.status === 3 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700 mb-1">
              Admin Rejection Note:
            </p>
            <p className="text-sm text-red-600">{currentShop.adminNote}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- SECTION 1: VISUAL IDENTITY --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
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

          {/* --- SECTION 2: CONTACT & ADDRESS --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <User className="text-[#ce2a32]" />
              <h3 className="text-lg font-bold text-gray-800 uppercase">
                Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
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
              <div className="md:col-span-1">
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
              <div className="md:col-span-3">
                <InputLabel
                  label="Address"
                  error={errors.address?.message}
                  required
                />
                <input
                  {...register("address")}
                  className="form-input"
                  placeholder="Shop address..."
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: BANKING INFORMATION --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
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
              <div className="md:col-span-2">
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
            </div>
          </div>

          {/* --- SHOP STATS (read-only) --- */}
          {currentShop && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Store className="text-[#ce2a32]" />
                <h3 className="text-lg font-bold text-gray-800 uppercase">
                  Shop Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentShop.rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentShop.totalSales ?? 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentShop.totalRevenue?.toLocaleString() ?? 0}₫
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-black font-oswald uppercase tracking-widest rounded-lg hover:bg-[#ce2a32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Save Changes <Save className="w-5 h-5" />
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
  );
}
