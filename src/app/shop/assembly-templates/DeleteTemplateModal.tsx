import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyTemplate } from "@/src/types/assembly.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template: AssemblyTemplate | null;
}

export default function DeleteTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !template) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await assemblyService.deleteTemplate(template.templateId);
      if (res.success) {
        toast.success("Template deleted successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to delete template");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-md shadow-lg overflow-hidden flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Template</h2>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the step:{" "}
            <strong className="text-black">{template.stepName}</strong>?
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 min-w-[100px]"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
