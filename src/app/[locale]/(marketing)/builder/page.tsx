"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  Suspense,
  useRef,
} from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchBaseKits,
  startBuilderSession,
  selectBuilderComponent,
  removeBuilderComponent,
  resetBuilder,
  setActiveStep,
  optimisticSelect,
  optimisticRemove,
  fetchAvailableAddons,
  addBuilderAddon,
  removeBuilderAddon,
} from "@/src/store/slices/builderSlice";
import { BuilderProduct, SelectedPart } from "@/src/types/builder";
import KeymapOverlay from "@/src/components/Builder/KeymapOverlay";
import { PartItem } from "@/src/types/part.types";
import { partService } from "@/src/services/part.service";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";
import { Logo } from "@/src/components/Header/Logo";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

// ─── HELPERS ────────────────────────────────────────────────────────────────
const getZIndex = (categorySlug?: string) => {
  if (!categorySlug) return 5;
  const map: Record<string, number> = {
    case: 10,
    pcb: 20,
    plate: 30,
    switch: 40,
    keycap: 50,
  };
  return map[categorySlug] || 5;
};

const formatKeycapPosition = (rawName: string, t: any) => {
  return rawName.replace(
    /\(Position:\s*R(\d+)-([^-]+)-\d+\)/g,
    (_, rowNum, keyName) => {
      return `(${t("position")}: ${keyName} - ${t("row")} ${rowNum})`;
    },
  );
};

const LAYER_ORDER = ["case", "pcb", "plate", "switch", "keycap"];

