"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchCurrentShop,
  patchShopProfile,
  deactivateShop,
  reactivateShop,
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
  Power,
  PowerOff,
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
      ? "w-full h-48 md:h-64 rounded-md bg-neutral-50 border border-dashed border-amazon-border relative overflow-hidden group hover:border-amazon-focus transition-all"
      : "w-32 h-32 md:w-40 md:h-40 rounded-full bg-neutral-50 border-4 border-white shadow-md relative overflow-hidden group cursor-pointer hover:border-amazon-focus transition-all";

  return (
    <div className="relative">
      <div
        className={`${containerClass} ${isDragging ? "border-amazon-focus bg-blue-50" : ""} ${error ? "border-red-600" : ""}`}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-amazon-textMuted z-10">
            <Camera
              className={`${type === "banner" ? "w-8 h-8" : "w-6 h-6"} mb-2 ${isDragging ? "text-amazon-link" : ""}`}
            />
            {type === "banner" && (
              <span className="text-sm font-medium text-center px-4">
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
        <p className="text-red-600 text-xs mt-1 text-center">
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
    <label className="text-sm font-medium text-amazon-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && (
      <span className="text-red-600 text-xs font-medium">
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

  // State quản lý Modal Xác nhận và Trạng thái loading
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateShopSchemaType>({
    resolver: zodResolver(UpdateShopSchema),
  });

  useEffect(() => {
    dispatch(fetchCurrentShop());
  }, [dispatch]);

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

  // --- HÀM THỰC THI BẬT/TẮT SAU KHI XÁC NHẬN ---
  const executeToggleStatus = async () => {
    if (!currentShop) return;

    // Sử dụng trường isActive từ Backend trả về
    const isCurrentlyActive = currentShop.isActive;
    setIsToggling(true);

    try {
      if (isCurrentlyActive) {
        await dispatch(deactivateShop()).unwrap();
        toast.success("Shop has been temporarily closed.");
      } else {
        await dispatch(reactivateShop()).unwrap();
        toast.success("Shop has been reopened.");
      }
      // Reload shop info to get latest isActive
      dispatch(fetchCurrentShop());
      setIsConfirmModalOpen(false); // Close modal on success
    } catch (error: any) {
      toast.error(error || "Action failed. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  // Loading state (Toàn trang)
  if (loading && !currentShop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-amazon-bgSecondary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amazon-link" />
          <p className="text-amazon-textMuted text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // No shop found
  if (!loading && !currentShop) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-amazon-bgSecondary">
        <div className="text-center">
          <Store className="w-16 h-16 text-amazon-link mx-auto mb-4" />
          <h2 className="text-lg font-bold text-amazon-text mb-2">
            No Shop Found
          </h2>
          <p className="text-sm font-medium text-amazon-textMuted">
            You haven&apos;t registered a shop yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-2 md:px-0 relative bg-amazon-bgSecondary min-h-screen">
      {/* ==================== CUSTOM CONFIRM MODAL ==================== */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white border border-amazon-border rounded-md w-full max-w-sm p-6 shadow-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Icon Trạng Thái */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 border ${
                currentShop?.isActive
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-green-50 text-green-600 border-green-100"
              }`}
            >
              {currentShop?.isActive ? (
                <PowerOff className="w-8 h-8" />
              ) : (
                <Power className="w-8 h-8" />
              )}
            </div>

            {/* Tiêu đề & Nội dung */}
            <h3 className="text-lg font-bold text-amazon-text mb-2">
              {currentShop?.isActive
                ? "Close shop temporarily?"
                : "Reopen shop?"}
            </h3>
            <p className="text-sm font-medium text-amazon-textMuted mb-6">
              {currentShop?.isActive
                ? "Your shop will be hidden. Customers cannot view or purchase products until you reopen."
                : "Your shop will be visible again. Customers can continue to view and shop as usual."}
            </p>

            {/* Cụm Nút Hành Động */}
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isToggling}
                className="flex-1 py-2.5 bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text text-sm font-medium rounded-md transition-colors disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeToggleStatus}
                disabled={isToggling}
                className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-70 ${
                  currentShop?.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amazon-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text">
              Shop Profile
            </h1>
            <p className="text-amazon-textMuted text-[11px] font-medium mt-1">
              Update your shop&apos;s information and settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* --- NHÃN TRẠNG THÁI HIỂN THỊ DỰA VÀO isActive --- */}
            {currentShop && (
              <span
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${
                  currentShop.status === 1 && currentShop.isActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : currentShop.status === 1 && !currentShop.isActive
                      ? "bg-gray-100 text-gray-600 border-gray-200" // Trạng thái Inactive
                      : currentShop.status === 0
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : currentShop.status === 3
                          ? "bg-red-50 text-red-700 border-red-200"
                          : currentShop.status === 4
                            ? "bg-gray-100 text-gray-600 border-gray-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {currentShop.status === 1 && currentShop.isActive
                  ? "Active"
                  : currentShop.status === 1 && !currentShop.isActive
                    ? "Inactive (Closed)"
                    : currentShop.status === 0
                      ? "Pending"
                      : currentShop.status === 3
                        ? "Rejected"
                        : currentShop.status === 4
                          ? "Banned"
                          : "Unknown"}
              </span>
            )}

            {/* --- NÚT GỌI POPUP BẬT / TẮT --- */}
            {/* Nút chỉ được hiện nếu Shop đã được duyệt (status = 1) */}
            {currentShop?.status === 1 && (
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors border shadow-sm ${
                  currentShop.isActive
                    ? "bg-white border-amazon-border text-red-600 hover:bg-neutral-50"
                    : "bg-white border-amazon-border text-amazon-text hover:bg-neutral-50"
                }`}
              >
                {currentShop.isActive ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                {currentShop.isActive ? "Deactivate" : "Reactivate"}
              </button>
            )}
          </div>
        </div>

        {/* Admin note (if rejected) */}
        {currentShop?.adminNote && currentShop.status === 3 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">
              Admin Rejection Note:
            </p>
            <p className="text-sm font-medium text-red-600">{currentShop.adminNote}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- SECTION 1: VISUAL IDENTITY --- */}
          <div className="bg-white rounded-md shadow-sm border border-amazon-border">
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
                    className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-white text-amazon-text placeholder-gray-400 focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
                    placeholder="Enter shop name..."
                  />
                </div>
                <div>
                  <InputLabel label="Slogan / Bio" />
                  <input
                    {...register("bio")}
                    className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-white text-amazon-text placeholder-gray-400 focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
                    placeholder="Short slogan or description..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: CONTACT & ADDRESS --- */}
          <div className="bg-white rounded-md shadow-sm border border-amazon-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-amazon-border pb-4">
              <User className="text-amazon-link w-5 h-5" />
              <h3 className="text-lg font-bold text-amazon-text">
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
                  className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-white text-amazon-text placeholder-gray-400 focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
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
                  className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-white text-amazon-text placeholder-gray-400 focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
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
                  className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-white text-amazon-text placeholder-gray-400 focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
                  placeholder="Shop address..."
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: BANKING INFORMATION (Read-only) --- */}
          <div className="bg-white rounded-md shadow-sm border border-amazon-border p-6 md:p-8 opacity-90">
            <div className="flex items-center gap-3 mb-6 border-b border-amazon-border pb-4">
              <CreditCard className="text-amazon-link w-5 h-5" />
              <h3 className="text-lg font-bold text-amazon-text">
                Banking Information
              </h3>
              <span className="ml-auto text-xs font-semibold text-amazon-textMuted bg-neutral-100 border border-amazon-border px-2 py-0.5 rounded-md">
                Locked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputLabel label="Bank Name" />
                <input
                  {...register("bankName")}
                  className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-neutral-100 text-amazon-textMuted cursor-not-allowed transition-all text-sm font-medium"
                  placeholder="Bank name"
                  disabled
                />
              </div>
              <div>
                <InputLabel label="Account Number" />
                <input
                  {...register("bankAccountNumber")}
                  className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-neutral-100 text-amazon-textMuted cursor-not-allowed transition-all font-mono text-sm"
                  placeholder="Account number"
                  disabled
                />
              </div>
              <div className="md:col-span-2">
                <InputLabel label="Account Holder Name" />
                <input
                  {...register("bankAccountName")}
                  className="w-full px-4 py-2.5 rounded-md border border-amazon-border bg-neutral-100 text-amazon-textMuted cursor-not-allowed transition-all text-sm font-medium"
                  placeholder="Account holder name"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* --- SHOP STATS (read-only) --- */}
          {currentShop && (
            <div className="bg-white rounded-md shadow-sm border border-amazon-border p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-amazon-border pb-4">
                <Store className="text-amazon-link w-5 h-5" />
                <h3 className="text-lg font-bold text-amazon-text">
                  Shop Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-neutral-50 border border-amazon-border rounded-md p-5 text-center">
                  <p className="text-sm font-medium text-amazon-textMuted mb-2">Rating</p>
                  <p className="text-2xl font-bold text-amazon-text">
                    {currentShop.rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
                <div className="bg-neutral-50 border border-amazon-border rounded-md p-5 text-center">
                  <p className="text-sm font-medium text-amazon-textMuted mb-2">Total Sales</p>
                  <p className="text-2xl font-bold text-amazon-text">
                    {currentShop.totalSales ?? 0}
                  </p>
                </div>
                <div className="bg-neutral-50 border border-amazon-border rounded-md p-5 text-center">
                  <p className="text-sm font-medium text-amazon-textMuted mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
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
              className="group relative inline-flex items-center justify-center px-8 py-3 bg-amazon-btnPrimary text-amazon-text font-medium hover:brightness-95 rounded-md shadow-sm transition-all duration-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Save Changes <Save className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
