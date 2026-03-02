"use client";

import { X, Loader2, ExternalLink, Box, Cpu } from "lucide-react";
import { useAppSelector } from "@/src/store/hook";
import Image from "next/image";
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
  const { selectedProduct, detailLoading } = useAppSelector(
    (state) => state.assembledProducts,
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (!detailLoading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            Assembled Product Details
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {detailLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading product details...</span>
            </div>
          ) : !selectedProduct ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Product not found.
            </div>
          ) : (
            <DetailContent product={selectedProduct} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-5 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailContent({ product }: { product: AssembledProductItem }) {
  const images = [product.image1, product.image2, product.image3].filter(
    (img): img is string => Boolean(img),
  );

  return (
    <div className="space-y-6">
      {/* Images + basic info */}
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Images */}
        {images.length > 0 && (
          <div className="flex gap-2 shrink-0">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center"
              >
                <Image
                  src={img}
                  alt={`${product.name} image ${idx + 1}`}
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
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            {product.slug && (
              <p className="text-xs text-gray-400 mt-0.5">{product.slug}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-black text-blue-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              Qty: {product.quantity}
            </span>
          </div>
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
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
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm font-bold text-indigo-800 mb-3">
            Keyboard Specifications
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {product.layout && (
              <SpecCard label="Layout" value={product.layout} />
            )}
            {product.mounting && (
              <SpecCard label="Mounting" value={product.mounting} />
            )}
            {product.pcb && <SpecCard label="PCB" value={product.pcb} />}
            {product.connection && (
              <SpecCard label="Connection" value={product.connection} />
            )}
            {product.battery && (
              <SpecCard label="Battery" value={product.battery} />
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Price" value={formatPrice(product.price)} />
        <StatCard label="Quantity" value={String(product.quantity)} />
        {product.shopName && <StatCard label="Shop" value={product.shopName} />}
        <StatCard label="ID" value={product.id.slice(0, 8) + "..."} small />
      </div>

      {/* Components */}
      {product.details && product.details.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Components ({product.details.length})
          </p>
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {product.details.map((detail, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {detail.componentName || detail.componentId}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Kit: {detail.baseKitName || detail.baseKitId}
                  </p>
                  {detail.soundUrl && (
                    <a
                      href={detail.soundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                    >
                      Sound test
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-700 shrink-0 ml-4">
                  x{detail.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Model Link */}
      {product.view3DUrl && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Box className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold shrink-0">3D Model:</span>
          <a
            href={product.view3DUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-blue-500 transition flex items-center gap-1"
          >
            {product.view3DUrl}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      )}

      {/* Image URLs */}
      <div className="space-y-1">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-xs text-gray-400"
          >
            <span className="font-semibold shrink-0">Image {idx + 1}:</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-blue-500 transition flex items-center gap-1"
            >
              {url}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        ))}
      </div>
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
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">
        {label}
      </p>
      <p
        className={`font-bold truncate ${small ? "text-xs" : "text-sm"} ${valueColor || "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-indigo-100 rounded-lg p-2.5">
      <p className="text-xs text-indigo-500 font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
