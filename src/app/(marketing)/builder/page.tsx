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
} from "@/src/store/slices/builderSlice";
import { BuilderProduct, SelectedPart } from "@/src/types/builder";
import { PartItem } from "@/src/types/part.types";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";

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

const LAYER_ORDER = ["case", "pcb", "plate", "switch", "keycap"];

// Cutting-mat grid — shared between visualizer area and kit-select page
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundColor: "#111111",
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px",
};

// ─── VISUALIZER ─────────────────────────────────────────────────────────────
const Visualizer = memo(
  ({
    selection,
    viewMode,
  }: {
    selection: Record<string, SelectedPart>;
    viewMode: "top" | "side" | "angled";
  }) => {
    const hasAnySelection = Object.keys(selection).length > 0;

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

    // viewMode can drive a CSS transform in future; wired but not yet used
    const containerStyle: React.CSSProperties =
      viewMode === "angled"
        ? { transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }
        : viewMode === "side"
          ? { transform: "perspective(1200px) rotateY(-25deg)" }
          : {};

    return (
      <div className="relative w-[100%] h-[100%]" style={containerStyle}>
        {/* Layer stack */}
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
                quality={100}
                className="object-contain drop-shadow-2xl transition-opacity duration-300 ease-in-out"
                priority={slug === "case"}
                sizes="(max-width: 768px) 100vw, 65vw"
              />
            </div>
          );
        })}

        {/* Empty-state: show nothing when no layers — Corsair style */}
        {!hasAnySelection && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-64 h-40 rounded-2xl border border-white/5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            />
          </div>
        )}
      </div>
    );
  },
);
Visualizer.displayName = "Visualizer";

// ─── PRODUCT ITEM — Corsair Circle ──────────────────────────────────────────
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
      className="group cursor-pointer flex flex-col items-center gap-2.5 select-none"
    >
      {/* Circle */}
      <div
        className={`
          w-24 h-24 rounded-full relative overflow-hidden flex-shrink-0
          transition-all duration-150 ease-out
          ${
            isSelected
              ? "border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.35)]"
              : "border border-gray-700 hover:border-gray-400"
          }
        `}
        style={{ background: "#1a1a1a" }}
      >
        <Image
          src={product.thumbnailUrl}
          alt={product.name}
          fill
          className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-200"
          sizes="96px"
          loading="lazy"
        />
      </div>

      {/* Label */}
      <div className="text-center w-full px-0.5">
        <p
          className={`text-[11px] font-bold uppercase tracking-wide leading-tight transition-colors ${
            isSelected ? "text-yellow-400" : "text-gray-200 group-hover:text-white"
          }`}
        >
          {product.name}
        </p>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
          {product.price > 0
            ? `+${product.price.toLocaleString()}₫`
            : "Included"}
        </p>
      </div>
    </div>
  ),
);
ProductItem.displayName = "ProductItem";

