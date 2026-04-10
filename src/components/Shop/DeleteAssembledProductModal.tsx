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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 overflow-hidden border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-red-100 flex items-center justify-center border border-red-200 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900">
                Delete Assembled Product
              </h2>
              <p className="text-[12px] font-medium text-red-700 mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={deleting}
            className="p-1.5 rounded-sm border border-transparent hover:border-red-200 hover:bg-red-100 transition text-red-400 hover:text-red-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] font-medium text-amazon-textMuted">
            You are about to permanently delete the assembled product:
          </p>

          {/* Product info card */}
          <div className="bg-neutral-50 rounded-sm border border-amazon-border p-4 shadow-sm">
            <p className="font-bold text-amazon-text text-[13px]">{product.name}</p>
            <p className="text-[12px] text-amazon-textMuted mt-1">
              Layout:{" "}
              <span className="font-medium text-amazon-text">{product.layout || "N/A"}</span>{" "}
              &middot; Components:{" "}
              <span className="font-medium text-amazon-text">
                {product.details?.length || 0}
              </span>
            </p>
            {/* <p className="text-[9px] text-amazon-textMuted mt-1.5 font-bold uppercase tracking-widest">{product.id}</p> */}
          </div>

          {/* Confirmation input */}
          <div className="pt-2">
            <label className="block text-[13px] text-amazon-textMuted font-medium mb-2">
              Type{" "}
              <span className="font-bold text-amazon-text">{product.name}</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
              placeholder={product.name}
              className="w-full px-3 py-2 border border-amazon-border rounded-sm text-[13px] font-medium text-amazon-text focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition disabled:opacity-50 disabled:bg-neutral-50 mb-2 placeholder:text-neutral-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-amazon-border bg-neutral-50">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="px-5 py-2 text-[13px] font-medium text-white bg-red-600 rounded-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
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
