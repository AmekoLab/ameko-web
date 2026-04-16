"use client";

import { X, Loader2, ExternalLink, Box, Cpu } from "lucide-react";
import { useAppSelector } from "@/src/store/hook";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

interface AssembledProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssembledProductDetailModal({
  isOpen,
  onClose,
}: AssembledProductDetailModalProps) {
  const t = useTranslations("AssembledProductDetailModal");
  const { selectedProduct, detailLoading } = useAppSelector(
    (state) => state.assembledProducts,
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (!detailLoading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border bg-neutral-50 shrink-0">
          <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-white border border-transparent hover:border-amazon-border transition shadow-sm"
          >
            <X className="w-5 h-5 text-amazon-textMuted hover:text-amazon-text" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {detailLoading ? (
            <div className="flex items-center justify-center py-16 text-amazon-textMuted gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px] font-medium">
                {t("loadingDetails")}
              </span>
            </div>
          ) : !selectedProduct ? (
            <div className="py-16 text-center text-amazon-textMuted text-[14px] font-medium">
              {t("productNotFound")}
            </div>
          ) : (
            <DetailContent product={selectedProduct} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-5 border-t border-amazon-border bg-neutral-50/50 shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition shadow-sm"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailContent({ product }: { product: AssembledProductItem }) {
  const t = useTranslations("AssembledProductDetailModal");
  const images = [product.image1, product.image2, product.image3].filter(
    (img): img is string => Boolean(img),
  );

  return (
    <div className="space-y-6">
      {/* Images + basic info */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Images */}
        {images.length > 0 && (
          <div className="flex gap-3 shrink-0">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="w-24 h-24 rounded-sm bg-neutral-50  overflow-hidden flex items-center justify-center shadow-sm"
              >
                <Image
                  src={img}
                  alt={t("productImageAlt", {
                    name: product.name,
                    index: idx + 1,
                  })}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="text-xl font-bold text-amazon-text truncate">
              {product.name}
            </h3>
            {product.slug && (
              <p className="text-[12px] text-amazon-textMuted mt-1 truncate">
                {product.slug}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-amazon-price">
              {formatPrice(product.price)}
            </span>
            <span className="text-[12px] font-medium text-amazon-textMuted ml-2 border border-amazon-border px-2 py-0.5 rounded-sm shadow-sm bg-white">
              {t("qtyLabel")}: {product.quantity}
            </span>
          </div>
          {product.description && (
            <p className="text-[13px] font-normal text-amazon-textMuted leading-relaxed line-clamp-4">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Specs */}
      {(product.layout ||
        product.mounting ||
        product.pcb ||
        product.connection ||
        product.battery) && (
        <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-sm shadow-sm">
          <p className="text-[14px] font-bold text-indigo-800 mb-4">
            {t("keyboardSpecifications")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {product.layout && (
              <SpecCard label={t("specLayout")} value={product.layout} />
            )}
            {product.mounting && (
              <SpecCard label={t("specMounting")} value={product.mounting} />
            )}
            {product.pcb && (
              <SpecCard label={t("specPcb")} value={product.pcb} />
            )}
            {product.connection && (
              <SpecCard
                label={t("specConnection")}
                value={product.connection}
              />
            )}
            {product.battery && (
              <SpecCard label={t("specBattery")} value={product.battery} />
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={t("statPrice")}
          value={formatPrice(product.price)}
          valueColor="text-amazon-price"
        />
        <StatCard label={t("statQuantity")} value={String(product.quantity)} />
        {product.shopName && (
          <StatCard label={t("statShop")} value={product.shopName} />
        )}
        <StatCard
          label={t("statId")}
          value={product.id.slice(0, 8) + "..."}
          small
        />
      </div>

      {/* Components */}
      {product.details && product.details.length > 0 && (
        <div className="p-5 bg-neutral-50 border border-amazon-border rounded-sm space-y-4 shadow-sm">
          <p className="text-[13px] font-bold text-amazon-text flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            {t("components", { count: product.details.length })}
          </p>
          <div className="divide-y divide-amazon-border rounded-sm overflow-hidden">
            {product.details.map((detail, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 transition"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-amazon-text">
                    {detail.componentName || detail.componentId}
                  </p>
                  <p className="text-[12px] text-amazon-textMuted mt-0.5 truncate">
                    {t("kitLabel")}: {detail.baseKitName || detail.baseKitId}
                  </p>
                  {detail.soundUrl && (
                    <a
                      href={detail.soundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-amazon-btnPrimary hover:opacity-80 flex items-center gap-1 mt-1"
                    >
                      {t("soundTest")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <span className="text-[13px] font-bold text-amazon-text shrink-0 ml-4">
                  x{detail.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Model Link */}
      {product.view3DUrl && (
        <div className="flex items-center gap-3 text-[12px] font-medium text-amazon-textMuted bg-neutral-50 border border-amazon-border p-2 rounded-sm shadow-sm">
          <Box className="w-3.5 h-3.5 shrink-0" />
          <span className="font-bold text-amazon-text shrink-0">
            {t("model3dLabel")}:
          </span>
          <a
            href={product.view3DUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-amazon-btnPrimary transition flex items-center gap-1"
          >
            {product.view3DUrl}
            <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
          </a>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor,
  small,
}: {
  label: string;
  value: string;
  valueColor?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white border border-amazon-border rounded-sm p-4 shadow-sm flex flex-col justify-center">
      <p className="text-[11px] font-medium text-amazon-textMuted mb-1">
        {label}
      </p>
      <p
        className={`font-bold truncate ${small ? "text-[12px]" : "text-[14px]"} ${valueColor || "text-amazon-text"}`}
      >
        {value}
      </p>
    </div>
  );
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-indigo-100 rounded-sm p-3 shadow-sm">
      <p className="text-[12px] font-medium text-indigo-500 mb-1">{label}</p>
      <p className="text-[13px] font-bold text-indigo-900 truncate">{value}</p>
    </div>
  );
}
