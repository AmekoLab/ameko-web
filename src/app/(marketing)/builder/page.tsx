"use client";

import { useEffect, useMemo, memo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchBaseKits,
  startBuilderSession,
  selectBuilderComponent,
  resetBuilder,
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

// --- Visualizer (layer stacking from session.selection) ---
const Visualizer = memo(
  ({ selection }: { selection: Record<string, SelectedPart> }) => {
    const hasKeycap = !!selection["keycap"];
    const hasAnySelection = Object.keys(selection).length > 0;

    return (
      <div className="relative w-full max-w-[1000px] aspect-[4/3] lg:aspect-video">
        {/* Placeholder khi trống */}
        {!hasAnySelection && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0">
            <span className="text-4xl opacity-20 mb-2">⌨️</span>
            <p className="text-sm font-medium opacity-50">Chưa có linh kiện</p>
          </div>
        )}

        {/* VẼ TỪNG LỚP THEO THỨ TỰ CỐ ĐỊNH */}
        {LAYER_ORDER.map((slug) => {
          const part = selection[slug];
          if (!part) return null;

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
                src={part.layerImageUrl}
                alt={part.name}
                fill
                className="object-contain"
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

// --- ProductItem (adapted for BuilderProduct) ---
const ProductItem = memo(
  ({
    product,
    isSelected,
    onClick,
  }: {
    product: BuilderProduct;
    isSelected: boolean;
    onClick: (p: BuilderProduct) => void;
  }) => (
    <div
      onClick={() => onClick(product)}
      className={`
      group cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all duration-200 select-none
      ${
        isSelected
          ? "border-yellow-300 bg-black-50/50 shadow-sm"
          : " bg-black-50/50 shadow-sm hover:shadow-md"
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
          className={`font-bold text-sm truncate ${
            isSelected ? "text-white" : "text-white"
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
        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
          isSelected
            ? "bg-blue-600 border-blue-600 text-white"
            : "border-gray-300 group-hover:border-slate-400"
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
  } = useAppSelector((state) => state.builder);

  const shopId = searchParams.get("shopId");
  const categoryId = searchParams.get("categoryId");

  // State 0: Fetch kits on mount when no session exists
  useEffect(() => {
    if (!session && shopId && categoryId) {
      dispatch(fetchBaseKits({ shopId, categoryId }));
    }
  }, [dispatch, session, shopId, categoryId]);

  // Preload layer images when currentProducts change
  useEffect(() => {
    if (currentProducts.length > 0) {
      currentProducts.forEach((product) => {
        const img = new window.Image();
        img.src = product.layerImageUrl;
      });
    }
  }, [currentProducts]);

  // --- Handlers ---
  const handleSelectKit = (kit: PartItem) => {
    dispatch(startBuilderSession(kit.id));
  };

  const handleSelectComponent = (product: BuilderProduct) => {
    if (!session || !currentStepName) return;
    dispatch(
      selectBuilderComponent({
        sessionId: session.id,
        selectedPartId: product.partId,
        stepName: currentStepName,
      }),
    );
  };

  const handleReset = () => {
    if (confirm("Reset toàn bộ cấu hình?")) {
      dispatch(resetBuilder());
    }
  };

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  // Navigation items for progress bar
  const navItems = useMemo(
    () =>
      workflowSteps.map((stepName, index) => ({
        name: stepName,
        slug: stepName,
        index: index + 1,
        isActive: currentStepName === stepName,
        isCompleted: session?.selection ? !!session.selection[stepName] : false,
      })),
    [workflowSteps, currentStepName, session],
  );

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
                onClick={() =>
                  shopId &&
                  categoryId &&
                  dispatch(fetchBaseKits({ shopId, categoryId }))
                }
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
  // STATE 2: Summary (isComplete === true)
  // =============================================
  if (session.isComplete) {
    const selectionEntries = Object.entries(session.selection);

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
          <h1 className="text-sm font-bold uppercase tracking-wider text-green-400">
            ✓ Build Complete
          </h1>
          <div />
        </div>

        {/* SUMMARY CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Final Preview */}
          <div
            className="w-full lg:w-2/3 bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/doezwafgz/image/upload/v1766677524/background_teui0y.png')",
              backgroundColor: "#1a1a1a",
            }}
          >
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>
            <Visualizer selection={session.selection} />
          </div>

          {/* RIGHT: BOM + Actions */}
          <div className="hidden lg:flex w-1/3 bg-black flex-col z-10 shadow-2xl">
            <div className="p-6 shrink-0 border-b border-gray-800">
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                Your Build
              </h2>
              <p className="text-gray-500 text-xs mt-1">Bill of Materials</p>
            </div>

            {/* BOM List */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-3">
                {selectionEntries.map(([stepName, part]) => (
                  <div
                    key={stepName}
                    className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800"
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
                  </div>
                ))}
              </div>
            </div>

            {/* Total + Add to Cart */}
            <div className="p-4 bg-black shrink-0 border-t border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 font-bold uppercase text-sm">
                  Total
                </span>
                <span className="text-yellow-400 font-black text-2xl">
                  {session.totalPrice.toLocaleString()}₫
                </span>
              </div>
              <button className="w-full py-3.5 bg-yellow-400 text-black font-bold uppercase text-sm rounded-lg hover:bg-yellow-300 transition-all shadow-lg active:translate-y-[1px]">
                Add to Cart
              </button>
              <button
                onClick={handleReset}
                className="w-full mt-2 py-2.5 text-gray-400 font-bold uppercase text-xs border border-gray-700 rounded-lg hover:text-white hover:border-gray-500 transition-all"
              >
                Build Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // 🅱️ STATE 1: Builder Workspace (session exists, not complete)
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

        {/* Navigation Bar (Progress Steps) */}
        <div className="flex-1 flex items-center justify-start lg:justify-center gap-0 h-full overflow-x-auto custom-scrollbar">
          {navItems.map((step) => (
            <button
              key={step.slug}
              disabled
              className={`
                    relative h-full px-4 lg:px-6 flex items-center justify-center gap-2 uppercase font-bold text-[10px] lg:text-xs tracking-wider transition-all whitespace-nowrap cursor-default
                    ${
                      step.isActive
                        ? "text-yellow-400 border-b-4 border-yellow-400 bg-white/5"
                        : "text-gray-400 border-b-4 border-transparent"
                    }
                  `}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                  step.isActive
                    ? "border-yellow-400 text-yellow-400"
                    : step.isCompleted
                      ? "border-green-500 text-green-500"
                      : "border-gray-500 text-gray-500"
                }`}
              >
                {step.isCompleted && !step.isActive ? "✓" : step.index}
              </span>
              {step.name}
            </button>
          ))}
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

        {/* RIGHT COLUMN: CONFIGURATOR */}
        <div className="hidden lg:flex w-1/3 bg-black flex-col z-10 shadow-2xl">
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
            {processing ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full" />
                <span className="text-xs text-gray-400 font-medium">
                  Đang tải dữ liệu...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentProducts.map((product) => (
                  <ProductItem
                    key={product.optionId}
                    product={product}
                    isSelected={
                      session.selection[currentStepName || ""]?.id ===
                      product.partId
                    }
                    onClick={handleSelectComponent}
                  />
                ))}
              </div>
            )}
          </div>
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
