import { Oswald } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../wrapper/LayoutWrapper";

const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "My App",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={font.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
