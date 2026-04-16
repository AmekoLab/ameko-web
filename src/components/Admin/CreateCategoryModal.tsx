"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { createCategory } from "@/src/store/slices/categoriesSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";

// --- ZOD SCHEMA ---
const createCategorySchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validationNameRequired"))
      .max(100, t("validationNameMax")),
    parentId: z.string().optional(),
    isActive: z.boolean(),
  });

type CreateCategoryFormValues = z.infer<
  ReturnType<typeof createCategorySchema>
>;

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Global categories to use as parent options */
  parentOptions: CategoryItem[];
  /** "admin" or "shop" — affects label wording */
  mode: "admin" | "shop";
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  parentOptions,
  mode,
}: CreateCategoryModalProps) {
  const t = useTranslations("CreateCategoryModal");
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.categories);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schema = useMemo(() => createCategorySchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      parentId: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: CreateCategoryFormValues) => {
    try {
      await dispatch(
        createCategory({
          name: data.name,
          parentId: data.parentId || null,
          isActive: data.isActive,
          thumbnailImage: thumbnailFile,
        }),
      ).unwrap();
      toast.success(t("createdSuccess"));
      handleReset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || t("createFailed"));
    }
  };

  const handleReset = () => {
    reset();
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleClose = () => {
    if (!creating) {
      handleReset();
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

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2 border border-amazon-border rounded-sm text-sm text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition";
  const labelClass = "block text-[13px] font-medium text-amazon-text mb-1";
  const errorClass = "text-[11px] font-medium text-red-500 mt-1";

  // Only root-level global categories as parent options
  const rootParents = parentOptions.filter((c) => !c.parentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <div>
            <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
            <p className="text-[12px] text-amazon-textMuted5">
              {mode === "admin" ? t("adminDescription") : t("shopDescription")}
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
            {mode === "shop" && (
              <p className="text-[11px] text-amazon-textMuted mt-1">
                {t("shopParentHint")}
              </p>
            )}
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
                <img
                  src={thumbnailPreview}
                  alt={t("thumbnailPreviewAlt")}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-white border border-amazon-border shadow-sm rounded-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                >
                  <X className="w-4 h-4 text-amazon-textMuted" />
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
              id="isActive"
              className="w-4 h-4 rounded-sm border-amazon-border text-amazon-btnPrimary focus:ring-amazon-btnPrimary focus:ring-1"
            />
            <label
              htmlFor="isActive"
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
              disabled={creating}
              className="px-5 py-2.5 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 text-[13px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-border rounded-sm hover:brightness-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {creating && (
                <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />
              )}
              {creating ? t("creating") : t("createCategory")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
