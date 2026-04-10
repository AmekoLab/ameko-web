"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { createPart } from "@/src/store/slices/partsSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";
import { PartType, PartSpecifications } from "@/src/types/part.types";

// --- ZOD SCHEMA ---
const createPartSchema = z.object({
  name: z
    .string()
    .min(1, "Part name is required")
    .max(200, "Max 200 characters"),
  partType: z.string().min(1, "Part type is required"),
  price: z.string().min(1, "Price is required"),
  stockQuantity: z.string().min(1, "Stock is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  recipeSwitchCount: z.string().optional(),
  recipeStabilizerCount: z.string().optional(),
});

type CreatePartFormValues = z.infer<typeof createPartSchema>;

// --- Default workflow for kit type ---
function buildKitSpecifications(
  switchCount: number,
  stabilizerCount: number,
): PartSpecifications {
  return {
    recipe: {
      switch: switchCount,
      stabilizer: stabilizerCount,
    },
    workflow: [
      { step: "case", title: "Chọn Vỏ", quantity: 1 },
      { step: "plate", title: "Chọn Plate", quantity: 1 },
      { step: "switch", title: "Chọn Switch", quantity: switchCount },
      {
        step: "stabilizer",
        title: "Chọn Stabilizer",
        quantity: stabilizerCount,
      },
      { step: "keycap", title: "Chọn Keycap", quantity: 1 },
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
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.parts);

  // Thumbnail image
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Layer image
  const [layerFile, setLayerFile] = useState<File | null>(null);
  const [layerPreview, setLayerPreview] = useState<string | null>(null);
  const layerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePartFormValues>({
    resolver: zodResolver(createPartSchema),
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
        specifications = buildKitSpecifications(switchCount, stabCount);
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
        }),
      ).unwrap();
      toast.success("Part created successfully!");
      handleReset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to create part");
    }
  };

  // --- Reset ---
  const handleReset = () => {
    reset();
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setLayerFile(null);
    setLayerPreview(null);
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
    { value: "kit", label: "Kit" },
    { value: "component", label: "Component" },
    { value: "accessory", label: "Accessory" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <div>
            <h2 className="text-lg font-bold text-amazon-text">Create Part</h2>
            <p className="text-[12px] text-amazon-textMuted mt-0.5">
              Add a new part to your shop inventory.
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
              <label className={labelClass}>Part Name</label>
              <input
                {...register("name")}
                className={inputClass}
                placeholder="e.g. Kit 75 v2"
              />
              {errors.name && (
                <p className={errorClass}>{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Part Type</label>
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
              <label className={labelClass}>Price (VND)</label>
              <input
                type="number"
                {...register("price")}
                className={inputClass}
                placeholder="e.g. 20000"
                min={0}
              />
              {errors.price && (
                <p className={errorClass}>{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Stock Quantity</label>
              <input
                type="number"
                {...register("stockQuantity")}
                className={inputClass}
                placeholder="e.g. 100000"
                min={0}
              />
              {errors.stockQuantity && (
                <p className={errorClass}>{errors.stockQuantity.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select {...register("categoryId")} className={inputClass}>
              <option value="">— Select category —</option>
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
            <label className={labelClass}>Description</label>
            <textarea
              {...register("description")}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Describe this part..."
            />
            {errors.description && (
              <p className={errorClass}>{errors.description.message}</p>
            )}
          </div>

          {/* Kit-specific: Recipe counts */}
          {isKit && (
            <div className="p-5 bg-purple-50 border border-purple-200 rounded-sm space-y-4">
              <p className="text-[13px] font-bold text-purple-800">
                Kit Recipe Configuration
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Switch Count</label>
                  <input
                    type="number"
                    {...register("recipeSwitchCount")}
                    className={inputClass}
                    placeholder="e.g. 82"
                    min={0}
                  />
                  {errors.recipeSwitchCount && (
                    <p className={errorClass}>
                      {errors.recipeSwitchCount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Stabilizer Count</label>
                  <input
                    type="number"
                    {...register("recipeStabilizerCount")}
                    className={inputClass}
                    placeholder="e.g. 5"
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
                Specifications (recipe + workflow) will be auto-generated and
                sent as JSON.
              </p>
            </div>
          )}

          {/* Images: Thumbnail + Layer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thumbnail */}
            <div>
              <label className={labelClass}>
                Thumbnail Image{" "}
                <span className="font-normal text-amazon-textMuted">(optional)</span>
              </label>
              {thumbnailPreview ? (
                <div className="relative w-full h-36 rounded-sm border border-amazon-border overflow-hidden bg-neutral-50 shadow-sm">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
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
                  <span className="text-[12px] font-medium">Thumbnail</span>
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
                Layer Image{" "}
                <span className="font-normal text-amazon-textMuted">(optional)</span>
              </label>
              {layerPreview ? (
                <div className="relative w-full h-36 rounded-sm border border-amazon-border overflow-hidden bg-neutral-50 shadow-sm">
                  <img
                    src={layerPreview}
                    alt="Layer preview"
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
                  <span className="text-[12px] font-medium">Layer Image</span>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-border rounded-sm hover:brightness-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />}
              {creating ? "Creating..." : "Create Part"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
