import { Footer } from "@/src/components/Footer/Footer";
import { Header } from "@/src/components/Header/Header";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Oswald } from "next/font/google";


const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO - Community",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function CommissionsPoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
    >
      <LayoutWrapper>
        <div className="sticky top-0 z-40">
          <Header />
        </div>

        <main className="flex-grow">{children}</main>
        <Footer />
      </LayoutWrapper>
    </div>
  );
}