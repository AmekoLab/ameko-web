"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Box, X, Rotate3D, ZoomIn, Camera, Activity } from "lucide-react";

// ==================== CONSTANTS ====================
const MODAL_TYPES = {
  NONE: "NONE",
  IMAGE: "IMAGE",
  THREE_D: "3D",
} as const;

type ModalType = (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES];

// ==================== DYNAMIC IMPORT ====================
const KeyboardViewer = dynamic(
  () => import("@/src/components/3d/scenes/KeyboardViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 animate-pulse">
        <Box className="w-12 h-12 animate-bounce mb-4 text-white" />
        <span className="text-xs font-bold uppercase tracking-widest text-white">
          Loading 3D Model...
        </span>
      </div>
    ),
  }
);

// ==================== TYPES ====================
interface ProductGalleryProps {
  images: string[];
  productName?: string;
  // New 3D Viewer Options
  enable3DScreenshot?: boolean;
  enable3DFPS?: boolean;
  enable3DGestures?: boolean;
  modelType?: "keyboard"; // khả năng mở rộng sau này
  environmentPreset?:
    | "city"
    | "sunset"
    | "dawn"
    | "night"
    | "warehouse"
    | "forest"
    | "apartment"
    | "studio"
    | "park"
    | "lobby";
}

// ==================== COMPONENT ====================
export const ProductGallery = ({
  images,
  productName = "Product",
  enable3DScreenshot = true,
  enable3DFPS = false,
  enable3DGestures = true,
  modelType = "keyboard",
  environmentPreset = "city",
}: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [activeModal, setActiveModal] = useState<ModalType>(MODAL_TYPES.NONE);
  const [screenshotNotification, setScreenshotNotification] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // đóng modal
  const closeModal = useCallback(() => {
    setActiveModal(MODAL_TYPES.NONE);
  }, []);

  // Quản lý focus và scroll khi modal mở
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

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  // xử lý screenshot từ 3D viewer
  // const handle3DScreenshot = useCallback((dataUrl: string) => {
  // Show notification
  // setScreenshotNotification(true);
  // setTimeout(() => setScreenshotNotification(false), 2000);

  // Auto download is handled by KeyboardViewer
  // You can add custom logic here if needed
  //   console.log("3D Screenshot captured:", dataUrl.substring(0, 50) + "...");
  // }, []);

  return (
    <>
      {/* Screenshot Notification */}
      {/* {screenshotNotification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 border border-emerald-400/50 backdrop-blur-md">
          <Camera className="w-5 h-5" />
          <span className="text-sm font-bold tracking-wide">
            Screenshot Saved!
          </span>
        </div>
      )} */}

      {/* MAIN GALLERY */}
      <div className="flex flex-col-reverse lg:flex-row gap-3 w-full h-full select-none">
        {/* Thumbnails */}
        <div
          className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-hide shrink-0 lg:w-16 lg:h-[450px]"
          role="tablist"
          aria-label="Product images"
        >
          {/* 3D View Button */}
          <button
            onClick={() => setActiveModal(MODAL_TYPES.THREE_D)}
            className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden transition-all border flex flex-col items-center justify-center gap-1 bg-slate-900 text-white hover:bg-slate-800 border-transparent shadow-md group"
            aria-label="Open 3D view"
            type="button"
          >
            <Box className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase">3D View</span>
          </button>

          {/* Image Thumbnails */}
          {images.map((img, idx) => (
            <button
              key={img}
              onClick={() => setSelectedImage(img)}
              className={`
                relative w-16 h-16 shrink-0 bg-[#f8f8f8] rounded-lg overflow-hidden transition-all border 
                ${
                  selectedImage === img
                    ? "border-slate-900 ring-1 ring-slate-900/20 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100 hover:bg-gray-200"
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
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>

        {/* Main Display */}
        <div
          className="flex-1 relative aspect-square lg:aspect-auto lg:h-[450px] bg-[#f8f8f8] rounded-xl overflow-hidden group border border-transparent hover:border-gray-200 transition-colors cursor-zoom-in"
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
            className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* 3D Button Overlay */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal(MODAL_TYPES.THREE_D);
              }}
              className="flex items-center gap-2 bg-white/90 backdrop-blur shadow-sm border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-0.5"
              aria-label="Open 360° 3D view"
              type="button"
            >
              <Rotate3D className="w-4 h-4" />
              <span>360° View</span>
            </button>
          </div>

          {/* Zoom Hint */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white/80 backdrop-blur p-2 rounded-lg text-gray-500 shadow-sm flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span className="text-xs font-bold">Click to Zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN MODAL */}
      {activeModal !== MODAL_TYPES.NONE && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
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
            className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all group"
            aria-label="Close viewer (ESC)"
            type="button"
          >
            <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
          </button>

          {/* Modal Content */}
          <div className="w-full h-full relative flex items-center justify-center p-4">
            {/* 3D VIEW WITH ALL NEW FEATURES */}
            {activeModal === MODAL_TYPES.THREE_D && (
              <>
                {/* Header with Title */}
                <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-3 items-end pointer-events-none">
                  <h3 className="text-xl font-bold font-oswald uppercase tracking-widest">
                    3D Inspection
                  </h3>
                  <p className="text-white/50 text-xs">
                    Drag to rotate • Scroll to zoom
                  </p>
                  {/* {enable3DScreenshot && (
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
                  )} */}
                </div>

                {/* Trình xem 3D nâng cao với tất cả tính năng*/}
                <KeyboardViewer
                  className="w-full h-full"
                  autoRotate={false}
                  enableZoom={true}
                  enableScreenshot={enable3DScreenshot}
                  enableFPS={enable3DFPS}
                  enableGestures={enable3DGestures}
                  modelType={modelType}
                  environmentPreset={environmentPreset}
                  // onScreenshot={handle3DScreenshot}
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
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-medium">
                  Press ESC to close
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
