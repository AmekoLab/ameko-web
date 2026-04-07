"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Box,
  X,
  Rotate3D,
  ZoomIn,
  Camera,
  Activity,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Star,
} from "lucide-react";
import { use3DModel } from "@/src/hooks/3d/use3DModel";
import { EnvironmentPreset, Model3DConfig } from "@/src/types/model.types";

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const MODAL_TYPES = {
  NONE: "NONE",
  IMAGE: "IMAGE",
  THREE_D: "3D",
} as const;

type ModalType = (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES];

/**
 * ============================================================
 * DYNAMIC IMPORT
 * ============================================================
 */

const KeyboardViewer = dynamic(
  () => import("@/src/components/3d/scenes/KeyboardViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 animate-pulse">
        <Box className="w-12 h-12 animate-bounce mb-4 text-amazon-link" />
        <span className="text-xs font-black uppercase tracking-widest text-amazon-textMuted">
          Loading 3D Viewer...
        </span>
      </div>
    ),
  },
);

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  productId: string;
  enable3DScreenshot?: boolean;
  enable3DFPS?: boolean;
  enable3DGestures?: boolean;
  environmentPreset?: EnvironmentPreset;
  on3DScreenshot?: (dataUrl: string) => void;
  view3DUrl?: string;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export const ProductGallery = ({
  images,
  productName = "Product",
  productId,
  enable3DScreenshot = true,
  enable3DFPS = false,
  enable3DGestures = true,
  environmentPreset = "city",
  on3DScreenshot,
  view3DUrl,
}: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [activeModal, setActiveModal] = useState<ModalType>(MODAL_TYPES.NONE);
  const [screenshotNotification, setScreenshotNotification] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    modelConfig: hookModelConfig,
    isLoading: hookLoading,
    error: hookError,
    refetch: refetchModel,
  } = use3DModel(productId, {
    enabled: !view3DUrl,
    onSuccess: (config) => {
      console.log("✅ 3D Model loaded:", config);
    },
    onError: (error) => {
      console.error("❌ 3D Model failed:", error);
    },
  });

  const directModelConfig: Model3DConfig | null = view3DUrl
    ? {
        id: productId,
        name: productName,
        modelUrl: view3DUrl,
        scale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      }
    : null;

  const modelConfig = directModelConfig || hookModelConfig;
  const isLoadingModel = view3DUrl ? false : hookLoading;
  const modelError = view3DUrl ? null : hookError;
  const is3DAvailable = modelConfig && !modelError;

  const closeModal = useCallback(() => {
    setActiveModal(MODAL_TYPES.NONE);
  }, []);

  useEffect(() => {
    if (activeModal !== MODAL_TYPES.NONE) {
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  const handle3DScreenshot = useCallback(
    (dataUrl: string) => {
      setScreenshotNotification(true);
      setTimeout(() => setScreenshotNotification(false), 2000);
      on3DScreenshot?.(dataUrl);
    },
    [on3DScreenshot],
  );

  const handle3DError = useCallback((error: Error) => {
    console.error("❌ 3D Viewer Error:", error);
  }, []);

  const handle3DLoad = useCallback(() => {
    console.log("✅ 3D Model rendered successfully");
  }, []);

  return (
    <>
      {/* Screenshot Notification */}
      {screenshotNotification && (
        <div className="fixed top-4 right-4 z-[10000] bg-amazon-btnSecondary text-amazon-text border border-amazon-border px-4 py-2 shadow-sm flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <span className="text-sm font-black uppercase tracking-wider">Screenshot saved!</span>
        </div>
      )}

      {/* MAIN GALLERY — Corsair cinematic layout */}
      <div className="relative flex flex-col-reverse lg:flex-row w-full h-[600px] lg:h-[calc(100vh-104px)] select-none bg-white overflow-hidden">

        {/* ── Absolute Breadcrumb Overlay ── */}
        <div className="absolute top-6 left-6 lg:left-[136px] z-20 text-amazon-textMuted text-[11px] font-medium tracking-wide pointer-events-none select-none hidden lg:block">
          Home / Shop / <span className="text-amazon-text font-bold">{productName}</span>
        </div>

        {/* ── Thumbnail Column ── */}
        <div
          className="flex lg:flex-col items-center gap-3 p-4 pt-4 lg:pt-16 lg:pl-10 lg:pr-4 overflow-x-auto lg:overflow-y-auto shrink-0 z-10 w-full lg:w-[120px] h-auto lg:h-full"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          role="tablist"
          aria-label="Product images"
        >
          {/* Up caret — desktop only */}
          <ChevronUp className="hidden lg:block w-5 h-5 text-amazon-textMuted hover:text-amazon-text cursor-pointer transition-colors shrink-0 mb-1" />

          {/* 3D View Thumbnail */}
          <button
            onClick={() => {
              if (is3DAvailable) {
                setActiveModal(MODAL_TYPES.THREE_D);
              } else if (modelError) {
                refetchModel();
              }
            }}
            disabled={isLoadingModel}
            className={`
              relative w-[72px] h-[72px] rounded-lg shrink-0 overflow-hidden transition-all duration-200 border-2
              bg-white
              flex flex-col items-center justify-center gap-1 group backdrop-blur-sm
              ${
                is3DAvailable
                  ? "border-amazon-link/40 text-amazon-link hover:border-amazon-focus cursor-pointer"
                  : modelError
                    ? "border-red-600/40 text-red-400 cursor-pointer hover:border-red-500"
                    : "border-transparent text-amazon-textMuted cursor-not-allowed"
              }
            `}
            aria-label={
              is3DAvailable ? "Open 3D view" : modelError ? "Retry loading 3D model" : "Loading 3D model"
            }
            type="button"
          >
            {isLoadingModel ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : modelError ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Box className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[8px] font-black uppercase tracking-wider">
              {isLoadingModel ? "Loading" : modelError ? "Retry" : is3DAvailable ? "3D" : "No 3D"}
            </span>
          </button>

          {/* Image Thumbnails */}
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`
                relative w-[72px] h-[72px] rounded-lg shrink-0 overflow-hidden transition-all duration-200 border-2
                ${
                  selectedImage === img
                    ? "border-amazon-focus shadow-sm bg-white opacity-100"
                    : "border-amazon-border bg-white opacity-60 hover:opacity-100"
                }
              `}
              role="tab"
              aria-selected={selectedImage === img}
              aria-label={`View image ${idx + 1}`}
              type="button"
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="72px"
              />
            </button>
          ))}

          {/* Down caret — desktop only */}
          <ChevronDown className="hidden lg:block w-5 h-5 text-amazon-textMuted hover:text-amazon-text cursor-pointer transition-colors shrink-0 mt-1" />
        </div>

        {/* ── Main Image Display ── */}
        <div
          className="flex-1 relative w-full h-full flex items-center justify-center p-4 cursor-zoom-in group"
          onClick={() => setActiveModal(MODAL_TYPES.IMAGE)}
          role="button"
          tabIndex={0}
          aria-label="Click to enlarge image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveModal(MODAL_TYPES.IMAGE);
            }
          }}
        >
          <Image
            src={selectedImage}
            alt={`${productName} main view`}
            fill
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] p-2 md:p-4"
            priority
            sizes="(max-width: 768px) 100vw, 65vw"
            style={{ filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.8))" }}
          />

          {/* 3D Button Overlay — Corsair style */}
          {is3DAvailable && (
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModal(MODAL_TYPES.THREE_D);
                }}
                className="flex items-center gap-2 bg-white/90 shadow-sm backdrop-blur-md border border-amazon-border px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amazon-text hover:text-amazon-focus hover:border-amazon-focus transition-colors"
                aria-label="Open 360° 3D view"
                type="button"
              >
                <Rotate3D className="w-4 h-4" />
                360° View
              </button>
            </div>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white/90 shadow-sm backdrop-blur-md px-3 py-2 text-amazon-textMuted flex items-center gap-2 border border-amazon-border">
              <ZoomIn className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Click to Zoom</span>
            </div>
          </div>
        </div>

        {/* ── MORE FEATURES — bottom left absolute ── */}
        <div className="absolute bottom-8 left-6 lg:left-10 z-20 flex items-center gap-3 text-amazon-link hover:text-amazon-focus cursor-pointer transition-colors group/feat">
          <div className="border-[1.5px] border-current p-0.5">
            <Star className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest">
            More Features
          </span>
        </div>

      </div>

      {/* FULLSCREEN MODAL */}
      {activeModal !== MODAL_TYPES.NONE &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={modalRef}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/98 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={
              activeModal === MODAL_TYPES.THREE_D ? "3D viewer" : "Image viewer"
            }
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white transition-all group border border-white/20"
              aria-label="Close viewer (ESC)"
              type="button"
            >
              <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Modal Content */}
            <div className="w-full h-full relative flex items-center justify-center p-4">
              {/* 3D VIEW */}
              {activeModal === MODAL_TYPES.THREE_D && modelConfig && (
                <>
                  <div className="absolute top-6 left-6 z-40 text-white pointer-events-none select-none">
                    <h3 className="text-xl font-black uppercase tracking-widest">
                      {modelConfig.name}
                    </h3>
                    <p className="text-white/50 text-xs">
                      Drag to rotate • Scroll to zoom
                    </p>
                    {enable3DScreenshot && (
                      <p className="text-white/30 text-[10px] mt-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Click camera icon to capture
                      </p>
                    )}
                    {enable3DFPS && (
                      <p className="text-white/30 text-[10px] flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Performance monitor active
                      </p>
                    )}
                  </div>

                  <KeyboardViewer
                    modelConfig={modelConfig}
                    className="w-full h-full"
                    enableZoom={true}
                    enableScreenshot={enable3DScreenshot}
                    enableFPS={enable3DFPS}
                    enableGestures={enable3DGestures}
                    environmentPreset={environmentPreset}
                    onScreenshot={handle3DScreenshot}
                    onError={handle3DError}
                    onLoad={handle3DLoad}
                  />
                </>
              )}

              {/* IMAGE VIEW */}
              {activeModal === MODAL_TYPES.IMAGE && (
                <div className="relative w-full h-full max-w-5xl max-h-screen">
                  <Image
                    src={selectedImage}
                    alt={`${productName} fullscreen view`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold uppercase tracking-widest">
                    Press ESC to close
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
