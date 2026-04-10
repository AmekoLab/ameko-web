import type { Metadata } from "next";
import AuthProvider from "@/src/providers/AuthProvider";
import { Oswald } from "next/font/google";

// Giữ lại Oswald variable để đồng bộ cấu trúc với các trang khác
const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
}); 

export const metadata: Metadata = {
  title: "AMEKO - Messages",
  description: "Chat with shops and community members",
};

// Chat page uses its own full-screen layout — no header/footer/padding wrapper.
// AuthProvider is required here so checkTokenAndFetchProfile runs on hard reload
// and isAuthInitialized reaches true (preventing the infinite spinner in ChatPage).
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>

      <div className={`flex flex-col h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}>
        {children}
      </div>
    </AuthProvider>
  );
}