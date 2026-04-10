"use client";

import { ShopResponse, ShopStatus } from "@/src/types/shop.types";
import Image from "next/image";

interface ShopApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopData: ShopResponse | null;
}

export const ShopApplicationModal = ({
  isOpen,
  onClose,
  shopData,
}: ShopApplicationModalProps) => {
  if (!isOpen || !shopData) return null;

  // Helper render status badge
  const renderStatus = (status: ShopStatus) => {
    const baseClasses = "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
    switch (status) {
      case ShopStatus.PendingApproval:
        return (
          <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>
            Pending
          </span>
        );
      case ShopStatus.Active:
        return (
          <span className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>
            Active
          </span>
        );
      case ShopStatus.Rejected:
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>
            Rejected
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-neutral-50 text-neutral-600 border-neutral-200`}>Unknown</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-md shadow-xl border border-amazon-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-amazon-border bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-amazon-text flex items-center gap-2">
              Shop Application Details
              {renderStatus(shopData.status)}
            </h3>
            <p className="text-[11px] text-amazon-textMuted mt-0.5">
              Application ID:{" "}
              <span className="font-mono text-[10px] bg-neutral-50 border border-amazon-border px-1 py-0.5 rounded-sm">
                {shopData.id}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-medium text-amazon-textMuted rounded-sm hover:bg-neutral-50 border border-transparent hover:border-amazon-border transition-colors"
          >
            Close
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-0 bg-white">
          {/* 1. VISUAL BRANDING */}
          <div className="relative bg-white pb-8 border-b border-amazon-border mb-4">
            {/* Banner */}
            <div className="relative w-full h-48 bg-neutral-100 border-b border-amazon-border">
              {shopData.bannerUrl ? (
                <Image
                  src={shopData.bannerUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] text-amazon-textMuted font-medium">
                  No Banner
                </div>
              )}
            </div>
            {/* Logo */}
            <div className="absolute -bottom-6 left-6">
              <div className="w-20 h-20 rounded-sm border-2 border-white shadow-sm bg-neutral-100 overflow-hidden relative">
                {shopData.logoUrl ? (
                  <Image
                    src={shopData.logoUrl}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-amazon-textMuted font-medium">
                    No Logo
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* 2. GENERAL INFO */}
            <section className="bg-white p-4 rounded-sm border border-amazon-border shadow-sm">
              <h4 className="text-[12px] font-bold text-amazon-text mb-3 pb-2 border-b border-amazon-border">
                General Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Shop Name" value={shopData.shopName} isBold />
                <InfoItem label="Contact Email" value={shopData.contactEmail} />
                <InfoItem label="Phone Number" value={shopData.phoneNumber} />
                <InfoItem
                  label="Created At"
                  value={new Date(shopData.createdAt).toLocaleDateString(
                    "vi-VN",
                  )}
                />
                <div className="md:col-span-2">
                  <InfoItem
                    label="Pickup Address"
                    value={shopData.address}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoItem label="Bio / Description" value={shopData.bio} />
                </div>
              </div>
            </section>

            {/* 3. LEGAL & BANKING */}
            <section className="bg-white p-4 rounded-sm border border-amazon-border shadow-sm">
              <h4 className="text-[12px] font-bold text-amazon-text mb-3 pb-2 border-b border-amazon-border">
                Legal & Banking
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Citizen ID (CCCD)"
                  value={shopData.citizenId}
                />
                <InfoItem label="Tax Code" value={shopData.taxCode} />
                <div className="col-span-1 md:col-span-2 h-px bg-amazon-border my-1"></div>
                <InfoItem label="Bank Name" value={shopData.bankName} />
                <InfoItem
                  label="Account Holder"
                  value={shopData.bankAccountName}
                />
                <div className="md:col-span-2">
                  <InfoItem
                    label="Bank Account Number"
                    value={shopData.bankAccountNumber}
                    className="font-mono bg-neutral-50 border border-amazon-border px-1.5 py-0.5 rounded-sm w-fit"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-amazon-border bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-amazon-border text-[11px] font-medium text-amazon-text rounded-sm hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component displaying individual lines of info
const InfoItem = ({ label, value, isBold, className = "" }: any) => (
  <div>
    <p className="text-[10px] text-amazon-textMuted mb-0.5">{label}</p>
    <p
      className={`text-[11px] text-amazon-text ${isBold ? "font-bold" : ""} ${className}`}
    >
      {value || "N/A"}
    </p>
  </div>
);
