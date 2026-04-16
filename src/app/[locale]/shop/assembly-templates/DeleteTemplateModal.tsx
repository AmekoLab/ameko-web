import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("DeleteTemplateModal");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !template) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await assemblyService.deleteTemplate(template.templateId);
      if (res.success) {
        toast.success(t("toast.deleteSuccess"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || t("toast.deleteFailed"));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("toast.unexpectedError");
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-sm border border-amazon-border rounded-md shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-lg font-bold text-amazon-text mb-2">
            {t("title")}
          </h2>
          <p className="text-sm font-medium text-amazon-textMuted">
            {t("descriptionPrefix")}{" "}
            <strong className="text-amazon-text">{template.stepName}</strong>
            {t("descriptionSuffix")}
          </p>
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-amazon-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-amazon-text bg-white border border-amazon-border rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-70"
          >
            {t("actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-all shadow-sm disabled:opacity-70 min-w-[100px]"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              t("actions.delete")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
