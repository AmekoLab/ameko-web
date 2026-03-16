"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { deleteAssembledProduct } from "@/src/store/slices/assembledProductsSlice";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";
import { toast } from "react-toastify";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface DeleteAssembledProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: AssembledProductItem | null;
}

export default function DeleteAssembledProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: DeleteAssembledProductModalProps) {
  const dispatch = useAppDispatch();
  const { deleting } = useAppSelector((state) => state.assembledProducts);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !product) return null;

  const canDelete = confirmText === product.name;

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      const result = await dispatch(
        deleteAssembledProduct(product.id),
      ).unwrap();
      if (result.success) {
        toast.success("Assembled product deleted successfully!");
        setConfirmText("");
        onClose();
        onSuccess();
      } else {
        toast.error(result.message || "Failed to delete assembled product");
      }
    } catch (error: unknown) {
      toast.error((error as string) || "Failed to delete assembled product");
    }
  };

  const handleClose = () => {
    if (deleting) return;
    setConfirmText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Delete Assembled Product
              </h2>
              <p className="text-xs text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-red-100 transition text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            You are about to permanently delete the assembled product:
          </p>

          {/* Product info card */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <p className="font-bold text-gray-900 text-sm">{product.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Layout:{" "}
              <span className="font-semibold">{product.layout || "N/A"}</span>{" "}
              &middot; Components:{" "}
              <span className="font-semibold">
                {product.details?.length || 0}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">{product.id}</p>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Type{" "}
              <span className="font-bold text-gray-900">{product.name}</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
              placeholder={product.name}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
