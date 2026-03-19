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
      <div className="bg-[#151515] border border-[#1e2126] max-w-md w-full p-6 rounded-sm shadow-2xl relative">
        <h2 className="text-xl font-oswald font-black text-white uppercase tracking-widest mb-6">
          Add Ad-hoc Step
        </h2>

        <form id="adhoc-step-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Step Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#f5d800] mb-2">
              Step Name
            </label>
            <input
              {...register("stepName")}
              placeholder="e.g., Chọn Case..."
              className="bg-[#1a1c20] text-white border border-[#1e2126] w-full p-2 outline-none focus:border-[#f5d800] transition-colors rounded-sm text-sm"
            />
            {errors.stepName && (
              <p className="mt-1 text-xs text-red-500">{errors.stepName.message}</p>
            )}

            {optionalTemplates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-[10px] text-gray-500 uppercase flex items-center mr-1">
                  Optional Templates:
                </span>
                {optionalTemplates.map((template) => (
                  <button
                    key={template.templateId}
                    type="button"
                    onClick={() => setValue("stepName", template.stepName, { shouldValidate: true })}
                    className="text-[10px] bg-[#2a2d35] hover:bg-[#f5d800] hover:text-black text-gray-300 border border-[#3a3f4a] px-2 py-1 rounded-sm transition-colors uppercase tracking-wider font-bold"
                  >
                    {template.stepName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step Order */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#f5d800] mb-2">
              Step Order
            </label>
            <input
              type="number"
              {...register("stepOrder", { valueAsNumber: true })}
              className="bg-[#1a1c20] text-white border border-[#1e2126] w-full p-2 outline-none focus:border-[#f5d800] transition-colors rounded-sm text-sm"
            />
            {errors.stepOrder && (
              <p className="mt-1 text-xs text-red-500">{errors.stepOrder.message}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#f5d800] mb-2">
              Note (Optional)
            </label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Add your note here..."
              className="bg-[#1a1c20] text-white border border-[#1e2126] w-full p-2 outline-none focus:border-[#f5d800] transition-colors rounded-sm text-sm"
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#f5d800] mb-2">
              Media File (Optional)
            </label>
            <label className="block bg-[#1a1c20] text-center text-sm text-gray-400 border border-[#1e2126] border-dashed rounded-sm py-4 cursor-pointer hover:border-[#f5d800] hover:text-[#f5d800] transition-colors">
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
              <p className="mt-2 text-xs text-gray-400 italic">
                Selected: <span className="text-white">{file.name}</span>
              </p>
            )}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#1e2126]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="adhoc-step-form"
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 bg-[#f5d800] text-black font-black uppercase tracking-widest text-[11px] rounded-sm hover:border-[#f5d800] hover:bg-[#ffe500] transition-colors min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
