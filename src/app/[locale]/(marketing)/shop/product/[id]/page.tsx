import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductService } from "@/src/services/product.service";
import { ProductGallery } from "@/src/components/Product/ProductGallery";
import { ProductInfo } from "@/src/components/Product/ProductInfo";
import { ProductSpecs } from "@/src/components/Product/ProductSpecs";
import { SoundTestSection } from "@/src/components/Product/SoundTestSection";
import { ReviewsContainer } from "@/src/components/Product/Reviews/ReviewsContainer";
import { CompleteSetup } from "@/src/components/Product/CompleteSetup";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. SEO Metadata
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await ProductService.getBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Ameko Store`,
    description: product.shortDesc,
    openGraph: { images: [product.images[0]] },
  };
}

// 2. Skeleton Loading cho phần Reviews
const ReviewsSkeleton = () => (
  <div className="mt-16 pt-8 border-t border-gray-100 animate-pulse">
    <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 h-48 bg-gray-100 rounded"></div>
      <div className="lg:col-span-8 space-y-3">
        <div className="h-24 bg-gray-100 rounded"></div>
        <div className="h-24 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>
);

// 3. Main Page Component
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch dữ liệu song song (Parallel Data Fetching) giúp load trang nhanh hơn
  const [product, relatedProducts] = await Promise.all([
    ProductService.getBySlug(slug),
    ProductService.getRelated(slug),
  ]);

  if (!product) notFound();

  return (
    <div className="bg-white min-h-screen pb-16 overflow-x-hidden w-full font-sans text-slate-900">
      <div className="max-w-[1080px] mx-auto px-4 lg:px-6">
        {/* --- BREADCRUMB --- */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-6 overflow-hidden whitespace-nowrap w-full">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-black truncate min-w-0">{product.name}</span>
        </nav>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          {/*  Gallery ) */}
          <div className="lg:col-span-7 w-full">
            <ProductGallery
              images={product.images}
              productName={product.name}
              productId={product.model3dId || "keyboard-gaming-pro"}
              enable3DScreenshot={false}
              enable3DFPS={false}
            />
          </div>

          {/* Thông tin mua hàng */}
          <div className="lg:col-span-5 pt-1 sticky top-6">
            <ProductInfo product={product} relatedProducts={relatedProducts} />
          </div>
        </div>

        {/* --- SOUND TEST --- */}
        {product.soundTest && (
          <div className="mt-16 mb-24">
            <SoundTestSection
              videoUrl={product.soundTest.videoUrl}
              description={product.soundTest.description}
            />
          </div>
        )}

        {/* --- DESCRIPTION & SPECS --- */}
        <div className="border-t border-gray-100 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 font-oswald">
              Product Description
            </h3>
            <div className="prose prose-sm text-gray-600 leading-relaxed">
              <p>{product.shortDesc}</p>
              <p>
                Designed for enthusiasts, gamers, and professionals alike, the{" "}
                <strong className="text-slate-900">{product.name}</strong>{" "}
                offers unparalleled customization and performance. With its
                gasket-mounted structure and tri-mode connectivity, it adapts
                seamlessly to any setup.
              </p>
              <p>
                The premium build quality ensures durability, while the
                hot-swappable PCB allows you to customize your typing experience
                without soldering.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 font-oswald">
              Technical Specs
            </h3>
            <ProductSpecs specs={product.specs} />
          </div>
        </div>

        {/* --- COMPLETE SETUP (Cross-sell) --- */}
        {relatedProducts.length > 0 && (
          <div className="mb-20 pt-16 border-t border-gray-100">
            <CompleteSetup products={relatedProducts.slice(0, 3)} />
          </div>
        )}

        {/* --- REVIEWS --- */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsContainer slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}
