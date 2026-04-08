"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
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
  const dispatch = useAppDispatch();
  const { deleting } = useAppSelector((state) => state.categories);

  const canDelete =
    category && category.subCategoryCount === 0 && category.partCount === 0;

  const handleDelete = async () => {
    if (!category) return;
    try {
      await dispatch(deleteCategory(category.id)).unwrap();
      toast.success("Category deleted successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to delete category");
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
          <h2 className="text-lg font-black text-amazon-text uppercase tracking-widest">Delete Category</h2>
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
                  <p className="font-bold  tracking-widest mb-1 text-[13px]">
                    Are you sure you want to delete this category?
                  </p>
                  <p className="text-red-600 text-xs">
                    This action will soft-delete{" "}
                    <strong>&quot;{category.name}&quot;</strong> (
                    {category.categoryType}). This cannot be easily undone.
                  </p>
                </div>
              </div>

              {/* Category info summary */}
              <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3 text-[13px] font-bold  tracking-widest space-y-2">
                <div className="flex justify-between">
                  <span className="text-amazon-textMuted">Name</span>
                  <span className="font-black text-amazon-text">
                    {category.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amazon-textMuted">Type</span>
                  <span
                    className={`font-black uppercase text-xs ${
                      category.categoryType === "global"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {category.categoryType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amazon-textMuted">Slug</span>
                  <span className="text-amazon-text">{category.slug}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-sm border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-bold uppercase tracking-widest mb-1 text-[11px]">
                  Cannot delete &quot;{category.name}&quot;
                </p>
                <ul className="list-disc list-inside text-amber-600 space-y-0.5 text-xs font-bold tracking-widest uppercase">
                  {category.subCategoryCount > 0 && (
                    <li>
                      Has {category.subCategoryCount} sub-categor
                      {category.subCategoryCount === 1 ? "y" : "ies"}
                    </li>
                  )}
                  {category.partCount > 0 && (
                    <li>
                      Has {category.partCount} part
                      {category.partCount === 1 ? "" : "s"} assigned
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-amber-500">
                  Remove all sub-categories and parts before deleting.
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
            className="px-4 py-2 text-[13px] font-black  tracking-widest text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50"
          >
            Cancel
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 text-[13px] font-black  tracking-widest text-white bg-red-600 border border-red-600 rounded-sm hover:bg-red-700 hover:border-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
