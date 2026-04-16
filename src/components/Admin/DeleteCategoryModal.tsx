"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { deleteCategory } from "@/src/store/slices/categoriesSlice";
import { toast } from "react-toastify";
import { CategoryItem } from "@/src/types/category.types";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  category: CategoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}: DeleteCategoryModalProps) {
  const t = useTranslations("DeleteCategoryModal");
  const dispatch = useAppDispatch();
  const { deleting } = useAppSelector((state) => state.categories);

  const canDelete =
    category && category.subCategoryCount === 0 && category.partCount === 0;

  const handleDelete = async () => {
    if (!category) return;
    try {
      await dispatch(deleteCategory(category.id)).unwrap();
      toast.success(t("deletedSuccess"));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || t("deleteFailed"));
    }
  };

  const handleClose = () => {
    if (!deleting) {
      onClose();
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-neutral-50 transition"
            disabled={deleting}
          >
            <X className="w-5 h-5 text-amazon-textMuted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {canDelete ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-sm border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-bold mb-1 text-[13px]">
                    {t("confirmDeleteTitle")}
                  </p>
                  <p className="text-red-600 text-xs">
                    {t("confirmDeleteBody", {
                      name: category.name,
                      type:
                        category.categoryType === "global"
                          ? t("typeGlobal")
                          : t("typePrivate"),
                    })}
                  </p>
                </div>
              </div>

              {/* Category info summary */}
              <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3 text-[13px] font-medium space-y-2">
                <div className="flex justify-between">
                  <span className="text-amazon-textMuted">
                    {t("fieldName")}
                  </span>
                  <span className="font-medium text-amazon-text">
                    {category.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amazon-textMuted">
                    {t("fieldType")}
                  </span>
                  <span
                    className={`font-medium text-[12px] ${
                      category.categoryType === "global"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {category.categoryType === "global"
                      ? t("typeGlobal")
                      : t("typePrivate")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amazon-textMuted">
                    {t("fieldSlug")}
                  </span>
                  <span className="text-amazon-text">{category.slug}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-sm border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-bold mb-1 text-[13px]">
                  {t("cannotDeleteTitle", { name: category.name })}
                </p>
                <ul className="list-disc list-inside text-amber-600 space-y-0.5 text-[12px] font-medium">
                  {category.subCategoryCount > 0 && (
                    <li>
                      {t("hasSubCategories", {
                        count: category.subCategoryCount,
                      })}
                    </li>
                  )}
                  {category.partCount > 0 && (
                    <li>
                      {t("hasPartsAssigned", { count: category.partCount })}
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-[11px] font-medium text-amber-600">
                  {t("removeDependenciesHint")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-5 border-t border-amazon-border bg-neutral-50/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="px-4 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 text-[13px] font-medium text-white bg-red-600 border border-red-600 rounded-sm hover:bg-red-700 hover:border-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleting ? t("deleting") : t("delete")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