// ─── KIT CARD ───────────────────────────────────────────────────────────────
const KitCard = memo(
  ({ kit, onClick }: { kit: PartItem; onClick: (kit: PartItem) => void }) => {
    const specs = kit.specifications ? JSON.parse(kit.specifications) : null;

    return (
      <div
        onClick={() => onClick(kit)}
        className="group cursor-pointer border border-white/8 rounded-2xl p-5 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/10 hover:scale-[1.02]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-5 border border-white/5"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
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
            <div className="flex items-center justify-center h-full text-gray-600">
              <span className="text-5xl">⌨️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
        <h3 className="text-white font-black text-lg uppercase tracking-tight truncate mb-1">
          {kit.name}
        </h3>
        {kit.description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {kit.description}
          </p>
        )}
        <div
          className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-yellow-400 font-black text-xl tracking-tight">
            {kit.price.toLocaleString()}₫
          </span>
          {specs?.workflow && (
            <span
              className="text-[10px] text-gray-500 uppercase font-bold px-2 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {specs.workflow.length} steps
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
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [viewMode, setViewMode] = useState<"top" | "side" | "angled">("top");

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
        toast.success(res.message || "Item added to cart successfully!");
        router.push("/cart");
      } else {
        toast.error(res.message || "Failed to add to cart");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }, [session, addingToCart, router]);

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
      name: "Build Summary",
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

  // NEXT: advance to next step or summary
  const handleNextStep = useCallback(() => {
    if (!session || processing) return;
    if (currentStepName === "summary") {
      handleAddToCart();
      return;
    }
    const idx = workflowSteps.indexOf(currentStepName || "");
    if (idx >= 0 && idx < workflowSteps.length - 1) {
      dispatch(setActiveStep(workflowSteps[idx + 1]));
    } else {
      dispatch(setActiveStep("summary"));
    }
  }, [session, processing, currentStepName, workflowSteps, dispatch, handleAddToCart]);

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
      handleReset();
    } else {
      dispatch(setActiveStep(workflowSteps[idx - 1]));
    }
  }, [session, processing, currentStepName, workflowSteps, dispatch, handleReset]);

  // =============================================
  // STATE 0: Kit Selection (no session)
  // =============================================
  if (!session) {
    return (
      <div className="h-screen flex flex-col overflow-hidden text-white" style={{ background: "#111111" }}>
        {/* HEADER */}
        <div
          className="h-16 flex items-center justify-between px-6 lg:px-10 z-50 shrink-0"
          style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div
            onClick={handleLogoClick}
            className="flex flex-col cursor-pointer select-none"
          >
            <span className="font-black text-base leading-tight tracking-tight text-white">
              // AMEKO
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500 leading-tight">
              Custom Lab
            </span>
          </div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            Keyboard Builder
          </h1>
          <div />
        </div>

        {/* KIT GRID */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-14" style={GRID_BG_STYLE}>
          {loadingKits ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-10 h-10 border-4 border-gray-700 border-t-yellow-400 rounded-full" />
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
              <div className="text-center mb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-yellow-400/60 mb-3">
                  Ameko Custom Lab
                </p>
                <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                  Choose Your Kit
                </h2>
                <p className="text-gray-500 mt-4 text-sm max-w-md mx-auto leading-relaxed">
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
  // STATE 1: Builder Workspace — Corsair layout
  // =============================================

  // Kit display name for sidebar header
  const kitDisplayName = "Custom Lab Edition";

  // Pricing breakdown for summary
  const baseKitPrice = baseKits.find((k) => k.id === session.kitId)?.price ?? 0;
  const addOnsTotal = session.totalPrice - baseKitPrice;

  return (
    <div className="h-screen flex flex-col overflow-hidden text-white" style={{ background: "#111111" }}>

      {/* ═══════════════════════════════════════
          HEADER — Corsair style
      ═══════════════════════════════════════ */}
      <div
        className="h-16 flex items-center z-50 shrink-0 px-4 gap-0"
        style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Exit Lab */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-1.5 text-yellow-400 text-xs font-black uppercase tracking-widest hover:text-yellow-300 transition-colors shrink-0 mr-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Exit Lab
        </button>

        {/* Logo */}
        <div className="flex flex-col shrink-0 mr-8 select-none">
          <span className="font-black text-base leading-tight tracking-tight text-white">
            // AMEKO
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500 leading-tight">
            Custom Lab
          </span>
        </div>

        {/* Step nav — Corsair: name only, white underline active */}
        <div className="flex-1 flex items-center h-full overflow-x-auto custom-scrollbar">
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
                  relative h-full px-4 lg:px-5 flex items-center font-bold text-[11px] uppercase tracking-[0.15em]
                  transition-colors whitespace-nowrap shrink-0
                  ${
                    step.isActive
                      ? "text-white border-b-2 border-white cursor-default"
                      : isClickable
                        ? "text-gray-500 border-b-2 border-transparent cursor-pointer hover:text-gray-300"
                        : "text-gray-700 border-b-2 border-transparent cursor-not-allowed"
                  }
                `}
              >
                {isSummary ? "Build Summary" : `${step.index}. ${step.name}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: VISUALIZER ── */}
        <div
          className="flex-[62] relative flex flex-col items-center justify-center overflow-hidden"
          style={GRID_BG_STYLE}
        >
          {/* Radial vignette */}
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

          {/* Keyboard layers */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Visualizer selection={session.selection} viewMode={viewMode} />
          </div>

          {/* View toggle — bottom-left */}
          <div className="absolute bottom-6 left-6 z-20 flex">
            {(["top", "side", "angled"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-5 py-2.5 font-black uppercase text-[10px] tracking-widest transition-all
                  border border-white/15
                  ${viewMode === mode
                    ? "bg-white text-black"
                    : "bg-black text-white hover:bg-white/10"
                  }
                `}
              >
                {mode} View
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: CONFIGURATOR / SUMMARY ── */}
        <div
          className="hidden lg:flex flex-[38] flex-col z-10"
          style={{
            background: "#0d0d0d",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {currentStepName === "summary" ? (
            /* ─────────────────────────────────────
               SUMMARY VIEW
            ───────────────────────────────────── */
            <>
              {/* Header */}
              <div
                className="px-7 pt-7 pb-5 shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.3em] mb-1">
                  {kitDisplayName}
                </p>
                <h2 className="text-4xl font-black uppercase text-white tracking-tight">
                  Build Summary
                </h2>
              </div>

              {/* BOM list */}
              <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                <div className="space-y-2">
                  {Object.entries(session.selection).map(([stepName, part]) => (
                    <div
                      key={stepName}
                      className="flex items-center gap-3 p-3 cursor-pointer transition-all group/bom rounded"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                      onClick={() => handleStepClick(stepName)}
                      title={`Edit ${stepName}`}
                    >
                      <div
                        className="w-14 h-14 relative shrink-0 overflow-hidden"
                        style={{ background: "#000" }}
                      >
                        <Image
                          src={part.thumbnailUrl}
                          alt={part.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em]">
                          {stepName}
                        </div>
                        <h4 className="text-white font-bold text-sm truncate">{part.name}</h4>
                        <div className="text-gray-500 text-xs">
                          ×{part.quantity} —{" "}
                          {part.price > 0
                            ? `+${(part.price * part.quantity).toLocaleString()}₫`
                            : "Included"}
                        </div>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 text-gray-700 shrink-0 group-hover/bom:text-gray-400 transition-colors"
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

              {/* Footer — Subtotal breakdown + BACK / ADD TO CART */}
              <div
                className="shrink-0 px-7 py-6"
                style={{
                  background: "#0a0a0a",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Breakdown */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="uppercase font-bold tracking-wider">Base Kit</span>
                    <span>{baseKitPrice > 0 ? `${baseKitPrice.toLocaleString()}₫` : "Included"}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="uppercase font-bold tracking-wider">Add-ons</span>
                    <span>+{addOnsTotal > 0 ? addOnsTotal.toLocaleString() : "0"}₫</span>
                  </div>
                  <div
                    className="my-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-yellow-400 font-black text-2xl tracking-tight">
                      {session.totalPrice.toLocaleString()}₫
                    </span>
                  </div>
                </div>

                {/* BACK + ADD TO CART */}
                <div className="flex gap-0">
                  <button
                    onClick={() => handleStepClick(workflowSteps[workflowSteps.length - 1])}
                    className="flex-1 py-4 font-black uppercase tracking-widest text-sm text-white transition-all hover:bg-white/5 active:scale-[0.98]"
                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 py-4 bg-yellow-400 text-black font-black uppercase tracking-widest text-sm hover:bg-yellow-300 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add to Cart"
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
              <div
                className="px-7 pt-7 pb-5 shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.3em] mb-1">
                  {kitDisplayName}
                </p>
                <h2 className="text-4xl font-black uppercase text-white tracking-tight">
                  {currentStepName || "Select Component"}
                </h2>

                {/* Help me choose */}
                <button
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white px-4 py-1.5 rounded-full transition-all hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help me choose
                </button>
              </div>

              {/* Product grid — 3 circles per row */}
              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                <div
                  key={currentStepName}
                  className="grid grid-cols-3 gap-x-4 gap-y-7 animate-fadeIn"
                >
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

              {/* Footer — Subtotal + BACK / NEXT */}
              <div
                className="shrink-0 px-7 py-5"
                style={{
                  background: "#0a0a0a",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-500">
                    Subtotal
                  </span>
                  <span className="text-yellow-400 font-black text-2xl tracking-tight">
                    {session.totalPrice.toLocaleString()}₫
                  </span>
                </div>

                {/* BACK + NEXT — half-width, sharp corners */}
                <div className="flex gap-0">
                  <button
                    onClick={handleBackStep}
                    disabled={processing}
                    className="flex-1 py-4 font-black uppercase tracking-widest text-sm text-white transition-all hover:bg-white/5 active:scale-[0.98] disabled:opacity-40"
                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={processing}
                    className="flex-1 py-4 bg-yellow-400 text-black font-black uppercase tracking-widest text-sm hover:bg-yellow-300 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT (Suspense boundary for useSearchParams) ────────────────────
export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#111111" }}
        >
          <div className="animate-spin w-10 h-10 border-4 border-gray-700 border-t-yellow-400 rounded-full" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
