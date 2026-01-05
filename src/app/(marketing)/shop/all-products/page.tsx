import ShopView from "@/src/components/Shop/ShopView";
import { Metadata } from "next";

// 1. Metadata cho SEO (Chỉ dùng được ở Server Component)
export const metadata: Metadata = {
  title: "All Products | Ameko Store",
  description:
    "Explore our premium collection of custom mechanical keyboards, switches, and accessories.",
  openGraph: {
    title: "All Products | Ameko Store",
    description:
      "Explore our premium collection of custom mechanical keyboards, switches, and accessories.",
    images: ["/images/og-shop.jpg"],
  },
};

export default function ShopPage() {
  return (
    // Component hiển thị chính (Logic filter/sort nằm ở đây)
    <ShopView />
  );
}
