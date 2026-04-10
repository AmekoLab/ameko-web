import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyTemplate, AssemblyTemplatePayload } from "@/src/types/assembly.types";

const formSchema = z.object({
  stepName: z.string().min(1, "Step name is required"),
  stepOrder: z.number().min(1, "Step order must be at least 1"),
  isRequired: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateToEdit: AssemblyTemplate | null;
  nextOrder: number;
}

export default function AssemblyTemplateFormModal({
  isOpen,
  onClose,
  onSuccess,
  templateToEdit,
  nextOrder,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stepName: "",
      stepOrder: nextOrder,
      isRequired: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        reset({
          stepName: templateToEdit.stepName,
          stepOrder: templateToEdit.stepOrder,
          isRequired: templateToEdit.isRequired,
        });
      } else {
        reset({
          stepName: "",
          stepOrder: nextOrder,
          isRequired: true,
        });
      }
    }
  }, [isOpen, templateToEdit, nextOrder, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload: AssemblyTemplatePayload = {
        stepName: data.stepName,
        stepOrder: data.stepOrder,
        isRequired: data.isRequired,
      };

      if (templateToEdit) {
        const res = await assemblyService.updateTemplate(
          templateToEdit.templateId,
          payload
        );
        if (res.success) {
          toast.success("Template updated successfully");
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || "Failed to update template");
        }
      } else {
        const res = await assemblyService.createTemplate(payload);
        if (res.success) {
          toast.success("Template created successfully");
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || "Failed to create template");
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md border border-amazon-border rounded-md shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-amazon-border">
          <h2 className="text-lg font-bold text-amazon-text">
            {templateToEdit ? "Edit Template" : "Create Template"}
          </h2>
        </div>

        <div className="p-6">
          <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amazon-text mb-1.5">
                Step Name
              </label>
              <input
                {...register("stepName")}
                className="w-full border border-amazon-border bg-white rounded-md px-4 py-2.5 text-amazon-text placeholder-gray-400 focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
                placeholder="e.g., Lắp switch"
              />
              {errors.stepName && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.stepName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-amazon-text mb-1.5">
                Step Order
              </label>
              <input
                type="number"
                {...register("stepOrder", { valueAsNumber: true })}
                className="w-full border border-amazon-border bg-white rounded-md px-4 py-2.5 text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus transition-all text-sm font-medium"
              />
              {errors.stepOrder && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.stepOrder.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-2">
              <input
                type="checkbox"
                id="isRequired"
                {...register("isRequired")}
                className="w-4 h-4 text-amazon-focus border-amazon-border rounded focus:ring-amazon-focus cursor-pointer"
              />
              <label htmlFor="isRequired" className="text-sm font-medium text-amazon-text cursor-pointer">
                Is Required?
              </label>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-amazon-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium text-amazon-text bg-white border border-amazon-border rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="template-form"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-amazon-text bg-amazon-btnPrimary rounded-md hover:brightness-95 transition-all shadow-sm disabled:opacity-70 min-w-[100px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />
            ) : templateToEdit ? (
              "Save"
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
