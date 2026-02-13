"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  Suspense,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
} from "@/src/store/slices/builderSlice";
import { BuilderProduct, SelectedPart } from "@/src/types/builder";
import { PartItem } from "@/src/types/part.types";

// --- HELPERS ---
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

// --- LAYER ORDER (bottom → top) ---
const LAYER_ORDER = ["case", "pcb", "plate", "switch", "keycap"];

// --- Visualizer (layer stacking with silent preload + crossfade) ---
const Visualizer = memo(
  ({ selection }: { selection: Record<string, SelectedPart> }) => {
    const hasAnySelection = Object.keys(selection).length > 0;

    // For each layer slot, keep the *displayed* image URL in local state.
    // When selection changes we preload silently, then swap — old image stays
    // visible the entire time, preventing flashes / blank frames.
    const [displayed, setDisplayed] = useState<
      Record<string, { url: string; name: string }>
    >({});

    useEffect(() => {
      let cancelled = false;

      LAYER_ORDER.forEach((slug) => {
        const part = selection[slug];

        if (!part) {
          // Part removed — clear immediately
          setDisplayed((prev) => {
            if (!prev[slug]) return prev;
            const next = { ...prev };
            delete next[slug];
            return next;
          });
          return;
        }

        // Already showing this exact URL — nothing to do
        setDisplayed((prev) => {
          if (prev[slug]?.url === part.layerImageUrl) return prev;
          // Silently preload in the background
          const img = new window.Image();
          img.src = part.layerImageUrl;
          img.onload = () => {
            if (cancelled) return;
            setDisplayed((p) => ({
              ...p,
              [slug]: { url: part.layerImageUrl, name: part.name },
            }));
          };
          return prev; // keep old image visible while loading
        });
      });

      return () => {
        cancelled = true;
      };
    }, [selection]);

    const hasKeycap = !!displayed["keycap"];

    return (
      <div className="relative w-full max-w-[1000px] aspect-[4/3] lg:aspect-video">
        {/* Placeholder when empty */}
        {!hasAnySelection && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0">
            <span className="text-4xl opacity-20 mb-2">⌨️</span>
            <p className="text-sm font-medium opacity-50">Chưa có linh kiện</p>
          </div>
        )}

        {/* Layer stack — each slot always mounted, src swaps on preload complete */}
        {LAYER_ORDER.map((slug) => {
          const layer = displayed[slug];
          if (!layer) return null;

          const isHidden = slug === "switch" && hasKeycap;

          return (
            <div
              key={slug}
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out"
              style={{
                zIndex: getZIndex(slug),
                opacity: isHidden ? 0 : 1,
              }}
            >
              <Image
                src={layer.url}
                alt={layer.name}
                fill
                className="object-contain transition-opacity duration-300 ease-in-out"
                priority={slug === "case"}
                sizes="(max-width: 768px) 100vw, 75vw"
              />
            </div>
          );
        })}
      </div>
    );
  },
);
Visualizer.displayName = "Visualizer";

// --- ProductItem (with hover preload + animated selection) ---
const ProductItem = memo(
  ({
    product,
    isSelected,
    onClick,
    onHover,
  }: {
    product: BuilderProduct;
    isSelected: boolean;
    onClick: (p: BuilderProduct) => void;
    onHover?: (p: BuilderProduct) => void;
  }) => (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => onHover?.(product)}
      className={`
        group cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 select-none
        transition-all duration-300 ease-out
        ${
          isSelected
            ? "border-yellow-400 bg-yellow-400/5 shadow-md shadow-yellow-400/10 scale-[1.01]"
            : "border-gray-700/50 bg-black/30 shadow-sm hover:shadow-md hover:border-gray-500 hover:scale-[1.005]"
        }
      `}
    >
      <div className="w-22 h-22 bg-black rounded-lg relative shrink-0 overflow-hidden">
        <Image
          src={product.thumbnailUrl}
          alt={product.name}
          fill
          className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
          sizes="64px"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold text-sm truncate transition-colors duration-200 ${
            isSelected ? "text-yellow-400" : "text-white"
          }`}
        >
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-sm text-white">
            {product.price > 0
              ? `+${product.price.toLocaleString()}₫`
              : "Included"}
          </span>
          {product.tags && (
            <span className="text-[9px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
              {product.tags}
            </span>
          )}
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isSelected
            ? "bg-yellow-400 border-yellow-400 text-black scale-110"
            : "border-gray-600 group-hover:border-gray-400 scale-100"
        }`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </div>
    </div>
  ),
);
ProductItem.displayName = "ProductItem";

