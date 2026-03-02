"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updatePart } from "@/src/store/slices/partsSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";
import { PartItem, PartType, PartSpecifications } from "@/src/types/part.types";

// --- ZOD SCHEMA ---
const editPartSchema = z.object({
  name: z
    .string()
    .min(1, "Part name is required")
    .max(200, "Max 200 characters"),
  partType: z.string().min(1, "Part type is required"),
  price: z.string().min(1, "Price is required"),
  stockQuantity: z.string().min(1, "Stock is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  recipeSwitchCount: z.string().optional(),
  recipeStabilizerCount: z.string().optional(),
});

type EditPartFormValues = z.infer<typeof editPartSchema>;

// --- Build kit specifications ---
function buildKitSpecifications(
  switchCount: number,
  stabilizerCount: number,
): PartSpecifications {
  return {
    recipe: { switch: switchCount, stabilizer: stabilizerCount },
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

interface EditPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryItem[];
  part: PartItem | null;
}

export default function EditPartModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  part,
}: EditPartModalProps) {
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.parts);

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Layer
  const [layerFile, setLayerFile] = useState<File | null>(null);
  const [layerPreview, setLayerPreview] = useState<string | null>(null);
  const layerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditPartFormValues>({
    resolver: zodResolver(editPartSchema),
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

  // Populate form when part changes
  useEffect(() => {
    if (part) {
      // Find categoryId from categoryName
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === part.categoryName.toLowerCase(),
      );

      reset({
        name: part.name,
        partType: part.partType,
        price: String(part.price),
        stockQuantity: String(part.stockQuantity),
        description: part.description || "",
        categoryId: matchedCat?.id || "",
        recipeSwitchCount: String(part.recipeSwitchCount || 0),
        recipeStabilizerCount: String(part.recipeStabilizerCount || 0),
      });

      // Set existing image previews
      setThumbnailFile(null);
      setThumbnailPreview(part.thumbnailUrl || null);
      setLayerFile(null);
      setLayerPreview(part.defaultLayerImageUrl || null);
    }
  }, [part, categories, reset]);

  const selectedPartType = watch("partType");
  const isKit = selectedPartType === "kit";

  // --- Submit ---
  const onSubmit = async (data: EditPartFormValues) => {
    if (!part) return;
    try {
      const price = Number(data.price);
      const stockQuantity = Number(data.stockQuantity);
      const switchCount = Number(data.recipeSwitchCount || 0);
      const stabCount = Number(data.recipeStabilizerCount || 0);

      let specifications: PartSpecifications | null = null;
      if (isKit && switchCount > 0 && stabCount > 0) {
        specifications = buildKitSpecifications(switchCount, stabCount);
      }

      await dispatch(
        updatePart({
          id: part.id,
          name: data.name,
          partType: data.partType as PartType,
          price,
          stockQuantity,
          description: data.description || "",
          categoryId: data.categoryId,
          recipeSwitchCount: isKit ? switchCount : undefined,
          recipeStabilizerCount: isKit ? stabCount : undefined,
          specifications,
          thumbnailImage: thumbnailFile,
          layerImage: layerFile,
        }),
      ).unwrap();
      toast.success("Part updated successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to update part");
    }
  };

  const handleClose = () => {
    if (!updating) onClose();
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
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  const PART_TYPES: { value: PartType; label: string }[] = [
    { value: "kit", label: "Kit" },
    { value: "component", label: "Component" },
    { value: "accessory", label: "Accessory" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit Part</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Update part information.{" "}
              {part && <span className="text-gray-400">({part.slug})</span>}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
            disabled={updating}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
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
            <label className={labelClass}>
              Description{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register("description")}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Describe this part..."
            />
          </div>

          {/* Kit-specific: Recipe counts */}
          {isKit && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
              <p className="text-sm font-bold text-purple-800">
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
                </div>
              </div>
              <p className="text-xs text-purple-600">
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
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              {thumbnailPreview ? (
                <div className="relative w-full h-36 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("thumbnail")}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-red-100 transition"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-semibold">Thumbnail</span>
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
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              {layerPreview ? (
                <div className="relative w-full h-36 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={layerPreview}
                    alt="Layer preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("layer")}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-red-100 transition"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => layerInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-semibold">Layer Image</span>
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
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={updating}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? "Updating..." : "Update Part"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
