"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateCategory } from "@/src/store/slices/categoriesSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";
import Image from "next/image";

// --- ZOD SCHEMA ---
const editCategorySchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validationNameRequired"))
      .max(100, t("validationNameMax")),
    parentId: z.string().optional(),
    isActive: z.boolean(),
  });

type EditCategoryFormValues = z.infer<ReturnType<typeof editCategorySchema>>;

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
  const t = useTranslations("EditCategoryModal");
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.categories);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schema = useMemo(() => editCategorySchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(schema),
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
      toast.success(t("updatedSuccess"));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || t("updateFailed"));
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
    "w-full px-3 py-2 border border-amazon-border rounded-sm text-sm text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition";
  const labelClass = "block text-[13px] font-medium text-amazon-text mb-1";
  const errorClass = "text-[11px] font-medium text-red-500 mt-1";

  // Exclude the current category from parent options to prevent self-parenting
  const rootParents = parentOptions.filter(
    (c) => !c.parentId && c.id !== category.id,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <div>
            <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
            <p className="text-[12px] text-amazon-textMuted mt-0.5">
              {category.categoryType === "global"
                ? t("globalCategory")
                : t("privateCategory")}{" "}
              &middot; {category.slug}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-neutral-50 transition"
            disabled={updating}
          >
            <X className="w-5 h-5 text-amazon-textMuted hover:text-amazon-text" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass}>{t("categoryName")}</label>
            <input
              {...register("name")}
              className={inputClass}
              placeholder={t("namePlaceholder")}
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          {/* Parent Category */}
          <div>
            <label className={labelClass}>
              {t("parentCategory")}{" "}
              <span className="font-normal text-amazon-textMuted">
                ({t("optional")})
              </span>
            </label>
            <select {...register("parentId")} className={inputClass}>
              <option value="">{t("noneRootCategory")}</option>
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
              {t("thumbnailImage")}{" "}
              <span className="font-normal text-amazon-textMuted">
                ({t("optional")})
              </span>
            </label>
            {thumbnailPreview ? (
              <div className="relative w-full h-36 border border-amazon-border overflow-hidden bg-neutral-50 rounded-sm">
                <Image
                  src={thumbnailPreview}
                  alt={t("thumbnailPreviewAlt")}
                  fill
                  className="object-contain"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-white border border-amazon-border shadow-sm rounded-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition z-10"
                >
                  <X className="w-4 h-4 text-amazon-textMuted hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border border-dashed border-amazon-border rounded-sm flex flex-col items-center justify-center gap-2 text-amazon-textMuted hover:border-amazon-btnPrimary hover:text-amazon-btnPrimary hover:bg-neutral-50 transition"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[12px] font-medium">
                  {t("clickToUpload")}
                </span>
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
          <div className="flex items-center gap-3">
            <input
              {...register("isActive")}
              type="checkbox"
              id="editIsActive"
              className="w-4 h-4 rounded-sm border-amazon-border text-amazon-btnPrimary focus:ring-amazon-btnPrimary focus:ring-1"
            />
            <label
              htmlFor="editIsActive"
              className="text-[13px] font-medium text-amazon-text mt-[1px]"
            >
              {t("setAsActive")}
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-amazon-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={updating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-border rounded-sm hover:brightness-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {updating && (
                <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />
              )}
              {updating ? t("saving") : t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
