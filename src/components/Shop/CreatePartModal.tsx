"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { createPart } from "@/src/store/slices/partsSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";
import { PartType, PartSpecifications } from "@/src/types/part.types";

// --- ZOD SCHEMA ---
const createPartSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validationPartNameRequired"))
      .max(200, t("validationPartNameMax")),
    partType: z.string().min(1, t("validationPartTypeRequired")),
    price: z.string().min(1, t("validationPriceRequired")),
    stockQuantity: z.string().min(1, t("validationStockRequired")),
    description: z.string().min(1, t("validationDescriptionRequired")),
    categoryId: z.string().min(1, t("validationCategoryRequired")),
    recipeSwitchCount: z.string().optional(),
    recipeStabilizerCount: z.string().optional(),
  });

type CreatePartFormValues = z.infer<ReturnType<typeof createPartSchema>>;

// --- Default workflow for kit type ---
function buildKitSpecifications(
  t: (key: string) => string,
  switchCount: number,
  stabilizerCount: number,
): PartSpecifications {
  return {
    recipe: {
      switch: switchCount,
      stabilizer: stabilizerCount,
    },
    workflow: [
      { step: "case", title: t("workflowCaseTitle"), quantity: 1 },
      { step: "plate", title: t("workflowPlateTitle"), quantity: 1 },
      {
        step: "switch",
        title: t("workflowSwitchTitle"),
        quantity: switchCount,
      },
      {
        step: "stabilizer",
        title: t("workflowStabilizerTitle"),
        quantity: stabilizerCount,
      },
      { step: "keycap", title: t("workflowKeycapTitle"), quantity: 1 },
    ],
  };
}

interface CreatePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryItem[];
}

