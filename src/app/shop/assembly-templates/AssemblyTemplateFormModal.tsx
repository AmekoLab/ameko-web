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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-md shadow-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {templateToEdit ? "Edit Template" : "Create Template"}
          </h2>
        </div>

        <div className="p-6">
          <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Name
              </label>
              <input
                {...register("stepName")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#f5d800] focus:border-transparent"
                placeholder="e.g., Lắp switch"
              />
              {errors.stepName && (
                <p className="mt-1 text-xs text-red-500">{errors.stepName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Order
              </label>
              <input
                type="number"
                {...register("stepOrder", { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#f5d800] focus:border-transparent"
              />
              {errors.stepOrder && (
                <p className="mt-1 text-xs text-red-500">{errors.stepOrder.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isRequired"
                {...register("isRequired")}
                className="w-4 h-4 text-[#f5d800] border-gray-300 rounded focus:ring-[#f5d800]"
              />
              <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                Is Required?
              </label>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="template-form"
            disabled={isSubmitting}
            className="flex items-center justify-center px-4 py-2 text-sm font-bold text-black bg-[#f5d800] rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50 min-w-[100px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
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
