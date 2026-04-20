"use client";

import { useSearchParams } from "next/navigation";
import AIAssistantWidget from "./AIAssistantWidget";

export default function GlobalAIChatbot() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");

  return (
    <div className="fixed bottom-8 right-6 z-[9999]">
      <AIAssistantWidget shopId={shopId || undefined} />
    </div>
  );
}
