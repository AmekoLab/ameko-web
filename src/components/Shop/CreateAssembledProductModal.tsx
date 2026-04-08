"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Plus, Trash2, Upload, Box, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { createAssembledProduct } from "@/src/store/slices/assembledProductsSlice";
import { fetchParts } from "@/src/store/slices/partsSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { PartItem } from "@/src/types/part.types";
import { toast } from "react-toastify";
import { uploadImage } from "@/src/utils/uploadImage";
import { uploadGlb } from "@/src/utils/uploadGlb";

// --- ZOD SCHEMA ---
const detailSchema = z.object({
  baseKitId: z.string().min(1, "Base Kit ID is required"),
  componentId: z.string().min(1, "Component ID is required"),
  quantity: z.string().min(1, "Quantity is required"),
  soundUrl: z.string().optional(),
});

const createAssembledProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Max 200 characters"),
  view3DUrl: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Max 2000 characters"),
  quantity: z.string().min(1, "Quantity is required"),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  layout: z.string().optional(),
  mounting: z.string().optional(),
  pcb: z.string().optional(),
  connection: z.string().optional(),
  battery: z.string().optional(),
  details: z.array(detailSchema).min(1, "At least one component is required"),
});

type CreateFormValues = z.infer<typeof createAssembledProductSchema>;

