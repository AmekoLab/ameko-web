import type { Metadata } from "next";
import AuthProvider from "@/src/providers/AuthProvider";

export const metadata: Metadata = {
  title: "AMEKO - Messages",
  description: "Chat with shops and community members",
};

// Chat page uses its own full-screen layout — no header/footer/padding wrapper.
// AuthProvider is required here so checkTokenAndFetchProfile runs on hard reload
// and isAuthInitialized reaches true (preventing the infinite spinner in ChatPage).
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
