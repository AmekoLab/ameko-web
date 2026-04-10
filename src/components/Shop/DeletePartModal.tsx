"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { deletePart } from "@/src/store/slices/partsSlice";
import { PartItem } from "@/src/types/part.types";
import { toast } from "react-toastify";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface DeletePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  part: PartItem | null;
}

export default function DeletePartModal({
  isOpen,
  onClose,
  onSuccess,
  part,
}: DeletePartModalProps) {
  const dispatch = useAppDispatch();
  const { deleting } = useAppSelector((state) => state.parts);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !part) return null;

  const canDelete = confirmText === part.name;

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      const result = await dispatch(deletePart(part.id)).unwrap();
      if (result.success) {
        toast.success("Part deleted successfully!");
        setConfirmText("");
        onClose();
        onSuccess();
      } else {
        toast.error(result.message || "Failed to delete part");
      }
    } catch (error: unknown) {
      toast.error((error as string) || "Failed to delete part");
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
      <div className="relative bg-white rounded-sm shadow-xl w-full max-w-md mx-4 overflow-hidden border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amazon-text">Delete Part</h2>
              <p className="text-[12px] font-medium text-red-700 mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={deleting}
            className="p-1.5 rounded-sm hover:bg-red-100 transition text-red-600/60 hover:text-red-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <p className="text-[14px] font-medium text-amazon-textMuted">
            You are about to permanently delete the part:
          </p>

          {/* Part info card */}
          <div className="bg-neutral-50 rounded-sm border border-amazon-border p-4">
            <p className="font-bold text-amazon-text text-[14px]">{part.name}</p>
            <p className="text-[13px] font-medium text-amazon-textMuted mt-1">
              Type:{" "}
              <span className="font-medium text-amazon-text capitalize">{part.partType}</span>{" "}
              &middot; Category:{" "}
              <span className="font-medium text-amazon-text capitalize">
                {part.categoryName}
              </span>
            </p>
            {/* <p className="text-[9px] text-amazon-textMuted mt-1 font-mono uppercase tracking-widest">{part.id}</p> */}
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-[13px] font-medium text-amazon-textMuted mb-2">
              Type <span className="font-bold text-amazon-text">{part.name}</span>{" "}
              to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
              placeholder={part.name}
              className="text-[13px] font-medium text-amazon-text w-full px-3 py-2 border border-amazon-border rounded-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition disabled:opacity-50 disabled:bg-neutral-50 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-amazon-border bg-neutral-50/50">
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
            className="px-5 py-2 text-[13px] font-medium text-white bg-red-600 border border-red-600 rounded-sm hover:bg-red-700 hover:border-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Part
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
