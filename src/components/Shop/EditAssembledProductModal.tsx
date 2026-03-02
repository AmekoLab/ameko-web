"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateAssembledProduct } from "@/src/store/slices/assembledProductsSlice";
import { fetchParts } from "@/src/store/slices/partsSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";
import { PartItem } from "@/src/types/part.types";
import { toast } from "react-toastify";

// --- ZOD SCHEMA ---
const detailSchema = z.object({
  baseKitId: z.string().min(1, "Base Kit ID is required"),
  componentId: z.string().min(1, "Component ID is required"),
  quantity: z.string().min(1, "Quantity is required"),
  soundUrl: z.string().optional(),
});

const editAssembledProductSchema = z.object({
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

type EditFormValues = z.infer<typeof editAssembledProductSchema>;

interface EditAssembledProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: AssembledProductItem | null;
}

export default function EditAssembledProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: EditAssembledProductModalProps) {
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.assembledProducts);
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editAssembledProductSchema),
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const [activeTab, setActiveTab] = useState<"basic" | "specs" | "components">(
    "basic",
  );

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        view3DUrl: product.view3DUrl || "",
        price: String(product.price || 0),
        description: product.description || "",
        quantity: String(product.quantity || 1),
        image1: product.image1 || "",
        image2: product.image2 || "",
        image3: product.image3 || "",
        layout: product.layout || "",
        mounting: product.mounting || "",
        pcb: product.pcb || "",
        connection: product.connection || "",
        battery: product.battery || "",
        details:
          product.details && product.details.length > 0
            ? product.details.map((d) => ({
                baseKitId: d.baseKitId || "",
                componentId: d.componentId || "",
                quantity: String(d.quantity || 1),
                soundUrl: d.soundUrl || "",
              }))
            : [
                {
                  baseKitId: "",
                  componentId: "",
                  quantity: "1",
                  soundUrl: "",
                },
              ],
      });
    }
  }, [product, reset]);

  // --- Submit ---
  const onSubmit = async (data: EditFormValues) => {
    if (!product) return;

    try {
      await dispatch(
        updateAssembledProduct({
          id: product.id,
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
      toast.success("Assembled product updated successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to update assembled product");
    }
  };

  const handleClose = () => {
    if (!updating) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Edit Assembled Product
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Update the assembled product details.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
            disabled={updating}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price (VND) *</label>
                  <input
                    type="number"
                    {...register("price")}
                    className={inputClass}
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
                    min={0}
                  />
                  {errors.quantity && (
                    <p className={errorClass}>{errors.quantity.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  {...register("description")}
                  className={`${inputClass} resize-none`}
                  rows={4}
                />
                {errors.description && (
                  <p className={errorClass}>{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700">Image URLs</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Image 1
                    </label>
                    <input
                      {...register("image1")}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Image 2
                    </label>
                    <input
                      {...register("image2")}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Image 3
                    </label>
                    <input
                      {...register("image3")}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>3D Model URL (.glb)</label>
                <input
                  {...register("view3DUrl")}
                  className={inputClass}
                  placeholder="https://...model.glb"
                />
              </div>
            </div>
          )}

          {/* Tab: Specifications */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm font-bold text-indigo-800 mb-3">
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
                <p className="text-sm font-bold text-gray-700">
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
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
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
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">
                        Component #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Base Kit *
                        </label>
                        <select
                          {...register(`details.${index}.baseKitId`)}
                          className={inputClass}
                        >
                          <option value="">— Select a kit —</option>
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Component *
                        </label>
                        <select
                          {...register(`details.${index}.componentId`)}
                          className={inputClass}
                        >
                          <option value="">— Select a component —</option>
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          {...register(`details.${index}.quantity`)}
                          className={inputClass}
                          min={1}
                        />
                        {errors.details?.[index]?.quantity && (
                          <p className={errorClass}>
                            {errors.details[index].quantity?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
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
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={updating}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