interface CreateAssembledProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAssembledProductModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAssembledProductModalProps) {
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.assembledProducts);
  const { currentShop } = useAppSelector((state) => state.shop);
  const { parts } = useAppSelector((state) => state.parts);

  // Fetch shop & parts when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!currentShop) dispatch(fetchCurrentShop());
    }
  }, [isOpen, currentShop, dispatch]);

  useEffect(() => {
    if (isOpen && currentShop?.id) {
      dispatch(fetchParts(currentShop.id));
    }
  }, [isOpen, currentShop?.id, dispatch]);

  // Group parts by type
  const kitParts = useMemo(
    () => parts.filter((p) => p.partType === "kit"),
    [parts],
  );
  const partsByType = useMemo(() => {
    const groups: Record<string, PartItem[]> = {};
    parts.forEach((p) => {
      if (!groups[p.partType]) groups[p.partType] = [];
      groups[p.partType].push(p);
    });
    return groups;
  }, [parts]);

  // --- Image & 3D upload states ---
  const [isUploading1, setIsUploading1] = useState(false);
  const [isUploading2, setIsUploading2] = useState(false);
  const [isUploading3, setIsUploading3] = useState(false);
  const [isUploading3D, setIsUploading3D] = useState(false);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const fileRef3 = useRef<HTMLInputElement>(null);
  const fileRef3D = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createAssembledProductSchema),
    defaultValues: {
      name: "",
      view3DUrl: "",
      price: "0",
      description: "",
      quantity: "1",
      image1: "",
      image2: "",
      image3: "",
      layout: "",
      mounting: "",
      pcb: "",
      connection: "",
      battery: "",
      details: [
        { baseKitId: "", componentId: "", quantity: "1", soundUrl: "" },
      ],
    },
  });

  const watchedImage1 = watch("image1");
  const watchedImage2 = watch("image2");
  const watchedImage3 = watch("image3");
  const watchedView3D = watch("view3DUrl");

  // --- Image upload handlers ---
  const makeFileChangeHandler =
    (
      field: "image1" | "image2" | "image3",
      setUploading: (v: boolean) => void,
      ref: React.MutableRefObject<HTMLInputElement | null>,
    ) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadImage(file);
        setValue(field, url, { shouldValidate: true });
      } catch {
        toast.error("Image upload failed, please try again");
      } finally {
        setUploading(false);
        if (ref.current) ref.current.value = "";
      }
    };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const [activeTab, setActiveTab] = useState<"basic" | "specs" | "components">(
    "basic",
  );

  // --- Submit ---
  const onSubmit = async (data: CreateFormValues) => {
    try {
      await dispatch(
        createAssembledProduct({
          name: data.name,
          view3DUrl: data.view3DUrl || "",
          price: Number(data.price),
          description: data.description,
          quantity: Number(data.quantity),
          image1: data.image1 || "",
          image2: data.image2 || "",
          image3: data.image3 || "",
          layout: data.layout || "",
          mounting: data.mounting || "",
          pcb: data.pcb || "",
          connection: data.connection || "",
          battery: data.battery || "",
          details: data.details.map((d) => ({
            baseKitId: d.baseKitId,
            componentId: d.componentId,
            quantity: Number(d.quantity),
            soundUrl: d.soundUrl || "",
          })),
        }),
      ).unwrap();
      toast.success("Assembled product created successfully!");
      handleReset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to create assembled product");
    }
  };

  const handleReset = () => {
    reset();
    setActiveTab("basic");
    if (fileRef1.current) fileRef1.current.value = "";
    if (fileRef2.current) fileRef2.current.value = "";
    if (fileRef3.current) fileRef3.current.value = "";
    if (fileRef3D.current) fileRef3D.current.value = "";
  };

  const handleClose = () => {
    if (!creating) {
      handleReset();
      onClose();
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3 py-2 border border-amazon-border rounded-sm text-[13px] tracking-widest text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition placeholder:text-neutral-400";
  const labelClass = "block text-[14px] tracking-widest text-amazon-textMuted mb-2 font-black uppercase";
  const errorClass = "text-[13px] font-bold tracking-widest text-red-500 mt-1 uppercase";

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  const tabs = [
    { key: "basic" as const, label: "Basic Info" },
    { key: "specs" as const, label: "Specifications" },
    { key: "components" as const, label: "Components" },
  ];

  const imageFields = [
    {
      label: "Image 1",
      field: "image1" as const,
      ref: fileRef1,
      isUploading: isUploading1,
      setUploading: setIsUploading1,
      watched: watchedImage1,
    },
    {
      label: "Image 2",
      field: "image2" as const,
      ref: fileRef2,
      isUploading: isUploading2,
      setUploading: setIsUploading2,
      watched: watchedImage2,
    },
    {
      label: "Image 3",
      field: "image3" as const,
      ref: fileRef3,
      isUploading: isUploading3,
      setUploading: setIsUploading3,
      watched: watchedImage3,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <div>
            <h2 className="text-lg font-black text-amazon-text tracking-widest">
              Create Assembled Product
            </h2>
            <p className="text-[10px] tracking-widest text-amazon-textMuted mt-0.5 uppercase">
              Add a new assembled keyboard product to your shop.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-neutral-50 transition"
            disabled={creating}
          >
            <X className="w-5 h-5 text-amazon-textMuted hover:text-amazon-text" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amazon-border px-5 uppercase">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-[11px] font-black tracking-widest border-b-2 transition -mb-px ${
                activeTab === tab.key
                  ? "border-amazon-btnPrimary text-amazon-btnPrimary"
                  : "border-transparent text-amazon-textMuted hover:text-amazon-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Tab: Basic Info */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  {...register("name")}
                  className={inputClass}
                  placeholder="e.g. Bàn phím thủ công"
                />
                {errors.name && (
                  <p className={errorClass}>{errors.name.message}</p>
                )}
              </div>

              {/* Price + Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price (VND) *</label>
                  <input
                    type="number"
                    {...register("price")}
                    className={inputClass}
                    placeholder="e.g. 60000000"
                    min={0}
                  />
                  {errors.price && (
                    <p className={errorClass}>{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input
                    type="number"
                    {...register("quantity")}
                    className={inputClass}
                    placeholder="e.g. 1"
                    min={0}
                  />
                  {errors.quantity && (
                    <p className={errorClass}>{errors.quantity.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  {...register("description")}
                  className={`${inputClass} resize-none`}
                  rows={4}
                  placeholder="Describe this assembled product..."
                />
                {errors.description && (
                  <p className={errorClass}>{errors.description.message}</p>
                )}
              </div>

              {/* Image Uploads */}
              <div className="space-y-3">
                <p className="text-[14px] font-black uppercase tracking-widest text-amazon-text">Product Images</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {imageFields.map(({ label, field, ref, isUploading, setUploading, watched }) => (
                    <div key={field}>
                      <label className="block text-[11px] font-black text-amazon-textMuted uppercase tracking-widest mb-2">
                        {label}
                      </label>
                      {/* Hidden file input */}
                      <input
                        ref={ref}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={makeFileChangeHandler(field, setUploading, ref)}
                      />
                      {watched ? (
                        /* Preview state */
                        <div className="relative w-full h-28 rounded-sm overflow-hidden border border-amazon-border bg-neutral-50 shadow-sm">
                          <Image
                            src={watched}
                            alt={label}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setValue(field, "", { shouldValidate: true })}
                            className="absolute top-2 right-2 p-1 bg-white border border-amazon-border shadow-sm rounded-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5 text-amazon-textMuted" />
                          </button>
                        </div>
                      ) : (
                        /* Empty / Loading state */
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => ref.current?.click()}
                          className="w-full h-28 border border-dashed border-amazon-border bg-neutral-50 rounded-sm flex flex-col items-center justify-center gap-1.5 text-amazon-textMuted hover:border-amazon-btnPrimary hover:text-amazon-btnPrimary transition-colors disabled:opacity-50"
                        >
                          {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isUploading ? "Uploading..." : "Click to upload"}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D Model Upload */}
              <div>
                <label className={labelClass}>3D Model (.glb)</label>
                {/* Hidden file input */}
                <input
                  ref={fileRef3D}
                  type="file"
                  accept=".glb"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading3D(true);
                    try {
                      const url = await uploadGlb(file);
                      setValue("view3DUrl", url, { shouldValidate: true });
                    } catch {
                      toast.error("3D model upload failed, please try again");
                    } finally {
                      setIsUploading3D(false);
                      if (fileRef3D.current) fileRef3D.current.value = "";
                    }
                  }}
                />
                {watchedView3D ? (
                  /* Uploaded state */
                  <div className="relative w-full h-20 rounded-sm border border-emerald-500 bg-emerald-50 flex items-center justify-center gap-3 px-4 shadow-sm">
                    <Box className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">3D Model Uploaded</span>
                      <span className="text-[10px] font-bold tracking-widest text-emerald-600 truncate max-w-[200px]">{watchedView3D.split("/").pop()}</span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <button
                      type="button"
                      onClick={() => setValue("view3DUrl", "", { shouldValidate: true })}
                      className="absolute top-2 right-2 p-1 bg-white border border-emerald-200 shadow-sm rounded-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  </div>
                ) : (
                  /* Empty / Loading state */
                  <button
                    type="button"
                    disabled={isUploading3D}
                    onClick={() => fileRef3D.current?.click()}
                    className="w-full h-20 border border-dashed border-amazon-border bg-neutral-50 rounded-sm flex flex-col items-center justify-center gap-1.5 text-amazon-textMuted hover:border-amazon-btnPrimary hover:text-amazon-btnPrimary transition-colors disabled:opacity-50"
                  >
                    {isUploading3D ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Box className="w-5 h-5" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isUploading3D ? "Uploading..." : "Click to upload .glb"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab: Specifications */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-sm shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-widest text-indigo-800 mb-4">
                  Keyboard Specifications
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Layout</label>
                    <input
                      {...register("layout")}
                      className={inputClass}
                      placeholder="e.g. 85%, 75%, TKL"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Mounting</label>
                    <input
                      {...register("mounting")}
                      className={inputClass}
                      placeholder="e.g. Gasket Mount"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PCB</label>
                    <input
                      {...register("pcb")}
                      className={inputClass}
                      placeholder="e.g. 1.2mm Flex-cut, Hotswap"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Connection</label>
                    <input
                      {...register("connection")}
                      className={inputClass}
                      placeholder="e.g. Tri-mode"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Battery</label>
                    <input
                      {...register("battery")}
                      className={inputClass}
                      placeholder="e.g. 2250mAh x 2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Components */}
          {activeTab === "components" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-black uppercase tracking-widest text-amazon-text">
                  Component Details ({fields.length})
                </p>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      baseKitId: "",
                      componentId: "",
                      quantity: "1",
                      soundUrl: "",
                    })
                  }
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amazon-btnPrimary bg-amazon-btnPrimary/10 border border-amazon-btnPrimary/20 rounded-sm hover:bg-amazon-btnPrimary/20 transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  Add Component
                </button>
              </div>

              {errors.details && !Array.isArray(errors.details) && (
                <p className={errorClass}>
                  {(errors.details as { message?: string }).message}
                </p>
              )}

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-5 bg-neutral-50 border border-amazon-border rounded-sm space-y-4 relative shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-amazon-textMuted">
                        Component #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1 rounded-sm border border-transparent text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-amazon-textMuted mb-2">
                          Base Kit *
                        </label>
                        <select
                          {...register(`details.${index}.baseKitId`)}
                          className={inputClass}
                        >
                          <option value="">— SELECT A KIT —</option>
                          {kitParts.map((kit) => (
                            <option key={kit.id} value={kit.id}>
                              {kit.name} ({kit.slug})
                            </option>
                          ))}
                        </select>
                        {errors.details?.[index]?.baseKitId && (
                          <p className={errorClass}>
                            {errors.details[index].baseKitId?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-amazon-textMuted mb-2">
                          Component *
                        </label>
                        <select
                          {...register(`details.${index}.componentId`)}
                          className={inputClass}
                        >
                          <option value="">— SELECT A COMPONENT —</option>
                          {Object.entries(partsByType).map(([type, items]) => (
                            <optgroup
                              key={type}
                              label={
                                type.charAt(0).toUpperCase() + type.slice(1)
                              }
                            >
                              {items.map((part) => (
                                <option key={part.id} value={part.id}>
                                  {part.name} — {formatPrice(part.price)}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {errors.details?.[index]?.componentId && (
                          <p className={errorClass}>
                            {errors.details[index].componentId?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-amazon-textMuted mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          {...register(`details.${index}.quantity`)}
                          className={inputClass}
                          placeholder="e.g. 1"
                          min={1}
                        />
                        {errors.details?.[index]?.quantity && (
                          <p className={errorClass}>
                            {errors.details[index].quantity?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-amazon-textMuted mb-2">
                          Sound URL
                        </label>
                        <input
                          {...register(`details.${index}.soundUrl`)}
                          className={inputClass}
                          placeholder="YouTube embed URL (optional)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5 border-t border-amazon-border mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="px-5 py-2.5 text-[13px] tracking-widest text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 text-[13px] font-black tracking-widest text-amazon-text bg-amazon-btnPrimary rounded-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />}
              {creating ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
