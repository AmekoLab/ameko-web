"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateCategory } from "@/src/store/slices/categoriesSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";
import Image from "next/image";

// --- ZOD SCHEMA ---
const editCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Max 100 characters"),
  parentId: z.string().optional(),
  isActive: z.boolean(),
});

type EditCategoryFormValues = z.infer<typeof editCategorySchema>;

interface EditCategoryModalProps {
  isOpen: boolean;
  category: CategoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
  /** Global categories to use as parent options */
  parentOptions: CategoryItem[];
  mode: "admin" | "shop";
}

export default function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
  parentOptions,
}: EditCategoryModalProps) {
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.categories);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
  });

  // Pre-fill form when category changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        parentId: category.parentId || "",
        isActive: category.isActive,
      });
    }
  }, [category, reset]);

  // Sync thumbnail preview when category changes
  useEffect(() => {
    if (category) {
      setThumbnailPreview(category.thumbnailURL || null);
      setThumbnailFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id]);

  const onSubmit = async (data: EditCategoryFormValues) => {
    if (!category) return;
    try {
      await dispatch(
        updateCategory({
          id: category.id,
          name: data.name,
          parentId: data.parentId || null,
          isActive: data.isActive,
          thumbnailImage: thumbnailFile,
        }),
      ).unwrap();
      toast.success("Category updated successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to update category");
    }
  };

  const handleClose = () => {
    if (!updating) {
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen || !category) return null;

  const inputClass =
    "text-black w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  // Exclude the current category from parent options to prevent self-parenting
  const rootParents = parentOptions.filter(
    (c) => !c.parentId && c.id !== category.id,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {category.categoryType === "global"
                ? "Global category"
                : "Private category"}{" "}
              &middot; {category.slug}
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
          {/* Name */}
          <div>
            <label className={labelClass}>Category Name</label>
            <input
              {...register("name")}
              className={inputClass}
              placeholder="e.g. Keycap, Switch, Case..."
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          {/* Parent Category */}
          <div>
            <label className={labelClass}>
              Parent Category{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <select {...register("parentId")} className={inputClass}>
              <option value="">— None (root category) —</option>
              {rootParents.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className={labelClass}>
              Thumbnail Image{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            {thumbnailPreview ? (
              <div className="relative w-full h-36 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-red-100 transition"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs font-semibold">Click to upload</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              {...register("isActive")}
              type="checkbox"
              id="editIsActive"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="editIsActive"
              className="text-sm font-semibold text-gray-700"
            >
              Active
            </label>
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
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