// --- NoneCard (Deselect card — animated styling) ---
const NoneCard = memo(
  ({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) => (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 select-none
        transition-all duration-300 ease-out
        ${
          isSelected
            ? "border-yellow-400 bg-yellow-400/5 shadow-md shadow-yellow-400/10 scale-[1.01]"
            : "border-gray-700/50 bg-black/30 shadow-sm hover:shadow-md hover:border-gray-500 hover:scale-[1.005]"
        }
      `}
    >
      <div className="w-22 h-22 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
        <svg
          className="w-8 h-8 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold text-sm ${
            isSelected ? "text-yellow-400" : "text-white"
          }`}
        >
          None
        </h4>
        <span className="text-xs text-gray-500">Deselect this step</span>
      </div>
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isSelected
            ? "bg-yellow-400 border-yellow-400 text-black scale-110"
            : "border-gray-600 group-hover:border-gray-400 scale-100"
        }`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  ),
);
NoneCard.displayName = "NoneCard";

// --- KitCard (State 0 — Base Kit selection grid) ---
const KitCard = memo(
  ({ kit, onClick }: { kit: PartItem; onClick: (kit: PartItem) => void }) => {
    const specs = kit.specifications ? JSON.parse(kit.specifications) : null;

    return (
      <div
        onClick={() => onClick(kit)}
        className="group cursor-pointer border-2 border-gray-700 rounded-2xl bg-black/50 p-4 hover:border-yellow-400 transition-all duration-200 hover:shadow-xl hover:shadow-yellow-400/10"
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-900 mb-4">
          {kit.thumbnailUrl ? (
            <Image
              src={kit.thumbnailUrl}
              alt={kit.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <span className="text-5xl">⌨️</span>
            </div>
          )}
        </div>
        <h3 className="text-white font-bold text-lg uppercase tracking-tight truncate">
          {kit.name}
        </h3>
        {kit.description && (
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {kit.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-yellow-400 font-bold text-lg">
            {kit.price.toLocaleString()}₫
          </span>
          {specs?.workflow && (
            <span className="text-[10px] text-gray-500 uppercase font-medium">
              {specs.workflow.length} steps
            </span>
          )}
        </div>
      </div>
    );
  },
);
KitCard.displayName = "KitCard";

// ============================================================
// MAIN BUILDER CONTENT (Server-Driven UI)
// ============================================================
function BuilderContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

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
  } = useAppSelector((state) => state.builder);

  const shopId = searchParams.get("shopId");

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

  // --- Handlers ---
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

  const handleAddToCart = useCallback(() => {
    if (!session) return;
    // TODO: Integrate with cart/checkout API using session.id
    console.log("Add to cart — session:", session.id);
  }, [session]);

  const handleReset = useCallback(() => {
    if (confirm("Reset toàn bộ cấu hình?")) {
      dispatch(resetBuilder());
    }
  }, [dispatch]);

  const handleLogoClick = useCallback(() => {
    window.location.href = "/";
  }, []);

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
      name: "Summary",
      slug: "summary",
      index: workflowSteps.length + 1,
      isActive: currentStepName === "summary",
      isCompleted: false,
    });

    return steps;
  }, [workflowSteps, currentStepName, session]);

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s === currentStepName,
  );

  // =============================================
  // 🅰️ STATE 0: Kit Selection (no session)
  // =============================================
  if (!session) {
    return (
      <div className="h-screen flex flex-col font-sans bg-gray-50 overflow-hidden text-slate-800">
        {/* HEADER */}
        <div className="h-16 bg-black flex items-center justify-between px-4 lg:px-8 shadow-lg z-50 shrink-0 text-white">
          <div
            onClick={handleLogoClick}
            className="font-black text-xl tracking-tighter uppercase flex items-center gap-2 cursor-pointer select-none"
          >
            <span>Ameko</span>
            <span className="text-blue-500">Lab</span>
          </div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Select Your Base Kit
          </h1>
          <div />
        </div>

        {/* KIT GRID */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-6 lg:p-10">
          {loadingKits ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-10 h-10 border-4 border-gray-600 border-t-yellow-400 rounded-full"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={() => shopId && dispatch(fetchBaseKits(shopId))}
                className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                  Choose Your Kit
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                  Select a base kit to start building your custom keyboard
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
  // 🅱️ STATE 1: Builder Workspace
  // =============================================
  return (
    <div className="h-screen flex flex-col font-sans bg-gray-50 overflow-hidden text-slate-800">
      {/* HEADER */}
      <div className="h-16 bg-black flex items-center justify-between px-4 lg:px-8 shadow-lg z-50 shrink-0 text-white">
        <div
          onClick={handleLogoClick}
          className="font-black text-xl tracking-tighter uppercase mr-4 lg:mr-10 flex items-center gap-2 cursor-pointer select-none"
        >
          <span>Ameko</span>
          <span className="text-blue-500">Lab</span>
        </div>

        {/* Navigation Bar (Progress Steps + Summary) */}
        <div className="flex-1 flex items-center justify-start lg:justify-center gap-0 h-full overflow-x-auto custom-scrollbar">
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
                  relative h-full px-4 lg:px-6 flex items-center justify-center gap-2 uppercase font-bold text-[10px] lg:text-xs tracking-wider transition-all whitespace-nowrap
                  ${
                    step.isActive
                      ? "text-yellow-400 border-b-4 border-yellow-400 bg-white/5 cursor-default"
                      : isClickable
                        ? "text-gray-300 border-b-4 border-green-500/40 cursor-pointer hover:text-white hover:bg-white/5"
                        : "text-gray-600 border-b-4 border-transparent cursor-not-allowed"
                  }
                `}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                    step.isActive
                      ? "border-yellow-400 text-yellow-400"
                      : step.isCompleted || (isSummary && session?.isComplete)
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-gray-500 text-gray-500"
                  }`}
                >
                  {isSummary
                    ? "★"
                    : step.isCompleted && !step.isActive
                      ? "✓"
                      : step.index}
                </span>
                {step.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase font-bold">
              Total Est.
            </div>
            <div className="text-white font-bold text-lg leading-none">
              {session.totalPrice.toLocaleString()}₫
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded hover:bg-red-900/40 transition-all"
          >
            RESET
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: VISUALIZER */}
        <div
          className="w-full lg:w-2/3 bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/doezwafgz/image/upload/v1766677524/background_teui0y.png')",
            backgroundColor: "#1a1a1a",
          }}
        >
          <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>

          <div className="absolute top-4 left-4 text-xs font-bold text-gray-300 uppercase tracking-widest z-10">
            Visualizer Preview
          </div>

          <Visualizer selection={session.selection} />
        </div>

        {/* RIGHT COLUMN: CONFIGURATOR / SUMMARY */}
        <div className="hidden lg:flex w-1/3 bg-black flex-col z-10 shadow-2xl">
          {currentStepName === "summary" ? (
            <>
              {/* Summary Header */}
              <div className="p-6 shrink-0 border-b border-gray-800">
                <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                  Your Build
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Review your selections before adding to cart
                </p>
              </div>

              {/* BOM List */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-3">
                  {Object.entries(session.selection).map(([stepName, part]) => (
                    <div
                      key={stepName}
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-600 transition-all group/bom"
                      onClick={() => handleStepClick(stepName)}
                      title={`Edit ${stepName}`}
                    >
                      <div className="w-14 h-14 bg-black rounded-lg relative shrink-0 overflow-hidden">
                        <Image
                          src={part.thumbnailUrl}
                          alt={part.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">
                          {stepName}
                        </div>
                        <h4 className="text-white font-bold text-sm truncate">
                          {part.name}
                        </h4>
                        <div className="text-gray-400 text-xs">
                          ×{part.quantity} —{" "}
                          {part.price > 0
                            ? `+${(part.price * part.quantity).toLocaleString()}₫`
                            : "Included"}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-600 shrink-0 group-hover/bom:text-gray-400 transition-colors"
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
              </div>

              {/* Total + CTA */}
              <div className="p-4 bg-black shrink-0 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-bold uppercase text-sm">
                    Total
                  </span>
                  <span className="text-yellow-400 font-black text-2xl">
                    {session.totalPrice.toLocaleString()}₫
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-yellow-400 text-black font-bold uppercase text-sm rounded-lg hover:bg-yellow-300 transition-all shadow-lg active:translate-y-[1px]"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleReset}
                  className="w-full mt-2 py-2.5 text-gray-400 font-bold uppercase text-xs border border-gray-700 rounded-lg hover:text-white hover:border-gray-500 transition-all"
                >
                  Start Over
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step Header */}
              <div className="p-6 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded uppercase">
                    Step {currentStepIndex + 1}
                  </span>
                </div>
                <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                  {currentStepName || "Select Component"}
                </h2>
              </div>

              {/* Grid Products */}
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-black">
                <div
                  key={currentStepName}
                  className="grid grid-cols-1 gap-3 animate-fadeIn"
                >
                  {/* None / Deselect Card (Index 0) */}
                  <NoneCard
                    isSelected={!session.selection[currentStepName || ""]}
                    onClick={() => {
                      if (
                        currentStepName &&
                        session.selection[currentStepName]
                      ) {
                        handleRemoveComponent(currentStepName);
                      }
                    }}
                  />

                  {currentProducts.map((product) => (
                    <ProductItem
                      key={product.optionId}
                      product={product}
                      isSelected={
                        session.selection[currentStepName || ""]?.id ===
                        product.partId
                      }
                      onClick={handleSelectComponent}
                      onHover={handleProductHover}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN EXPORT (Suspense boundary for useSearchParams) ---
export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-black rounded-full"></div>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
