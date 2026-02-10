"use client";

import { X, Loader2, Package, ExternalLink } from "lucide-react";
import { useAppSelector } from "@/src/store/hook";
import Image from "next/image";
import {
  PartItem,
  PartType,
  PartSpecifications,
  PartWorkflowStep,
} from "@/src/types/part.types";

// --- Helpers ---
function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function parseSpecifications(raw: string | null): PartSpecifications | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PartSpecifications;
  } catch {
    return null;
  }
}

const PART_TYPE_STYLES: Record<
  PartType,
  { label: string; color: string; bg: string }
> = {
  kit: { label: "Kit", color: "text-purple-700", bg: "bg-purple-100" },
  case: { label: "Case", color: "text-blue-700", bg: "bg-blue-100" },
  plate: { label: "Plate", color: "text-cyan-700", bg: "bg-cyan-100" },
  switch: { label: "Switch", color: "text-green-700", bg: "bg-green-100" },
  keycap: { label: "Keycap", color: "text-amber-700", bg: "bg-amber-100" },
  stabilizer: {
    label: "Stabilizer",
    color: "text-rose-700",
    bg: "bg-rose-100",
  },
};

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: "Active", cls: "bg-green-100 text-green-700" },
  0: { label: "Inactive", cls: "bg-red-100 text-red-700" },
};

interface PartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartDetailModal({
  isOpen,
  onClose,
}: PartDetailModalProps) {
  const { selectedPart, detailLoading } = useAppSelector(
    (state) => state.parts,
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (!detailLoading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Part Details</h2>
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
              <span className="text-sm">Loading part details...</span>
            </div>
          ) : !selectedPart ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Part not found.
            </div>
          ) : (
            <PartDetailContent part={selectedPart} />
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

// --- Detail Content ---
function PartDetailContent({ part }: { part: PartItem }) {
  const typeStyle = PART_TYPE_STYLES[part.partType] || {
    label: part.partType,
    color: "text-gray-700",
    bg: "bg-gray-100",
  };
  const statusInfo = STATUS_MAP[part.status] || {
    label: "Unknown",
    cls: "bg-gray-100 text-gray-600",
  };
  const specs = parseSpecifications(part.specifications);

  return (
    <div className="space-y-6">
      {/* Images + basic info row */}
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Images */}
        <div className="flex gap-3 shrink-0">
          {/* Thumbnail */}
          <div className="w-28 h-28 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
            {part.thumbnailUrl ? (
              <Image
                src={part.thumbnailUrl}
                alt={part.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <Package className="w-8 h-8 text-gray-300" />
            )}
          </div>
          {/* Layer */}
          {part.defaultLayerImageUrl && (
            <div className="w-28 h-28 rounded-xl bg-gray-50 border border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
              <Image
                src={part.defaultLayerImageUrl}
                alt="Layer"
                width={112}
                height={112}
                className="object-contain w-full h-full"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{part.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{part.slug}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${typeStyle.bg} ${typeStyle.color}`}
            >
              {typeStyle.label}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {part.categoryName}
            </span>
          </div>
          {part.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {part.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Price" value={formatPrice(part.price)} />
        <StatCard
          label="Stock"
          value={part.stockQuantity.toLocaleString("vi-VN")}
          valueColor={
            part.stockQuantity <= 0
              ? "text-red-600"
              : part.stockQuantity < 100
                ? "text-amber-600"
                : undefined
          }
        />
        <StatCard label="Shop" value={part.shopName} />
        <StatCard label="ID" value={part.id.slice(0, 8) + "..."} small />
      </div>

      {/* Recipe (kit) */}
      {(part.recipeSwitchCount > 0 || part.recipeStabilizerCount > 0) && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-bold text-purple-800 mb-2">Kit Recipe</p>
          <div className="flex gap-6">
            {part.recipeSwitchCount > 0 && (
              <div className="text-center">
                <p className="text-2xl font-black text-purple-700">
                  {part.recipeSwitchCount}
                </p>
                <p className="text-xs text-purple-500 font-semibold">
                  Switches
                </p>
              </div>
            )}
            {part.recipeStabilizerCount > 0 && (
              <div className="text-center">
                <p className="text-2xl font-black text-purple-700">
                  {part.recipeStabilizerCount}
                </p>
                <p className="text-xs text-purple-500 font-semibold">
                  Stabilizers
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Specifications / Workflow */}
      {specs && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <p className="text-sm font-bold text-gray-800">
            Specifications (Workflow)
          </p>
          <div className="divide-y divide-gray-200">
            {specs.workflow.map((step: PartWorkflowStep, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.step}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  x{step.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image URLs */}
      <div className="space-y-1">
        {part.thumbnailUrl && (
          <ImageLink label="Thumbnail URL" url={part.thumbnailUrl} />
        )}
        {part.defaultLayerImageUrl && (
          <ImageLink label="Layer URL" url={part.defaultLayerImageUrl} />
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---
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

function ImageLink({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="font-semibold shrink-0">{label}:</span>
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
  );
}
