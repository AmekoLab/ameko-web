"use client";

import { useSearchParams } from "next/navigation";
import AIAssistantWidget from "./AIAssistantWidget";

export default function GlobalAIChatbot() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");

  return <AIAssistantWidget shopId={shopId || undefined} />;
}
