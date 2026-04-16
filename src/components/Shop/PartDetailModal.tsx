"use client";

import { X, Loader2, Package } from "lucide-react";
import { useAppSelector } from "@/src/store/hook";
import Image from "next/image";
import { useTranslations } from "next-intl";
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

const getPartTypeStyles = (t: (key: string) => string) => ({
  kit: {
    label: t("typeKit"),
    color: "text-purple-700",
    bg: "bg-purple-50 border border-purple-200",
  },
  component: {
    label: t("typeComponent"),
    color: "text-blue-700",
    bg: "bg-blue-50 border border-blue-200",
  },
  accessory: {
    label: t("typeAccessory"),
    color: "text-emerald-700",
    bg: "bg-emerald-50 border border-emerald-200",
  },
});

const getStatusMap = (t: (key: string) => string) => ({
  1: {
    label: t("statusActive"),
    cls: "bg-neutral-100 text-amazon-text border border-amazon-border",
  },
  0: {
    label: t("statusInactive"),
    cls: "bg-red-50 text-red-600 border border-red-200",
  },
});

interface PartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartDetailModal({
  isOpen,
  onClose,
}: PartDetailModalProps) {
  const t = useTranslations("PartDetailModal");
  const { selectedPart, detailLoading } = useAppSelector(
    (state) => state.parts,
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (!detailLoading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
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
          ) : !selectedPart ? (
            <div className="py-16 text-center text-amazon-textMuted text-[13px] font-medium">
              {t("partNotFound")}
            </div>
          ) : (
            <PartDetailContent part={selectedPart} />
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

// --- Detail Content ---
function PartDetailContent({ part }: { part: PartItem }) {
  const t = useTranslations("PartDetailModal");
  const partTypeStyles = getPartTypeStyles(t);
  const statusMap = getStatusMap(t);

  const typeStyle = partTypeStyles[part.partType as PartType] || {
    label: part.partType,
    color: "text-gray-700",
    bg: "bg-gray-100",
  };
  const statusInfo = statusMap[part.status] || {
    label: t("statusUnknown"),
    cls: "bg-gray-100 text-gray-600",
  };
  const specs = parseSpecifications(part.specifications);

  return (
    <div className="space-y-6">
      {/* Images + basic info row */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Images */}
        <div className="flex gap-4 shrink-0">
          {/* Thumbnail */}
          <div className="w-28 h-28 rounded-sm bg-neutral-50 border border-amazon-border overflow-hidden flex items-center justify-center shadow-sm">
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
              <Package className="w-8 h-8 text-neutral-300" />
            )}
          </div>
          {/* Layer */}
          {part.defaultLayerImageUrl && (
            <div className="w-28 h-28 rounded-sm bg-neutral-50 border border-dashed border-amazon-border overflow-hidden flex items-center justify-center hover:bg-white transition shadow-sm">
              <Image
                src={part.defaultLayerImageUrl}
                alt={t("layerAlt")}
                width={112}
                height={112}
                className="object-contain w-full h-full p-2"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="text-[18px] font-bold text-amazon-text truncate">
              {part.name}
            </h3>
            <p className="text-[12px] text-amazon-textMuted mt-1 truncate">
              {part.slug}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${typeStyle.bg} ${typeStyle.color}`}
            >
              {typeStyle.label}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
            <span className="text-[12px] font-medium text-amazon-textMuted border border-amazon-border px-2 py-0.5 rounded-sm shadow-sm bg-white">
              {part.categoryName}
            </span>
          </div>
          {part.description && (
            <p className="text-[13px] text-amazon-textMuted font-normal leading-relaxed mt-2">
              {part.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={t("statPrice")}
          value={formatPrice(part.price)}
          valueColor="text-amazon-price"
        />
        <StatCard
          label={t("statStock")}
          value={part.stockQuantity.toLocaleString("vi-VN")}
          valueColor={
            part.stockQuantity <= 0
              ? "text-red-600"
              : part.stockQuantity < 100
                ? "text-amber-600"
                : "text-amazon-text"
          }
        />
        <StatCard label={t("statShop")} value={part.shopName} />
        <StatCard
          label={t("statId")}
          value={part.id.slice(0, 8) + "..."}
          small
        />
      </div>

      {/* Recipe (kit) */}
      {(part.recipeSwitchCount > 0 || part.recipeStabilizerCount > 0) && (
        <div className="p-5 bg-purple-50 border border-purple-200 rounded-sm shadow-sm">
          <p className="text-[13px] font-bold text-purple-800 mb-4">
            {t("kitRecipe")}
          </p>
          <div className="flex gap-8">
            {part.recipeSwitchCount > 0 && (
              <div className="text-center">
                <p className="text-[24px] font-bold text-purple-700">
                  {part.recipeSwitchCount}
                </p>
                <p className="text-[12px] font-medium text-purple-600 mt-1">
                  {t("recipeSwitches")}
                </p>
              </div>
            )}
            {part.recipeStabilizerCount > 0 && (
              <div className="text-center">
                <p className="text-[24px] font-bold text-purple-700">
                  {part.recipeStabilizerCount}
                </p>
                <p className="text-[12px] font-medium text-purple-600 mt-1">
                  {t("recipeStabilizers")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Specifications / Workflow */}
      {specs && specs.workflow && (
        <div className="p-5 bg-neutral-50 border border-amazon-border rounded-sm space-y-4 shadow-sm">
          <p className="text-[13px] font-bold text-amazon-text">
            {t("specificationsWorkflow")}
          </p>
          <div className="divide-y divide-amazon-border">
            {specs.workflow.map((step: PartWorkflowStep, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <span className="w-7 h-7 rounded-full bg-white border border-amazon-border text-amazon-text text-[12px] font-bold flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-amazon-text">
                      {step.title}
                    </p>
                    <p className="text-[11px] text-amazon-textMuted mt-0.5">
                      {step.step}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-amazon-text">
                  x{step.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image URLs */}
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
    <div className="bg-white border border-amazon-border rounded-sm p-4 shadow-sm flex flex-col justify-center">
      <p className="text-[11px] text-amazon-textMuted font-medium mb-1">
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
