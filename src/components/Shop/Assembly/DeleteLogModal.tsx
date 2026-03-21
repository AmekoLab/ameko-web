"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyLog } from "@/src/types/assembly.types";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  log: AssemblyLog | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteLogModal({ isOpen, log, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !log) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await assemblyService.deleteTrackingLog(log.progressLogId);
      // Depending on API response structure, we might check res.success or similar
      // Assuming a standard format where lack of error thrown implies success or checking res
      toast.success("Assembly step deleted successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while deleting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-md p-6 max-w-sm w-full">
        <h2 className="text-red-600 font-bold text-lg mb-4">Delete Assembly Step</h2>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the step: <span className="font-semibold">{log.stepName}</span>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
