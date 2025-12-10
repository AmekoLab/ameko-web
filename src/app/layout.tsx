import { Oswald } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../wrapper/LayoutWrapper";
import AuthProvider from "../providers/AuthProvider";

const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "My App",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={font.className}>
        <LayoutWrapper>
          <AuthProvider>{children}</AuthProvider>
        </LayoutWrapper>
      </body>
    </html>
  );
}
