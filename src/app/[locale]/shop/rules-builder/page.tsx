"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import RuleBuilderGuide from "@/src/components/Shop/RuleBuilder/RuleBuilderGuide";
import VisualRuleBuilder from "@/src/components/Shop/RuleBuilder/VisualRuleBuilder";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchParts } from "@/src/store/slices/partsSlice";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";
import { PartItem } from "@/src/types/part.types";
import { partService } from "@/src/services/part.service";
import api from "@/src/utils/api";

interface RulePayload {
  BaseKitId: string;
  ComponentId: string;
  StepName: string;
  StepOrder: number;
  IsDefault: boolean;
  Tags: string | null;
  NextStepFilterRule: string | null;
  LayerImageFile?: File | Blob | string;
}

interface PartsStateLike {
  loading?: boolean;
  error?: string | null;
  data?: {
    data?: PartItem[];
  };
  parts?: PartItem[];
}

// Resolved by api baseURL (/api/v1) to: /api/v1/Builder/options
const BUILDER_OPTIONS_ENDPOINT = "Builder/options";

function toFormData(payload: RulePayload): FormData {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    const value = payload[key as keyof RulePayload];

    if (value !== null && value !== undefined) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

export default function ShopRulesBuilderPage() {
  const t = useTranslations("ShopRulesBuilder");
  const dispatch = useAppDispatch();

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      const errorWithMessage = error as {
        message?: string;
        errors?: string;
      };

      return (
        errorWithMessage?.message ||
        errorWithMessage?.errors ||
        t("toastSaveError")
      );
    },
    [t],
  );

  const partsState = useAppSelector((state) => state.parts);
  const currentShopId = useAppSelector(
    (state) => state.shop.currentShop?.id ?? null,
  );
  const authShopId = useAppSelector(
    (state) => (state.auth.user as { shopId?: string } | null)?.shopId ?? null,
  );
  const placeholderShopId = process.env.NEXT_PUBLIC_DEFAULT_SHOP_ID ?? null;

  const shopId = currentShopId ?? authShopId ?? placeholderShopId;
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingConfig, setExistingConfig] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetCanvasKey, setResetCanvasKey] = useState(0);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const allParts = useMemo(() => {
    const normalized = partsState as unknown as PartsStateLike;
    const nestedParts = normalized.data?.data;

    if (Array.isArray(nestedParts)) {
      return nestedParts;
    }

    if (Array.isArray(normalized.parts)) {
      return normalized.parts;
    }

    return [] as PartItem[];
  }, [partsState]);

  const kits = useMemo(
    () => allParts.filter((part) => part.partType === "kit"),
    [allParts],
  );

  const selectedKit = useMemo(
    () => kits.find((kit) => kit.id === selectedKitId) ?? null,
    [kits, selectedKitId],
  );
  const baseKit = selectedKit;

  useEffect(() => {
    if (!currentShopId) {
      dispatch(fetchCurrentShop());
    }
  }, [currentShopId, dispatch]);

  useEffect(() => {
    if (shopId) {
      dispatch(fetchParts({ shopId, pageSize: 1000 }));
    }
  }, [dispatch, shopId]);

  useEffect(() => {
    if (selectedKitId && !kits.some((kit) => kit.id === selectedKitId)) {
      setSelectedKitId(null);
    }
  }, [kits, selectedKitId]);

  useEffect(() => {
    if (!selectedKit?.id) {
      setExistingConfig(null);
      return;
    }

    let isActive = true;

    const fetchConfig = async () => {
      try {
        const res = await partService.getKitConfig(selectedKit.id);

        if (!isActive) {
          return;
        }

        const directRes = res as {
          success?: boolean;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data?: any;
        };
        const nestedRes = res as {
          data?: {
            success?: boolean;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data?: any;
          };
        };

        if (directRes.success) {
          setExistingConfig(directRes.data ?? null);
          return;
        }

        if (nestedRes.data?.success) {
          setExistingConfig(nestedRes.data.data ?? null);
          return;
        }

        setExistingConfig(null);
      } catch (error) {
        console.error("Failed to fetch kit config", error);
        if (isActive) {
          setExistingConfig(null);
        }
      }
    };

    fetchConfig();

    return () => {
      isActive = false;
    };
  }, [selectedKit?.id]);

  const handleSaveRules = useCallback(
    async (payloads: RulePayload[]) => {
      if (!payloads.length) {
        toast.warning(t("toastNoRules"));
        return;
      }

      if (!selectedKit?.id) {
        toast.error(t("toastNoKit"));
        return;
      }

      setIsSaving(true);

      try {
        console.log(`Resetting rules for Kit: ${selectedKit.id}...`);
        await partService.resetKitOptions(selectedKit.id);

        for (const payload of payloads) {
          const formData = toFormData(payload);

          await api.post(BUILDER_OPTIONS_ENDPOINT, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        toast.success(t("toastSaveSuccess"));
      } catch (error) {
        console.error("Failed to save builder options", error);
        toast.error(getErrorMessage(error));
      } finally {
        setIsSaving(false);
      }
    },
    [getErrorMessage, selectedKit, t],
  );

  const executeResetRules = useCallback(async () => {
    setIsResetModalOpen(false);

    if (!baseKit?.id) {
      toast.error(t("toastNoKitReset"));
      return;
    }

    setIsResetting(true);

    try {
      await partService.resetKitOptions(baseKit.id);
      setExistingConfig(null);
      setResetCanvasKey((prev) => prev + 1);
      toast.success(t("toastResetSuccess"));
    } catch (error) {
      console.error("Lỗi khi reset:", error);
      toast.error(t("toastResetError"));
    } finally {
      setIsResetting(false);
    }
  }, [baseKit?.id, t]);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
        <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">{t("pageSubtitle")}</p>
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex max-w-xl flex-col gap-2">
            <label
              htmlFor="kit-selector"
              className="text-sm font-semibold text-neutral-800"
            >
              {t("kitSelectorLabel")}
            </label>
            <select
              id="kit-selector"
              value={selectedKitId ?? ""}
              onChange={(event) => setSelectedKitId(event.target.value || null)}
              disabled={partsState.loading || isSaving || isResetting}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
            >
              <option value="">{t("kitSelectorPlaceholder")}</option>
              {kits.map((kit) => (
                <option key={kit.id} value={kit.id}>
                  {kit.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              {t("kitCounter", {
                kitCount: kits.length,
                totalCount: allParts.length,
              })}
            </p>
          </div>
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
          {partsState.loading ? (
            <div className="flex h-[300px] items-center justify-center gap-3 text-neutral-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">{t("loadingParts")}</span>
            </div>
          ) : partsState.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {partsState.error}
            </div>
          ) : baseKit ? (
            <div
              className={`flex flex-col gap-6 ${isSaving ? "pointer-events-none opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <RuleBuilderGuide />
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  disabled={isResetting || isSaving}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResetting ? t("resetting") : t("resetButton")}
                </button>
              </div>

              <VisualRuleBuilder
                key={`${baseKit.id}-${resetCanvasKey}`}
                baseKit={baseKit}
                allParts={allParts}
                onSave={handleSaveRules}
                existingConfig={existingConfig}
              />

              {isSaving && (
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("savingRules")}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-center text-neutral-600">
              <Settings2 className="mb-3 h-8 w-8 text-neutral-400" />
              <p className="text-sm font-medium">{t("emptyState")}</p>
            </div>
          )}
        </section>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md animate-in zoom-in fade-in rounded-xl bg-white p-6 shadow-2xl duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                {t("modalTitle")}
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                {t("modalBody")} <strong>{t("modalBodyBold")}</strong>{" "}
                {t("modalBodySuffix")}
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {t("cancelButton")}
                </button>
                <button
                  onClick={executeResetRules}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  {t("confirmDeleteButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
