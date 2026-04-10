import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyLog } from "@/src/types/assembly.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  logToUpdate: AssemblyLog | null;
}

interface FormValues {
  status: string;
  note: string;
}

export default function UpdateLogModal({ isOpen, onClose, onSuccess, logToUpdate }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (isOpen && logToUpdate) {
      reset({
        status: (logToUpdate.status ?? 0).toString(),
        note: logToUpdate.note ?? "",
      });
      setFile(null);
    }
  }, [isOpen, logToUpdate, reset]);

  if (!isOpen || !logToUpdate) return null;

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Status", data.status);
      if (data.note) formData.append("Note", data.note);
      if (file) formData.append("MediaFile", file);

      const res = await assemblyService.updateTrackingLog(logToUpdate.progressLogId, formData);
      if (res.success) {
        toast.success("Progress log updated successfully.");
        onSuccess();
        reset();
        setFile(null);
        onClose();
      } else {
        toast.error(res.message || "Failed to update tracking log.");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white border border-amazon-border max-w-md w-full p-6 rounded-sm shadow-2xl relative">
        <h2 className="text-lg font-bold text-amazon-text mb-6">
          Update Assembly Log
        </h2>

        <form id="update-log-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
            >
              <option value="0">Pending (0)</option>
              <option value="1">In Progress (1)</option>
              <option value="2">Completed (2)</option>
              <option value="3">Skipped (3)</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
              Note
            </label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Add your note here..."
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors resize-none placeholder-gray-400"
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
              Media File (Optional)
            </label>
            <label className="block bg-neutral-50 text-center text-sm text-amazon-textMuted border border-amazon-border border-dashed rounded-sm py-4 cursor-pointer hover:border-amazon-focus hover:text-amazon-focus transition-colors">
              <span className="font-bold underline">Click to browse</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>
            {file && (
              <p className="mt-2 text-xs text-amazon-textMuted italic">
                Selected: <span className="text-amazon-text font-medium">{file.name}</span>
              </p>
            )}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-amazon-border">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-amazon-textMuted hover:text-amazon-text transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="update-log-form"
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 bg-amazon-btnPrimary hover:brightness-95 text-amazon-text font-medium text-sm rounded-sm transition-all shadow-sm min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed border border-amazon-border"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
