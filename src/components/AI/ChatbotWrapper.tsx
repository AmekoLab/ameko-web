"use client";

import { usePathname } from "next/navigation";
import GlobalAIChatbot from "./GlobalAIChatbot";

export default function ChatbotWrapper() {
  const pathname = usePathname();

  // Define routes where the Chatbot should NOT appear
  const hiddenRoutes = ["/login", "/register", "/"];

  // If the current path contains a hidden route (e.g. /vi/login, /en/register), don't render the chatbot
  if (hiddenRoutes.some(route => pathname?.includes(route))) {
    return null;
  }

  return <GlobalAIChatbot />;
}
