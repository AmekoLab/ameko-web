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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Delete Category</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
            disabled={deleting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {canDelete ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold mb-1">
                    Are you sure you want to delete this category?
                  </p>
                  <p className="text-red-600">
                    This action will soft-delete{" "}
                    <strong>&quot;{category.name}&quot;</strong> (
                    {category.categoryType}). This cannot be easily undone.
                  </p>
                </div>
              </div>

              {/* Category info summary */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold text-gray-800">
                    {category.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span
                    className={`font-semibold uppercase text-xs ${
                      category.categoryType === "global"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {category.categoryType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slug</span>
                  <span className="text-gray-600">{category.slug}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold mb-1">
                  Cannot delete &quot;{category.name}&quot;
                </p>
                <ul className="list-disc list-inside text-amber-600 space-y-0.5">
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
                <p className="mt-2 text-xs text-amber-500">
                  Remove all sub-categories and parts before deleting.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
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
