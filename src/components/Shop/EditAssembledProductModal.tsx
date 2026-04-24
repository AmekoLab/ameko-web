"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Box,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateAssembledProduct } from "@/src/store/slices/assembledProductsSlice";
import { fetchParts } from "@/src/store/slices/partsSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";
import { PartItem } from "@/src/types/part.types";
import { toast } from "react-toastify";
import { uploadImage } from "@/src/utils/uploadImage";
import { uploadGlb } from "@/src/utils/uploadGlb";

// --- ZOD SCHEMA ---
const detailSchema = (t: (key: string) => string) =>
  z.object({
    id: z.string().optional(),
    baseKitId: z.string().min(1, t("validationBaseKitRequired")),
    componentId: z.string().min(1, t("validationComponentRequired")),
    quantity: z.string().min(1, t("validationQuantityRequired")),
    soundUrl: z.string().optional(),
  });

const editAssembledProductSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validationProductNameRequired"))
      .max(200, t("validationProductNameMax")),
    view3DUrl: z.string().optional(),
    price: z.string().min(1, t("validationPriceRequired")),
    description: z
      .string()
      .min(1, t("validationDescriptionRequired"))
      .max(2000, t("validationDescriptionMax")),
    quantity: z.string().min(1, t("validationQuantityRequired")),
    image1: z.string().optional(),
    image2: z.string().optional(),
    image3: z.string().optional(),
    layout: z.string().optional(),
    mounting: z.string().optional(),
    pcb: z.string().optional(),
    connection: z.string().optional(),
    battery: z.string().optional(),
    details: z
      .array(detailSchema(t))
      .min(1, t("validationAtLeastOneComponent")),
  });

