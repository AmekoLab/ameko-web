"use client";
import { FC, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ImageModalProps {
  imgSrc: string | null;
  onClose: () => void;
}

export const ImageModal: FC<ImageModalProps> = ({ imgSrc, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (imgSrc) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [imgSrc, onClose]);

  if (!imgSrc) return null;

  return (
    <AnimatePresence>
      {imgSrc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Nút đóng (X) */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Wrapper Zoom */}
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Controls Buttons - Cố định ở dưới màn hình */}
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-black/60 px-6 py-3 rounded-full border border-white/10 shadow-xl"
                  onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua làm đóng modal
                >
                  <button
                    onClick={() => zoomIn()}
                    className="text-white/80 hover:text-white hover:scale-110 transition-all"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="text-white/80 hover:text-white hover:scale-110 transition-all"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="text-white/80 hover:text-white hover:scale-110 transition-all"
                    title="Reset"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Khu vực hiển thị ảnh */}
                <div
                  className="w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TransformComponent
                    wrapperStyle={{
                      width: "100vw",
                      height: "100vh",
                    }}
                    contentStyle={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100vw",
                      height: "100vh",
                    }}
                  >
                    {/* Ảnh chính */}
                    <Image
                      src={imgSrc}
                      alt="Preview"
                      width={1920}
                      height={1080}
                      className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain shadow-2xl"
                      priority
                    />
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
