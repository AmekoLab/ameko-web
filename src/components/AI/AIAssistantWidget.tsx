"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import AIRecommendModal from "./AIRecommendModal";

interface AIAssistantWidgetProps {
  shopId?: string;
  baseKitId?: string;
  assembledProductId?: string;
}

export default function AIAssistantWidget({
  shopId,
  baseKitId,
  assembledProductId,
}: AIAssistantWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group fixed bottom-28 right-6 z-[99]">
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
          AI Tư Vấn
        </span>

        <button
          type="button"
          onClick={() => setIsModalOpen((prev) => !prev)}
          className="fixed bottom-28 right-6 z-[99] flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95"
          aria-label={isModalOpen ? "Đóng AI Tư Vấn" : "Mở AI Tư Vấn"}
        >
          {isModalOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Sparkles className="h-6 w-6 animate-pulse" />
          )}
        </button>
      </div>

      <AIRecommendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shopId={shopId}
        baseKitId={baseKitId}
        assembledProductId={assembledProductId}
      />
    </>
  );
}