type EditFormValues = z.infer<ReturnType<typeof editAssembledProductSchema>>;

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
  const t = useTranslations("EditAssembledProductModal");
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.assembledProducts);
  const { currentShop } = useAppSelector((state) => state.shop);
  const { parts } = useAppSelector((state) => state.parts);
  const schema = useMemo(() => editAssembledProductSchema(t), [t]);

  // Fetch shop & parts when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!currentShop) dispatch(fetchCurrentShop());
    }
  }, [isOpen, currentShop, dispatch]);

  useEffect(() => {
    if (isOpen && currentShop?.id) {
      dispatch(fetchParts({ shopId: currentShop.id, pageSize: 1000 }));
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
  } = useForm<EditFormValues>({
    resolver: zodResolver(schema),
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
        { id: "", baseKitId: "", componentId: "", quantity: "1", soundUrl: "" },
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
        toast.error(t("imageUploadFailed"));
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
                id: d.id || "",
                baseKitId: d.baseKitId || "",
                componentId: d.componentId || "",
                quantity: String(d.quantity || 1),
                soundUrl: d.soundUrl || "",
              }))
            : [
                {
                  id: "",
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
            id: d.id,
            baseKitId: d.baseKitId,
            componentId: d.componentId,
            quantity: Number(d.quantity),
            soundUrl: d.soundUrl || "",
          })),
        }),
      ).unwrap();
      toast.success(t("updatedSuccess"));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as string) || t("updateFailed"));
    }
  };

  const handleClose = () => {
    if (!updating) {
      if (fileRef1.current) fileRef1.current.value = "";
      if (fileRef2.current) fileRef2.current.value = "";
      if (fileRef3.current) fileRef3.current.value = "";
      if (fileRef3D.current) fileRef3D.current.value = "";
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const inputClass =
    "w-full px-3 py-2 border border-amazon-border rounded-sm text-[13px] font-medium text-amazon-text focus:outline-none focus:ring-1 focus:ring-amazon-btnPrimary focus:border-amazon-btnPrimary transition placeholder:text-neutral-400";
  const labelClass = "block text-[13px] font-medium text-amazon-text mb-1";
  const errorClass = "text-[11px] font-medium text-red-500 mt-1";

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  const tabs = [
    { key: "basic" as const, label: t("tabBasicInfo") },
    { key: "specs" as const, label: t("tabSpecifications") },
    { key: "components" as const, label: t("tabComponents") },
  ];

  const imageFields = [
    {
      label: t("image1"),
      field: "image1" as const,
      ref: fileRef1,
      isUploading: isUploading1,
      setUploading: setIsUploading1,
      watched: watchedImage1,
    },
    {
      label: t("image2"),
      field: "image2" as const,
      ref: fileRef2,
      isUploading: isUploading2,
      setUploading: setIsUploading2,
      watched: watchedImage2,
    },
    {
      label: t("image3"),
      field: "image3" as const,
      ref: fileRef3,
      isUploading: isUploading3,
      setUploading: setIsUploading3,
      watched: watchedImage3,
    },
  ];

  const getPartTypeLabel = (type: string) => {
    if (type === "kit") return t("typeKit");
    if (type === "component") return t("typeComponent");
    if (type === "accessory") return t("typeAccessory");
    return type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-amazon-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amazon-border">
          <div>
            <h2 className="text-lg font-bold text-amazon-text">{t("title")}</h2>
            <p className="text-[12px] text-amazon-textMuted mt-0.5">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm hover:bg-neutral-50 transition"
            disabled={updating}
          >
            <X className="w-5 h-5 text-amazon-textMuted hover:text-amazon-text" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amazon-border px-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition -mb-px ${
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
              <div>
                <label className={labelClass}>{t("productName")} *</label>
                <input
                  {...register("name")}
                  className={inputClass}
                  placeholder={t("productNamePlaceholder")}
                />
                {errors.name && (
                  <p className={errorClass}>{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("price")} *</label>
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
                  <label className={labelClass}>{t("quantity")} *</label>
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
                <label className={labelClass}>{t("description")} *</label>
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
                <p className="text-[14px] font-bold text-amazon-text">
                  {t("productImages")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {imageFields.map(
                    ({
                      label,
                      field,
                      ref,
                      isUploading,
                      setUploading,
                      watched,
                    }) => (
                      <div key={field}>
                        <label className="block text-[12px] font-medium text-amazon-textMuted mb-2">
                          {label}
                        </label>
                        {/* Hidden file input */}
                        <input
                          ref={ref}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={makeFileChangeHandler(
                            field,
                            setUploading,
                            ref,
                          )}
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
                              onClick={() =>
                                setValue(field, "", { shouldValidate: true })
                              }
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
                            <span className="text-[12px] font-medium">
                              {isUploading
                                ? t("uploading")
                                : t("clickToUpload")}
                            </span>
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t("model3d")}</label>
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
                      toast.error(t("modelUploadFailed"));
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
                      <span className="text-[12px] font-medium text-emerald-700">
                        {t("modelUploaded")}
                      </span>
                      <span className="text-[12px] text-emerald-600 truncate max-w-[200px]">
                        {watchedView3D.split("/").pop()}
                      </span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <button
                      type="button"
                      onClick={() =>
                        setValue("view3DUrl", "", { shouldValidate: true })
                      }
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
                    <span className="text-[12px] font-medium">
                      {isUploading3D ? t("uploading") : t("clickToUploadGlb")}
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
                <p className="text-[13px] font-bold text-indigo-800 mb-4">
                  {t("keyboardSpecifications")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t("layout")}</label>
                    <input
                      {...register("layout")}
                      className={inputClass}
                      placeholder={t("layoutPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("mounting")}</label>
                    <input
                      {...register("mounting")}
                      className={inputClass}
                      placeholder={t("mountingPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("pcb")}</label>
                    <input
                      {...register("pcb")}
                      className={inputClass}
                      placeholder={t("pcbPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("connection")}</label>
                    <input
                      {...register("connection")}
                      className={inputClass}
                      placeholder={t("connectionPlaceholder")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{t("battery")}</label>
                    <input
                      {...register("battery")}
                      className={inputClass}
                      placeholder={t("batteryPlaceholder")}
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
                <p className="text-[14px] font-bold text-amazon-text">
                  {t("componentDetails", { count: fields.length })}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      id: "",
                      baseKitId: "",
                      componentId: "",
                      quantity: "1",
                      soundUrl: "",
                    })
                  }
                  className="px-3 py-1.5 text-[12px] font-medium text-amazon-text bg-amazon-bgSecondary border border-amazon-btnPrimary/20 rounded-sm hover:bg-amazon-btnPrimary/20 transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  {t("addComponent")}
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
                    <input type="hidden" {...register(`details.${index}.id`)} />
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-amazon-textMuted">
                        {t("componentIndex", { index: index + 1 })}
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
                        <label className="block text-[13px] font-medium text-amazon-text mb-1">
                          {t("baseKit")} *
                        </label>
                        <select
                          {...register(`details.${index}.baseKitId`)}
                          className={inputClass}
                        >
                          <option value="">{t("selectKit")}</option>
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
                        <label className="block text-[13px] font-medium text-amazon-text mb-1">
                          {t("component")} *
                        </label>
                        <select
                          {...register(`details.${index}.componentId`)}
                          className={inputClass}
                        >
                          <option value="">{t("selectComponent")}</option>
                          {Object.entries(partsByType).map(([type, items]) => (
                            <optgroup key={type} label={getPartTypeLabel(type)}>
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
                        <label className="block text-[13px] font-medium text-amazon-text mb-1">
                          {t("quantity")} *
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
                        <label className="block text-[13px] font-medium text-amazon-text mb-1">
                          {t("soundUrl")}
                        </label>
                        <input
                          {...register(`details.${index}.soundUrl`)}
                          className={inputClass}
                          placeholder={t("soundUrlPlaceholder")}
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
              disabled={updating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-textMuted bg-white border border-amazon-border rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition disabled:opacity-50 shadow-sm"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 text-[13px] font-medium text-amazon-text bg-amazon-btnPrimary border border-amazon-border rounded-sm hover:brightness-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {updating && (
                <Loader2 className="w-4 h-4 animate-spin text-amazon-text" />
              )}
              {updating ? t("updating") : t("updateProduct")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
