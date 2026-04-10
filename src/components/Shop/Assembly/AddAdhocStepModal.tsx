import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { assemblyService } from "@/src/services/assembly.service";
import { AssemblyTemplate } from "@/src/types/assembly.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderItemId: string;
  nextOrder: number;
}

const formSchema = z.object({
  stepName: z.string().min(1, "Step name is required"),
  stepOrder: z.number().min(1, "Step order is required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddAdhocStepModal({
  isOpen,
  onClose,
  onSuccess,
  orderItemId,
  nextOrder,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [optionalTemplates, setOptionalTemplates] = useState<AssemblyTemplate[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stepName: "",
      stepOrder: nextOrder,
      note: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        stepName: "",
        stepOrder: nextOrder,
        note: "",
      });
      setFile(null);
    }
  }, [isOpen, nextOrder, reset]);

  useEffect(() => {
    const fetchOptionalTemplates = async () => {
      try {
        const res = await assemblyService.getShopTemplates();
        if (res.success && res.data) {
          const optional = res.data.filter((t) => t.isRequired === false);
          setOptionalTemplates(optional);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOptionalTemplates();
  }, []);

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("StepName", data.stepName);
      formData.append("StepOrder", data.stepOrder.toString());
      if (data.note) formData.append("Note", data.note);
      if (file) formData.append("MediaFile", file);

      const res = await assemblyService.addAdhocStep(orderItemId, formData);
      if (res.success) {
        toast.success("Ad-hoc step added successfully.");
        onSuccess();
        reset();
        setFile(null);
        onClose();
      } else {
        toast.error(res.message || "Failed to add step.");
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
          Add Ad-hoc Step
        </h2>

        <form id="adhoc-step-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Step Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
              Step Name
            </label>
            <input
              {...register("stepName")}
              placeholder="e.g., Chọn Case..."
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
            />
            {errors.stepName && (
              <p className="mt-1 text-xs text-red-500">{errors.stepName.message}</p>
            )}

            {optionalTemplates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-[10px] font-medium text-amazon-textMuted flex items-center mr-1">
                  Optional Templates:
                </span>
                {optionalTemplates.map((template) => (
                  <button
                    key={template.templateId}
                    type="button"
                    onClick={() => setValue("stepName", template.stepName, { shouldValidate: true })}
                    className="text-[10px] bg-neutral-50 hover:bg-neutral-100 text-amazon-text border border-amazon-border px-2 py-1 rounded-sm transition-colors font-medium"
                  >
                    {template.stepName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step Order */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
              Step Order
            </label>
            <input
              type="number"
              {...register("stepOrder", { valueAsNumber: true })}
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
            />
            {errors.stepOrder && (
              <p className="mt-1 text-xs text-red-500">{errors.stepOrder.message}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amazon-textMuted mb-1.5">
              Note (Optional)
            </label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Add your note here..."
              className="w-full border border-amazon-border bg-white text-amazon-text rounded-sm px-3.5 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-amazon-focus focus:border-amazon-focus transition-colors"
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
            form="adhoc-step-form"
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 bg-amazon-btnPrimary hover:brightness-95 text-amazon-text font-medium text-sm rounded-sm transition-all shadow-sm min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed border border-amazon-border"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
