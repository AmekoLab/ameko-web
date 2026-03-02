"use client";

import { ShopResponse, ShopStatus } from "@/src/types/shop.types";
import {
  X,
  Store,
  CreditCard,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";
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
    switch (status) {
      case ShopStatus.PendingApproval:
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case ShopStatus.Active:
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
      case ShopStatus.Rejected:
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <Ban className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return <span className="text-gray-500">Unknown</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold font-oswald uppercase text-gray-900 flex items-center gap-3">
              Shop Application Details
              {renderStatus(shopData.status)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Application ID:{" "}
              <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                {shopData.id}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-0 bg-gray-50">
          {/* 1. VISUAL BRANDING */}
          <div className="relative bg-white pb-8 mb-4 border-b border-gray-200">
            {/* Banner */}
            <div className="relative w-full h-48 bg-gray-200">
              {shopData.bannerUrl ? (
                <Image
                  src={shopData.bannerUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Banner
                </div>
              )}
            </div>
            {/* Logo */}
            <div className="absolute -bottom-6 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden relative">
                {shopData.logoUrl ? (
                  <Image
                    src={shopData.logoUrl}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Store className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* 2. GENERAL INFO */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 mb-4 pb-2 border-b border-gray-100">
                <User className="w-4 h-4" /> General Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    icon={<MapPin className="w-3 h-3 inline mr-1" />}
                  />
                </div>
                <div className="md:col-span-2">
                  <InfoItem label="Bio / Description" value={shopData.bio} />
                </div>
              </div>
            </section>

            {/* 3. LEGAL & BANKING */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 mb-4 pb-2 border-b border-gray-100">
                <CreditCard className="w-4 h-4" /> Legal & Banking
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="Citizen ID (CCCD)"
                  value={shopData.citizenId}
                />
                <InfoItem label="Tax Code" value={shopData.taxCode} />
                <div className="col-span-1 md:col-span-2 h-px bg-gray-100 my-2"></div>
                <InfoItem label="Bank Name" value={shopData.bankName} />
                <InfoItem
                  label="Account Holder"
                  value={shopData.bankAccountName}
                  className="uppercase"
                />
                <div className="md:col-span-2">
                  <InfoItem
                    label="Bank Account Number"
                    value={shopData.bankAccountNumber}
                    className="font-mono bg-gray-50 px-2 py-1 rounded w-fit"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component hiển thị từng dòng thông tin
const InfoItem = ({ label, value, icon, isBold, className = "" }: any) => (
  <div>
    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
    <p
      className={`text-gray-800 text-sm ${isBold ? "font-bold text-lg" : "font-medium"} ${className}`}
    >
      {icon} {value || "N/A"}
    </p>
  </div>
);