export default function CreatePartModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: CreatePartModalProps) {
  const t = useTranslations("CreatePartModal");
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.parts);
  const schema = useMemo(() => createPartSchema(t), [t]);

  // Thumbnail image
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Layer image
  const [layerFile, setLayerFile] = useState<File | null>(null);
  const [layerPreview, setLayerPreview] = useState<string | null>(null);
  const layerInputRef = useRef<HTMLInputElement>(null);

  // Addon eligible toggle
  const [isAddonEligible, setIsAddonEligible] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePartFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      partType: "kit",
      price: "0",
      stockQuantity: "0",
      description: "",
      categoryId: "",
      recipeSwitchCount: "0",
      recipeStabilizerCount: "0",
    },
  });

  const selectedPartType = watch("partType");
  const isKit = selectedPartType === "kit";

  // --- Submit ---
  const onSubmit = async (data: CreatePartFormValues) => {
    try {
      const price = Number(data.price);
      const stockQuantity = Number(data.stockQuantity);
      const switchCount = Number(data.recipeSwitchCount || 0);
      const stabCount = Number(data.recipeStabilizerCount || 0);

      // Build specifications for kit type
      let specifications: PartSpecifications | null = null;
      if (isKit && switchCount > 0 && stabCount > 0) {
        specifications = buildKitSpecifications(t, switchCount, stabCount);
      }

      await dispatch(
        createPart({
          name: data.name,
          partType: data.partType as PartType,
          price,
          stockQuantity,
          description: data.description,
          categoryId: data.categoryId,
          recipeSwitchCount: isKit ? switchCount : undefined,
          recipeStabilizerCount: isKit ? stabCount : undefined,
          specifications,
          thumbnailImage: thumbnailFile,
          layerImage: layerFile,
          isAddonEligible,
        }),
      ).unwrap();
      toast.success(t("createdSuccess"));
      handleReset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || t("createFailed"));
    }
  };

  // --- Reset ---
  const handleReset = () => {
    reset();
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setLayerFile(null);
    setLayerPreview(null);
    setIsAddonEligible(false);
  };

  const handleClose = () => {
    if (!creating) {
      handleReset();
      onClose();
    }
  };

  // --- File helpers ---
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail" | "layer",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "thumbnail") {
        setThumbnailFile(file);
        setThumbnailPreview(result);
      } else {
        setLayerFile(file);
        setLayerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type: "thumbnail" | "layer") => {
    if (type === "thumbnail") {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    } else {
      setLayerFile(null);
      setLayerPreview(null);
      if (layerInputRef.current) layerInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2 border border-amazon-border rounded-sm text-[13px] font-medium text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition placeholder:text-neutral-400";
  const labelClass = "block text-[13px] font-medium text-amazon-text mb-1";
  const errorClass = "text-[11px] font-medium text-red-500 mt-1";

  const PART_TYPES: { value: PartType; label: string }[] = [
    { value: "kit", label: t("typeKit") },
    { value: "component", label: t("typeComponent") },
    { value: "accessory", label: t("typeAccessory") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <div>
            <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
            <p className="text-[12px] text-amazon-textMuted mt-0.5">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-neutral-50 transition"
            disabled={creating}
          >
            <X className="w-5 h-5 text-amazon-textMuted hover:text-amazon-text" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Row: Name + Part Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("partName")}</label>
              <input
                {...register("name")}
                className={inputClass}
                placeholder={t("partNamePlaceholder")}
              />
              {errors.name && (
                <p className={errorClass}>{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>{t("partType")}</label>
              <select {...register("partType")} className={inputClass}>
                {PART_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
              {errors.partType && (
                <p className={errorClass}>{errors.partType.message}</p>
              )}
            </div>
          </div>

          {/* Row: Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("price")}</label>
              <input
                type="number"
                {...register("price")}
                className={inputClass}
                placeholder={t("pricePlaceholder")}
                min={0}
              />
              {errors.price && (
                <p className={errorClass}>{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>{t("stockQuantity")}</label>
              <input
                type="number"
                {...register("stockQuantity")}
                className={inputClass}
                placeholder={t("stockQuantityPlaceholder")}
                min={0}
              />
              {errors.stockQuantity && (
                <p className={errorClass}>{errors.stockQuantity.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>{t("category")}</label>
            <select {...register("categoryId")} className={inputClass}>
              <option value="">{t("selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className={errorClass}>{errors.categoryId.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>{t("description")}</label>
            <textarea
              {...register("description")}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder={t("descriptionPlaceholder")}
            />
            {errors.description && (
              <p className={errorClass}>{errors.description.message}</p>
            )}
          </div>

          {/* Kit-specific: Recipe counts */}
          {isKit && (
            <div className="p-5 bg-purple-50 border border-purple-200 rounded-sm space-y-4">
              <p className="text-[13px] font-bold text-purple-800">
                {t("kitRecipeConfiguration")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("switchCount")}</label>
                  <input
                    type="number"
                    {...register("recipeSwitchCount")}
                    className={inputClass}
                    placeholder={t("switchCountPlaceholder")}
                    min={0}
                  />
                  {errors.recipeSwitchCount && (
                    <p className={errorClass}>
                      {errors.recipeSwitchCount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t("stabilizerCount")}</label>
                  <input
                    type="number"
                    {...register("recipeStabilizerCount")}
                    className={inputClass}
                    placeholder={t("stabilizerCountPlaceholder")}
                    min={0}
                  />
                  {errors.recipeStabilizerCount && (
                    <p className={errorClass}>
                      {errors.recipeStabilizerCount.message}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[11px] font-medium text-purple-600 mt-2">
                {t("specAutoGeneratedHint")}
              </p>
            </div>
          )}

          {/* Addon Eligible */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-sm">
            <input
              type="checkbox"
              id="create-isAddonEligible"
              checked={isAddonEligible}
              onChange={(e) => setIsAddonEligible(e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded-sm border-amazon-border cursor-pointer"
            />
            <label
              htmlFor="create-isAddonEligible"
              className="text-[13px] font-medium text-amazon-text cursor-pointer select-none"
            >
              {t("isAddonEligible")}
            </label>
          </div>

          {/* Images: Thumbnail + Layer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thumbnail */}
            <div>
              <label className={labelClass}>
                {t("thumbnailImage")}{" "}
                <span className="font-normal text-amazon-textMuted">
                  ({t("optional")})
                </span>
              </label>
              {thumbnailPreview ? (
                <div className="relative w-full h-36 rounded-sm border border-amazon-border overflow-hidden bg-neutral-50 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview}
                    alt={t("thumbnailPreviewAlt")}
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("thumbnail")}
                    className="absolute top-2 right-2 p-1 bg-white border border-amazon-border shadow-sm rounded-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                  >
                    <X className="w-4 h-4 text-amazon-textMuted" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-amazon-border rounded-sm flex flex-col items-center justify-center gap-2 text-amazon-textMuted hover:border-amazon-btnPrimary hover:text-amazon-btnPrimary hover:bg-neutral-50 transition"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[12px] font-medium">
                    {t("thumbnail")}
                  </span>
                </button>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                className="hidden"
              />
            </div>

            {/* Layer Image */}
            <div>
              <label className={labelClass}>
                {t("layerImage")}{" "}
                <span className="font-normal text-amazon-textMuted">
                  ({t("optional")})
                </span>
              </label>
              {layerPreview ? (
                <div className="relative w-full h-36 rounded-sm border border-amazon-border overflow-hidden bg-neutral-50 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={layerPreview}
                    alt={t("layerPreviewAlt")}
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("layer")}
                    className="absolute top-2 right-2 p-1 bg-white border border-amazon-border shadow-sm rounded-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                  >
                    <X className="w-4 h-4 text-amazon-textMuted" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => layerInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-amazon-border rounded-sm flex flex-col items-center justify-center gap-2 text-amazon-textMuted hover:border-amazon-btnPrimary hover:text-amazon-btnPrimary hover:bg-neutral-50 transition"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[12px] font-medium">
                    {t("layerImage")}
                  </span>
                </button>
              )}
              <input
                ref={layerInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "layer")}
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-amazon-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-border rounded-sm hover:brightness-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {creating && (
                <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />
              )}
              {creating ? t("creating") : t("createPart")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