// Cutting-mat grid — shared between visualizer area and kit-select page
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundColor: "#f9f9f9", // neutral-50 matching theme
  backgroundImage: `
    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px",
};

// ─── VISUALIZER LAYER (Bulletproof Implementation) ────────────────────────
const VisualizerLayer = memo(
  ({
    slug,
    url,
    name,
    isHidden,
  }: {
    slug: string;
    url: string;
    name: string;
    isHidden: boolean;
  }) => {
    // State machine: loading -> loaded | error
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
      "loading",
    );
    const [showLoader, setShowLoader] = useState(false);

    // Internal crossfade state
    const [currentUrl, setCurrentUrl] = useState(url);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);

    // Pillar 1: URL Tracking (Anti-Race Condition)
    const activeUrlRef = useRef(url);

    // Handle URL changes
    useEffect(() => {
      if (url !== activeUrlRef.current) {
        setPrevUrl(activeUrlRef.current);
        setCurrentUrl(url);
        activeUrlRef.current = url;
        setStatus("loading");
        setShowLoader(false);
      }
    }, [url]);

    // Pillar 2 & 5: Timeout Safety Valve & Strict Cleanup
    useEffect(() => {
      if (status !== "loading") return;

      let isStale = false;

      // Delay loader by 300ms (Cache safety & anti-flash)
      const loaderTimer = setTimeout(() => {
        if (!isStale) setShowLoader(true);
      }, 300);

      // Safety valve: 10 seconds max loading time
      const safetyTimer = setTimeout(() => {
        if (!isStale) {
          console.warn(
            `[VisualizerLayer] Timeout loading image: ${activeUrlRef.current}`,
          );
          setStatus("error");
        }
      }, 10000);

      return () => {
        isStale = true;
        clearTimeout(loaderTimer);
        clearTimeout(safetyTimer);
      };
    }, [currentUrl, status]);

    // Clear prevUrl after crossfade finishes
    useEffect(() => {
      if (status === "loaded" || status === "error") {
        const timer = setTimeout(() => setPrevUrl(null), 500); // matches duration-500
        return () => clearTimeout(timer);
      }
    }, [status]);

    // Pillar 1 & 4: Safe Handlers
    const handleLoad = useCallback((loadedUrl: string) => {
      if (activeUrlRef.current === loadedUrl) {
        setStatus("loaded");
      }
    }, []);

    // Pillar 3: Error Handling
    const handleError = useCallback((failedUrl: string) => {
      if (activeUrlRef.current === failedUrl) {
        console.error(`[VisualizerLayer] Failed to load image: ${failedUrl}`);
        setStatus("error");
      }
    }, []);

    // If there's an error and no fallback image, we can just stay invisible
    const opacityClass = status === "loaded" ? "opacity-100" : "opacity-0";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: isHidden ? 0 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: getZIndex(slug) }}
      >
        {/* 3-dot wave loading animation */}
        {status === "loading" && showLoader && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <div
              className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}

        {/* Previous Image (Maintains view during crossfade) */}
        {prevUrl && (
          <Image
            src={prevUrl}
            alt={`${name} previous`}
            fill
            quality={100}
            className="object-contain drop-shadow-2xl"
            sizes="(max-width: 768px) 100vw, 65vw"
          />
        )}

        {/* Current Image */}
        {(status === "loading" || status === "loaded") && (
          <Image
            src={currentUrl}
            alt={name}
            fill
            quality={100}
            className={`object-contain drop-shadow-2xl transition-opacity duration-500 ease-out ${opacityClass}`}
            priority={slug === "case"}
            sizes="(max-width: 768px) 100vw, 65vw"
            onLoad={() => handleLoad(currentUrl)}
            onError={() => handleError(currentUrl)}
          />
        )}
      </motion.div>
    );
  },
);
VisualizerLayer.displayName = "VisualizerLayer";

// ─── VISUALIZER ─────────────────────────────────────────────────────────────
const Visualizer = memo(
  ({
    selection,
    viewMode,
    emptyText,
  }: {
    selection: Record<string, SelectedPart>;
    viewMode: "top" | "side" | "angled";
    emptyText: string;
  }) => {
    const hasAnySelection = Object.keys(selection).length > 0;
    const hasKeycap = !!selection["keycap"];

    const containerStyle: React.CSSProperties =
      viewMode === "angled"
        ? { transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }
        : viewMode === "side"
          ? { transform: "perspective(1200px) rotateY(-25deg)" }
          : {};

    return (
      <div className="relative w-[100%] h-[100%]" style={containerStyle}>
        {/* Layer stack with crossfade */}
        <AnimatePresence mode="popLayout">
          {LAYER_ORDER.map((slug) => {
            const part = selection[slug];
            if (!part) return null;
            return (
              <VisualizerLayer
                key={slug} // Using slug as key ensures internal crossfade logic handles updates
                slug={slug}
                url={part.layerImageUrl}
                name={part.name}
                isHidden={slug === "switch" && hasKeycap}
              />
            );
          })}
        </AnimatePresence>

        {/* Empty-state: Blueprint/Wireframe with pulse effect */}
        {!hasAnySelection && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center justify-center w-[65%] max-w-[600px] aspect-[2.5/1] border-[2px] border-dashed border-neutral-300 bg-white/40 backdrop-blur-sm rounded-2xl shadow-sm animate-pulse">
              <svg
                className="w-12 h-12 text-neutral-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm4 4h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M10 18h4"
                />
              </svg>
              <span className="text-neutral-700 text-[13px] tracking-[0.2em]">
                {emptyText}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  },
);
Visualizer.displayName = "Visualizer";

// ─── PRODUCT ITEM — Premium Circle with Framer Motion ───────────────────────
const ProductItem = memo(
  ({
    product,
    isSelected,
    isOutOfStock,
    onClick,
    onHover,
  }: {
    product: BuilderProduct;
    isSelected: boolean;
    isOutOfStock: boolean;
    onClick: (p: BuilderProduct) => void;
    onHover?: (p: BuilderProduct) => void;
  }) => {
    const t = useTranslations("BuilderPage");
    const [thumbLoaded, setThumbLoaded] = useState(false);

    return (
      <motion.div
        onClick={() => !isOutOfStock && onClick(product)}
        onMouseEnter={() => !isOutOfStock && onHover?.(product)}
        whileHover={!isOutOfStock ? { scale: 1.04 } : undefined}
        whileTap={!isOutOfStock ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group flex flex-col items-center gap-2.5 select-none ${
          isOutOfStock
            ? "opacity-40 cursor-not-allowed grayscale"
            : "cursor-pointer"
        }`}
      >
        {/* Circle */}
        <div
          className={`
            w-24 h-24 rounded-full relative overflow-hidden flex-shrink-0
            transition-all duration-200 ease-out flex items-center justify-center bg-white
            ${
              isSelected
                ? "border-[2.5px] border-amazon-focus shadow-lg ring-2 ring-amazon-focus/30 ring-offset-1"
                : "border border-amazon-border hover:border-neutral-400 hover:shadow-md shadow-sm"
            }
          `}
        >
          {/* Shimmer while thumbnail loads */}
          {!thumbLoaded && (
            <div className="absolute inset-2.5 rounded-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
          )}
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            className={`object-contain p-2.5 group-hover:scale-105 transition-all duration-200 ${
              thumbLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="96px"
            loading="lazy"
            onLoad={() => setThumbLoaded(true)}
          />
        </div>

        {/* Label */}
        <div className="text-center w-full px-0.5">
          <p
            className={`text-[11px] font-black uppercase tracking-wide leading-tight transition-colors ${
              isSelected
                ? "text-amazon-text"
                : "text-amazon-textMuted group-hover:text-amazon-text"
            }`}
          >
            {product.name}
          </p>
          {isOutOfStock ? (
            <p className="text-[11px] text-red-500 font-black mt-0.5 uppercase tracking-widest">
              {t("outOfStock")}
            </p>
          ) : (
            <p className="text-[11px] text-amazon-price font-bold mt-0.5">
              {product.price > 0
                ? `+${product.price.toLocaleString()}₫`
                : t("included")}
            </p>
          )}
        </div>
      </motion.div>
    );
  },
);
ProductItem.displayName = "ProductItem";

// ─── KIT CARD ───────────────────────────────────────────────────────────────
const KitCard = memo(
  ({ kit, onClick }: { kit: PartItem; onClick: (kit: PartItem) => void }) => {
    const t = useTranslations("BuilderPage");
    const specs = kit.specifications ? JSON.parse(kit.specifications) : null;

    return (
      <div
        onClick={() => onClick(kit)}
        className="group cursor-pointer border border-amazon-border bg-white rounded-sm p-5 hover:border-amazon-focus transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 shadow-sm"
      >
        <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden mb-5 border border-amazon-border bg-neutral-100">
          {kit.thumbnailUrl ? (
            <Image
              src={kit.thumbnailUrl}
              alt={kit.name}
              fill
              quality={90}
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-amazon-textMuted opacity-50">
              <span className="text-5xl">⌨️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>
        <h3 className="text-amazon-text font-black text-lg uppercase tracking-tight truncate mb-1">
          {kit.name}
        </h3>
        {kit.description && (
          <p className="text-amazon-textMuted text-xs mt-1 line-clamp-2 leading-relaxed font-medium">
            {kit.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-amazon-border">
          <span className="text-amazon-price font-black text-xl tracking-tight">
            {kit.price.toLocaleString()}₫
          </span>
          {specs?.workflow && (
            <span className="text-[10px] text-amazon-textMuted bg-neutral-100 uppercase font-bold px-2 py-1 rounded-sm border border-amazon-border">
              {t("steps", { n: specs.workflow.length })}
            </span>
          )}
        </div>
      </div>
    );
  },
);
KitCard.displayName = "KitCard";

// ─── MAIN BUILDER CONTENT ───────────────────────────────────────────────────
function BuilderContent() {
  const t = useTranslations("BuilderPage");
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [viewMode, setViewMode] = useState<"top" | "side" | "angled">("top");
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  const {
    loadingKits,
    processing,
    error,
    baseKits,
    session,
    workflowSteps,
    currentStepName,
    currentProducts,
    stepProducts,
    availableAddons,
    loadingAddons,
  } = useAppSelector((state) => state.builder);

  const shopId = searchParams.get("shopId");
  // ─── TÍNH TOÁN GIÁ TIỀN (Có khiên bảo vệ session) ───
  const baseKitPrice = session
    ? (baseKits.find((k) => k.id === session.kitId)?.price ?? 0)
    : 0;
  const addOnsTotal = session ? session.totalPrice - baseKitPrice : 0;
  const hasArtisanAddons = session
    ? Object.keys(session.selection).some(
        (step) => !workflowSteps.includes(step),
      )
    : false;
  // State 0: Fetch kits on mount when no session exists
  useEffect(() => {
    if (!session && shopId) {
      dispatch(fetchBaseKits(shopId));
    }
  }, [dispatch, session, shopId]);

  // Preload current step's layer images
  useEffect(() => {
    if (currentProducts.length > 0) {
      currentProducts.forEach((product) => {
        const img = new window.Image();
        img.src = product.layerImageUrl;
      });
    }
  }, [currentProducts]);

  // Preload NEXT step's thumbnails in the background
  useEffect(() => {
    if (!currentStepName || currentStepName === "summary") return;
    const idx = workflowSteps.indexOf(currentStepName);
    if (idx < 0 || idx >= workflowSteps.length - 1) return;
    const nextStepName = workflowSteps[idx + 1];
    const nextProducts = stepProducts[nextStepName];
    if (nextProducts) {
      nextProducts.forEach((p) => {
        const img = new window.Image();
        img.src = p.thumbnailUrl;
      });
    }
  }, [currentStepName, workflowSteps, stepProducts]);

  // Inventory Stock Validation
  useEffect(() => {
    if (currentProducts.length === 0) return;
    const ids = currentProducts.map((p) => p.partId);
    const fetchStock = async () => {
      try {
        const res = await partService.checkStock({ productIds: ids });
        if (res.success && res.data) {
          setStockMap(res.data);
        }
      } catch (error) {
        console.error("Stock check failed:", error);
      }
    };
    fetchStock();
  }, [currentProducts]);

  // ─── Post-Task Upsell Sequence ────────────────────────────────────────────
  useEffect(() => {
    // Sửa điều kiện: Chỉ hiện marketing khi ở summary VÀ CHƯA mua Artisan
    if (currentStepName === "summary" && !hasArtisanAddons) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowUpsell(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowSuccess(false);
      setShowUpsell(false);
    }
  }, [currentStepName, hasArtisanAddons]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectKit = useCallback(
    (kit: PartItem) => {
      dispatch(startBuilderSession(kit.id));
    },
    [dispatch],
  );

  const handleSelectComponent = useCallback(
    (product: BuilderProduct) => {
      if (!session || !currentStepName || processing) return;
      if (session.selection[currentStepName]?.id === product.partId) return;

      // Optimistic: apply instantly
      dispatch(optimisticSelect({ stepName: currentStepName, product }));

      // Fire API
      dispatch(
        selectBuilderComponent({
          sessionId: session.id,
          selectedPartId: product.partId,
          stepName: currentStepName,
        }),
      );
    },
    [dispatch, session, currentStepName, processing],
  );

  const handleRemoveComponent = useCallback(
    (stepName: string) => {
      if (!session || processing) return;

      // Optimistic: clear instantly
      dispatch(optimisticRemove(stepName));

      // Fire API
      dispatch(
        removeBuilderComponent({
          sessionId: session.id,
          stepName,
        }),
      );
    },
    [dispatch, session, processing],
  );

  // Hover preload: preload layerImageUrl so visualizer updates instantly on click
  const handleProductHover = useCallback((product: BuilderProduct) => {
    const img = new window.Image();
    img.src = product.layerImageUrl;
  }, []);

  const handleStepClick = useCallback(
    (stepSlug: string) => {
      if (processing || stepSlug === currentStepName) return;
      dispatch(setActiveStep(stepSlug));
    },
    [dispatch, processing, currentStepName],
  );

  const handleAddToCart = useCallback(async () => {
    if (!session || addingToCart) return;
    setAddingToCart(true);
    try {
      const res = await orderService.addToCart({
        productId: session.kitId,
        quantity: 1,
        isCustom: true,
        builderSessionId: session.id,
      });
      if (res.success) {
        toast.success(res.message || t("addToCartSuccess"));
        router.push("/cart");
      } else {
        toast.error(res.message || t("addToCartError"));
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || t("addToCartError"));
    } finally {
      setAddingToCart(false);
    }
  }, [session, addingToCart, router, t]);

  const handleResetClick = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    dispatch(resetBuilder());
    setShowResetModal(false);
  }, [dispatch]);

  const handleLogoClick = useCallback(() => {
    window.location.href = "/";
  }, []);

  // ─── Addon Handlers ───────────────────────────────────────────────────────
  const handleFetchAddons = useCallback(() => {
    if (!session?.id) return;
    dispatch(fetchAvailableAddons(session.id));
  }, [dispatch, session]);

  const handleAddonSelected = useCallback(
    (position: string, partId: string) => {
      if (!session) return;
      dispatch(
        addBuilderAddon({
          sessionId: session.id,
          items: [
            {
              componentId: partId,
              quantity: 1,
              positionNote: position,
            },
          ],
        }),
      );
    },
    [dispatch, session],
  );

  const handleAddonRemoved = useCallback(
    (componentId: string) => {
      if (!session) return;
      dispatch(removeBuilderAddon({ sessionId: session.id, componentId }));
    },
    [dispatch, session],
  );

  // Navigation items for progress bar (+ virtual Summary step)
  const navItems = useMemo(() => {
    const steps = workflowSteps.map((stepName, index) => ({
      name: stepName,
      slug: stepName,
      index: index + 1,
      isActive: currentStepName === stepName,
      isCompleted: session?.selection ? !!session.selection[stepName] : false,
    }));

    // Virtual Summary step — appears at the end of the nav bar
    steps.push({
      name: t("buildSummary"),
      slug: "summary",
      index: workflowSteps.length + 1,
      isActive: currentStepName === "summary",
      isCompleted: false,
    });

    return steps;
  }, [workflowSteps, currentStepName, session, t]);

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s === currentStepName,
  );

  // NEXT: advance to next step or summary
  const handleNextStep = useCallback(() => {
    if (!session || processing) return;
    if (currentStepName === "summary") {
      handleAddToCart();
      return;
    }

    if (!session.selection[currentStepName || ""]) {
      toast.warning(t("selectComponentWarning"));
      return;
    }

    const idx = workflowSteps.indexOf(currentStepName || "");
    if (idx >= 0 && idx < workflowSteps.length - 1) {
      dispatch(setActiveStep(workflowSteps[idx + 1]));
    } else {
      dispatch(setActiveStep("summary"));
    }
  }, [
    session,
    processing,
    currentStepName,
    workflowSteps,
    dispatch,
    handleAddToCart,
    t,
  ]);

  // BACK: go to previous step or reset to kit selection
  const handleBackStep = useCallback(() => {
    if (!session || processing) return;
    if (currentStepName === "summary") {
      const lastStep = workflowSteps[workflowSteps.length - 1];
      dispatch(setActiveStep(lastStep));
      return;
    }
    const idx = workflowSteps.indexOf(currentStepName || "");
    if (idx <= 0) {
      handleResetClick();
    } else {
      dispatch(setActiveStep(workflowSteps[idx - 1]));
    }
  }, [
    session,
    processing,
    currentStepName,
    workflowSteps,
    dispatch,
    handleResetClick,
  ]);

  // =============================================
  // STATE 0: Kit Selection (no session)
  // =============================================
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col text-amazon-text bg-amazon-bgSecondary">
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-6 lg:px-10 z-50 shrink-0 bg-white border-b border-amazon-border shadow-sm">
          <div
            onClick={handleLogoClick}
            className="flex flex-col cursor-pointer select-none"
          >
            <div className="brightness-0 invert-0">
              <Logo />
            </div>
          </div>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-amazon-textMuted">
            {t("keyboardBuilder")}
          </h1>
          <div />
        </div>

        {/* KIT GRID */}
        <div
          className="flex-1 overflow-y-auto p-8 lg:p-4"
          style={GRID_BG_STYLE}
        >
          {loadingKits ? (
            <div className="flex items-center justify-center h-[50vh]">
              <div className="animate-spin w-10 h-10 border-4 border-amazon-border border-t-amazon-btnSecondary rounded-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
              <p className="text-red-500 font-bold">{error}</p>
              <button
                onClick={() => shopId && dispatch(fetchBaseKits(shopId))}
                className="px-6 py-2 bg-amazon-btnPrimary text-amazon-text font-black uppercase tracking-widest shadow-sm rounded-sm hover:brightness-95 transition-all text-sm"
              >
                {t("retry")}
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto py-4">
              <div className="text-center mb-12">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amazon-textMuted mb-3">
                  Ameko Custom Lab
                </p>
                <h2 className="text-4xl lg:text-5xl font-black text-amazon-text uppercase tracking-tight">
                  {t("chooseYourKit")}
                </h2>
                <p className="text-amazon-textMuted font-bold mt-4 text-sm max-w-md mx-auto leading-relaxed">
                  {t("chooseKitSubtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {baseKits.map((kit) => (
                  <KitCard key={kit.id} kit={kit} onClick={handleSelectKit} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================
  // STATE 1: Builder Workspace — Corsair layout
  // =============================================

  // Kit display name for sidebar header
  const kitDisplayName = t("kitDisplayName");

  // Pricing breakdown for summary
  // const baseKitPrice = baseKits.find((k) => k.id === session.kitId)?.price ?? 0;
  // const addOnsTotal = session.totalPrice - baseKitPrice;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden text-amazon-text bg-amazon-bgSecondary">
      {/* ═══════════════════════════════════════
          HEADER — Corsair style
      ═══════════════════════════════════════ */}
      <div className="h-16 flex items-center z-50 shrink-0 px-4 gap-0 bg-white border-b border-amazon-border shadow-sm">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-1.5 text-amazon-link text-[11px] font-black uppercase tracking-widest hover:underline transition-colors shrink-0 mr-6"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("exitLab")}
        </button>

        <div className="flex flex-col shrink-0 mr-8 select-none">
          <div className="brightness-0 invert-0">
            <Logo />
          </div>
        </div>

        {/* Step nav — Corsair: name only, white underline active */}
        <div
          className="flex-1 flex items-center h-full overflow-x-auto overscroll-contain scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {navItems.map((step) => {
            const isSummary = step.slug === "summary";
            const isClickable =
              !step.isActive &&
              !processing &&
              (step.isCompleted || (isSummary && !!session?.isComplete));

            return (
              <button
                key={step.slug}
                onClick={() => isClickable && handleStepClick(step.slug)}
                className={`
                  relative h-full px-4 lg:px-5 flex items-center font-black text-[11px] uppercase tracking-[0.15em]
                  transition-colors whitespace-nowrap shrink-0
                  ${
                    step.isActive
                      ? "text-amazon-text border-b border-amazon-text cursor-default"
                      : isClickable
                        ? "text-amazon-textMuted border-b border-transparent cursor-pointer hover:text-amazon-link hover:underline"
                        : "text-gray-300 border-b border-transparent cursor-not-allowed"
                  }
                `}
              >
                {isSummary ? step.name : `${step.index}. ${step.name}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* ── LEFT: VISUALIZER ── */}
        <div
          className="h-[45vh] shrink-0 lg:h-auto lg:shrink lg:flex-[62] relative flex flex-col items-center justify-center overflow-hidden"
          style={GRID_BG_STYLE}
        >
          {/* Radial vignette removed for light theme since we just want clean minimal white grid */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)",
              backgroundImage:
                "url('https://res.cloudinary.com/doezwafgz/image/upload/v1766677524/background_teui0y.png')",
              backgroundColor: "#1a1a1a",
              backgroundSize: "cover",
            }}
          />

          {/* ─── LAYER 1 (z-10): 2D Visualizer centered in 16:9 ─── */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-5xl aspect-[16/9] flex items-center justify-center">
              <Visualizer
                selection={session.selection}
                viewMode={viewMode}
                emptyText={t("emptyVisualizer", {
                  step: currentStepName || "CASE",
                })}
              />
            </div>
          </div>

          {/* ─── LAYER 2 (z-20): Full-bleed blur overlay ─── */}
          <AnimatePresence>
            {viewMode === "top" &&
              session.selection["keycap"] &&
              isCustomizeMode && (
                <motion.div
                  key="customize-blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 z-20 pointer-events-none bg-black/50 backdrop-blur-md"
                />
              )}
          </AnimatePresence>

          {/* ─── LAYER 3 (z-30): KeymapOverlay on top of blur ─── */}
          {viewMode === "top" &&
            session.selection["keycap"] &&
            isCustomizeMode && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="relative w-full max-w-5xl aspect-[16/9]">
                  <KeymapOverlay
                    onAddonSelected={handleAddonSelected}
                    onAddonRemoved={handleAddonRemoved}
                    selectedAddons={session.selection}
                    availableAddons={availableAddons}
                    isLoadingAddons={loadingAddons}
                    fetchAddons={handleFetchAddons}
                    isProcessing={processing}
                  />
                </div>
              </div>
            )}

          {/* View toggle — bottom-left */}
          <div className="absolute bottom-6 left-6 z-[60] flex gap-2">
            {(["top", "side", "angled"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (mode !== "top") setIsCustomizeMode(false);
                }}
                className={`
                  px-4 py-2 font-black shadow-sm uppercase text-[10px] tracking-widest transition-all rounded-sm border
                  ${
                    viewMode === mode
                      ? "bg-amazon-btnSecondary text-amazon-text border-amazon-border"
                      : "bg-white text-amazon-textMuted hover:text-amazon-text border-amazon-border hover:bg-neutral-50"
                  }
                `}
              >
                {
                  {
                    top: t("viewTop"),
                    side: t("viewSide"),
                    angled: t("viewAngled"),
                  }[mode]
                }
              </button>
            ))}

            {/* Customize toggle — only in top view with keycap selected */}
            {viewMode === "top" && session.selection["keycap"] && (
              <button
                onClick={() => setIsCustomizeMode((prev) => !prev)}
                className={`
                  px-4 py-2 font-black shadow-sm uppercase text-[10px] tracking-widest transition-all rounded-sm border flex items-center gap-1.5
                  ${
                    isCustomizeMode
                      ? "bg-orange-400 text-white border-orange-500 shadow-md"
                      : "bg-white text-amazon-textMuted hover:text-amazon-text border-amazon-border hover:bg-neutral-50"
                  }
                `}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {t("customize")}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: CONFIGURATOR / SUMMARY ── */}
        <div className="flex flex-1 lg:flex-[38] flex-col min-h-0 z-10 bg-white border-t lg:border-t-0 border-l-0 lg:border-l border-amazon-border shadow-2xl">
          {currentStepName === "summary" ? (
            /* ─────────────────────────────────────
               SUMMARY VIEW
            ───────────────────────────────────── */
            <>
              {/* Header */}
              <div className="px-7 pt-4 pb-2 shrink-0 border-b border-amazon-border">
                <p className="text-[9px] text-amazon-textMuted uppercase font-bold tracking-[0.3em] mb-1">
                  {kitDisplayName}
                </p>
                <h2 className="text-2xl font-bold uppercase text-amazon-btnSecondary">
                  {t("buildSummary")}
                </h2>
              </div>

              {/* BOM list */}
              <div
                className="flex-1 h-full overflow-y-auto overscroll-contain scroll-smooth scrollbar-hide px-5 py-4 bg-neutral-50"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="flex flex-col space-y-2">
                  {Object.entries(session.selection).map(([stepName, part]) => (
                    <div
                      key={stepName}
                      className="flex items-center gap-3 p-3 cursor-pointer transition-all group/bom shrink-0"
                      onClick={() => handleStepClick(stepName)}
                      title={t("editStep", { stepName })}
                    >
                      <div className="w-14 h-14 relative shrink-0 overflow-hidden bg-neutral-100 rounded border border-amazon-border">
                        <Image
                          src={part.thumbnailUrl}
                          alt={part.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-amazon-textMuted uppercase font-bold tracking-[0.2em]">
                          {stepName}
                        </div>
                        <h4 className="text-amazon-text font-black tracking-wide text-[13px] truncate">
                          {formatKeycapPosition(part.name, t)}
                        </h4>
                        <div className="text-amazon-price text-[11px] font-bold">
                          <span className="text-amazon-textMuted mr-1">
                            ×{part.quantity} —
                          </span>
                          {part.price > 0
                            ? `+${(part.price * part.quantity).toLocaleString()}₫`
                            : t("included")}
                        </div>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 text-amazon-textMuted shrink-0 group-hover/bom:text-amazon-link transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* ── Post-Task Upsell Block ── */}
                <div className="mt-4 flex flex-col items-center">
                  {/* Step 1: Success Message */}
                  <div
                    className={`transition-all duration-700 ease-out overflow-hidden ${showSuccess ? "max-h-20 opacity-100 mb-4" : "max-h-0 opacity-0"}`}
                  >
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                      {t("configComplete")}
                    </div>
                  </div>

                  {/* Step 2: The Upsell Button with Animated Arrow */}
                  <div
                    className={`transition-all duration-700 ease-out flex flex-col items-center w-full ${showUpsell ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                  >
                    {/* Bouncing Arrow Pointing Down */}
                    <div className="animate-bounce text-orange-500 mb-1">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>

                    {/* The Button */}
                    <button
                      onClick={() => {
                        setViewMode("top");
                        setIsCustomizeMode(true);
                      }}
                      className="w-full relative overflow-hidden group bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black text-[12px] tracking-widest py-3.5 rounded-sm shadow-[0_4px_15px_rgba(249,115,22,0.4)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.6)] transition-all active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        {t("createHighlight")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer — Subtotal breakdown + BACK / ADD TO CART */}
              <div className="shrink-0 px-7 py-6 bg-white border-t border-amazon-border">
                {/* Breakdown */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-amazon-text font-bold">
                    <span className="uppercase tracking-wider text-amazon-textMuted">
                      {t("baseKit")}
                    </span>
                    <span>
                      {baseKitPrice > 0
                        ? `${baseKitPrice.toLocaleString()}₫`
                        : t("included")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-amazon-text font-bold">
                    <span className="uppercase tracking-wider text-amazon-textMuted">
                      {t("addOns")}
                    </span>
                    <span>
                      +{addOnsTotal > 0 ? addOnsTotal.toLocaleString() : "0"}₫
                    </span>
                  </div>
                  <div className="my-2 border-t border-amazon-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-[0.25em] text-amazon-textMuted">
                      {t("subtotal")}
                    </span>
                    <span className="text-amazon-price font-black text-2xl tracking-tight">
                      {session.totalPrice.toLocaleString()}₫
                    </span>
                  </div>
                </div>

                {/* BACK + ADD TO CART */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleStepClick(workflowSteps[workflowSteps.length - 1])
                    }
                    className="flex-1 py-3 font-black uppercase tracking-widest text-[11px] text-amazon-text bg-white border border-amazon-border transition-all hover:bg-neutral-50 shadow-sm rounded-sm active:scale-[0.98]"
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-[2] py-3 bg-amazon-btnPrimary text-amazon-text font-black rounded-sm shadow-sm uppercase tracking-widest text-[11px] hover:brightness-95 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amazon-text/30 border-t-amazon-text rounded-full animate-spin" />
                        {t("adding")}
                      </>
                    ) : (
                      t("addToCart")
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ─────────────────────────────────────
               STEP CONFIGURATOR VIEW
            ───────────────────────────────────── */
            <>
              {/* Step Header */}
              <div className="px-7 pt-7 pb-5 shrink-0 border-b border-amazon-border">
                <p className="text-[9px] text-amazon-textMuted uppercase font-bold tracking-[0.3em] mb-1">
                  {kitDisplayName}
                </p>
                <h2 className="text-4xl font-black uppercase text-amazon-link tracking-tight">
                  {currentStepName || t("selectComponent")}
                </h2>

                {/* Help me choose */}
                <div className="relative group inline-block mt-3">
                  <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amazon-link px-4 py-1.5 rounded-sm transition-all hover:bg-neutral-50 border border-amazon-border shadow-sm">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("helpMeChoose")}
                  </button>

                  {/* Dynamic Tooltip Popover */}
                  {(currentStepName === "switch" ||
                    currentStepName === "plate" ||
                    currentStepName === "keycap") && (
                    <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-neutral-900/95 backdrop-blur-md rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] border border-neutral-700 pointer-events-none">
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-neutral-900/95 border-t border-l border-neutral-700 rotate-45" />
                      <div className="relative z-10 flex flex-col gap-2.5 text-left">
                        {currentStepName === "switch" && (
                          <>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🔴 {t("help.switch.linear.title")}{" "}
                                {/* Linear */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.switch.linear.desc")}{" "}
                                {/* Smooth and quiet. Perfect for office use or fast gaming. */}
                              </span>
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🟤 {t("help.switch.tactile.title")}{" "}
                                {/* Tactile */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.switch.tactile.desc")}{" "}
                                {/* Has a tactile bump. Great for typing and coding. */}
                              </span>
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🔵 {t("help.switch.clicky.title")}{" "}
                                {/* Clicky */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.switch.clicky.desc")}{" "}
                                {/* Loud and clicky sound. Fun to type, but not for quiet offices! */}
                              </span>
                            </p>
                          </>
                        )}
                        {currentStepName === "plate" && (
                          <>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🛡️ {t("help.plate.alu.title")} {/* Aluminum */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.plate.alu.desc")}{" "}
                                {/* Stiff and clacky. The safe, standard choice. */}
                              </span>
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🧊 {t("help.plate.pc.title")}{" "}
                                {/* PC (Polycarbonate) */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.plate.pc.desc")}{" "}
                                {/* Flexible and thocky (deep sound). */}
                              </span>
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                ⚡ {t("help.plate.fr4.title")} {/* FR4 */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.plate.fr4.desc")}{" "}
                                {/* Balanced stiffness and sound. */}
                              </span>
                            </p>
                          </>
                        )}
                        {currentStepName === "keycap" && (
                          <>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🍒 {t("help.keycap.cherry.title")}{" "}
                                {/* Cherry */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.keycap.cherry.desc")}{" "}
                                {/* Standard, comfortable height for daily typing. */}
                              </span>
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🏢 {t("help.keycap.oem.title")} {/* OEM */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.keycap.oem.desc")}{" "}
                                {/* Slightly taller, common on pre-built keyboards. */}
                              </span>
                            </p>
                            <p className="text-[11px] leading-relaxed">
                              <span className="text-white font-bold block mb-0.5">
                                🗼 {t("help.keycap.sa.title")} {/* SA */}:
                              </span>{" "}
                              <span className="text-neutral-300">
                                {t("help.keycap.sa.desc")}{" "}
                                {/* Very tall, vintage look, loud sound. */}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product grid — 3 circles per row */}
              <div
                className="flex-1 h-full overflow-y-auto overscroll-contain scroll-smooth scrollbar-hide px-6 py-6 bg-neutral-50"
                style={{ scrollbarWidth: "none" }}
              >
                {processing && currentProducts.length === 0 ? (
                  /* Shimmer skeleton grid while loading */
                  <div className="grid grid-cols-3 gap-x-4 gap-y-7">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2.5"
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
                        <div className="w-16 h-3 rounded bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
                        <div className="w-10 h-2.5 rounded bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    key={currentStepName}
                    className="grid grid-cols-3 gap-x-4 gap-y-7 animate-fadeIn"
                  >
                    {currentProducts.map((product) => {
                      const isOutOfStock =
                        stockMap[product.partId] !== undefined &&
                        stockMap[product.partId] <= 0;
                      return (
                        <ProductItem
                          key={product.optionId}
                          product={product}
                          isSelected={
                            session.selection[currentStepName || ""]?.id ===
                            product.partId
                          }
                          isOutOfStock={isOutOfStock}
                          onClick={handleSelectComponent}
                          onHover={handleProductHover}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer — Subtotal + BACK / NEXT */}
              <div className="shrink-0 px-7 py-5 bg-white border-t border-amazon-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-black tracking-[0.25em] text-amazon-textMuted">
                    {t("subtotal")}
                  </span>
                  <span className="text-amazon-price font-black text-2xl tracking-tight">
                    {session.totalPrice.toLocaleString()}₫
                  </span>
                </div>

                {/* BACK + NEXT — half-width, sharp corners */}
                <div className="flex gap-2">
                  <button
                    onClick={handleBackStep}
                    disabled={processing}
                    className="flex-1 py-3 font-black uppercase tracking-widest text-[11px] text-amazon-text bg-white border border-amazon-border transition-all hover:bg-neutral-50 shadow-sm rounded-sm active:scale-[0.98] disabled:opacity-40"
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={
                      processing || !session.selection[currentStepName || ""]
                    }
                    className="flex-1 py-3 bg-amazon-btnPrimary text-amazon-text font-black rounded-sm shadow-sm uppercase tracking-widest text-[11px] hover:brightness-95 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amazon-text/30 border-t-amazon-text rounded-full animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      t("next")
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── CUSTOM RESET CONFIRM MODAL ─── */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="px-6 py-4 border-b border-amazon-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-amazon-text font-black text-lg tracking-tight uppercase">
                  {t("resetConfirmTitle") || "Reset Configuration?"}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 bg-neutral-50">
              <p className="text-sm text-amazon-textMuted font-medium leading-relaxed">
                {t("resetConfirm")}
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-white border-t border-amazon-border flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-white border border-amazon-border text-amazon-text text-xs font-black uppercase tracking-widest rounded-sm hover:bg-neutral-50 transition-colors active:scale-[0.98]"
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-sm hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]"
              >
                {t("confirm") || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT (Suspense boundary for useSearchParams) ────────────────────
export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-amazon-bgSecondary text-amazon-text">
          <div className="animate-spin w-10 h-10 border-4 border-amazon-border border-t-amazon-btnSecondary rounded-full" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
