"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Box, X, Rotate3D, Maximize, ZoomIn } from "lucide-react";

const KeyboardViewer = dynamic(
  () => import("@/src/components/3d/scenes/KeyboardViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 animate-pulse">
        <Box className="w-12 h-12 animate-bounce mb-4 text-white" />
        <span className="text-xs font-bold uppercase tracking-widest text-white">
          Loading Model...
        </span>
      </div>
    ),
  }
);

interface ProductGalleryProps {
  images: string[];
}

type ModalType = "NONE" | "3D" | "IMAGE";

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const [activeModal, setActiveModal] = useState<ModalType>("NONE");

  useEffect(() => {
    if (activeModal !== "NONE") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModal("NONE");
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [activeModal]);

  return (
    <>
      {/*  MAIN GALLERY  */}
      <div className="flex flex-col-reverse lg:flex-row gap-3 w-full h-full select-none">
        {/* 1. Thumbnails List */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-hide shrink-0 lg:w-16 lg:h-[450px]">
          {/* Nút mở 3D riêng biệt */}
          <button
            onClick={() => setActiveModal("3D")}
            className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden transition-all border flex flex-col items-center justify-center gap-1 bg-slate-900 text-white hover:bg-slate-800 border-transparent shadow-md group"
          >
            <Box className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase">3D View</span>
          </button>

          {/* List ảnh */}
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`
                relative w-16 h-16 shrink-0 bg-[#f8f8f8] rounded-lg overflow-hidden transition-all border 
                ${
                  selectedImage === img
                    ? "border-slate-900 ring-1 ring-slate-900/20 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100 hover:bg-gray-200"
                }
              `}
            >
              <Image
                src={img}
                alt={`Thumb ${idx}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>

        {/* 2. Main Display */}
        <div
          className="flex-1 relative aspect-square lg:aspect-auto lg:h-[450px] bg-[#f8f8f8] rounded-xl overflow-hidden group border border-transparent hover:border-gray-200 transition-colors cursor-zoom-in"
          onClick={() => setActiveModal("IMAGE")}
        >
          <Image
            src={selectedImage}
            alt="Product Main"
            fill
            className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal("3D");
              }}
              className="flex items-center gap-2 bg-white/90 backdrop-blur shadow-sm border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-0.5"
            >
              <Rotate3D className="w-4 h-4" />
              <span>360° View</span>
            </button>
          </div>

          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/80 backdrop-blur p-2 rounded-lg text-gray-500 shadow-sm flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span className="text-xs font-bold">Zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/*  FULLSCREEN MODAL */}
      {activeModal !== "NONE" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={() => setActiveModal("NONE")}
            className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all group"
          >
            <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
          </button>

          {/* --- LOGIC HIỂN THỊ NỘI DUNG MODAL --- */}
          <div className="w-full h-full relative flex items-center justify-center p-4">
            {/* TRƯỜNG HỢP 1: XEM 3D */}
            {activeModal === "3D" && (
              <>
                <div className="absolute top-6 left-6 z-40 text-white pointer-events-none select-none">
                  <h3 className="text-xl font-bold font-oswald uppercase tracking-widest">
                    3D Inspection
                  </h3>
                  <p className="text-white/50 text-xs">
                    Drag to rotate • Scroll to zoom
                  </p>
                </div>
                <KeyboardViewer
                  className="w-full h-full"
                  autoRotate={false}
                  enableZoom={true}
                />
              </>
            )}

            {activeModal === "IMAGE" && (
              <div className="relative w-full h-full max-w-5xl max-h-screen">
                <Image
                  src={selectedImage}
                  alt="Fullscreen view"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-medium">
                  Nhấn ESC để thoát
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
