import { Oswald } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../wrapper/LayoutWrapper";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

// Cấu hình font
const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "Cherry Xtrfy - Gaming Gear",
  description: "Bàn phím, chuột và phụ kiện gaming cao cấp",
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
          <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">{children}</main>

            <Footer />
          </div>
        </LayoutWrapper>
      </body>
    </html>
  );
}
