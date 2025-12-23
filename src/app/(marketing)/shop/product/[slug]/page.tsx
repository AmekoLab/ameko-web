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

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, relatedProducts] = await Promise.all([
    ProductService.getBySlug(slug),
    ProductService.getRelated(slug),
  ]);

  if (!product) notFound();

  return (
    // 🔥 FIX: Thêm "overflow-x-hidden" vào đây để chặn scroll ngang
    // "w-full" để đảm bảo nó chiếm đúng chiều rộng có sẵn
    <div className="bg-white min-h-screen pb-16 overflow-x-hidden w-full">
      <div className="max-w-[1080px] mx-auto px-4 lg:px-6">
        {/* Breadcrumb: Thêm w-full để tránh text bị đẩy quá khổ */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-6 overflow-hidden whitespace-nowrap w-full">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          {/* Thêm min-w-0 để truncate hoạt động tốt trong flex */}
          <span className="text-black truncate min-w-0">{product.name}</span>
        </nav>

        {/* --- MAIN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} />
          </div>

          <div className="lg:col-span-5 pt-1">
            <ProductInfo product={product} relatedProducts={relatedProducts} />
          </div>
        </div>

        {product.soundTest && (
          <div className="mt-16">
            <SoundTestSection
              videoUrl={product.soundTest.videoUrl}
              description={product.soundTest.description}
            />
          </div>
        )}

        {/* --- DESCRIPTION & SPECS SECTION --- */}
        <div className="mt-24 border-t border-gray-100 pt-16">
          <div className="max-w-3xl mb-16">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 font-oswald">
              Product Description
            </h3>
            <div className="prose prose-sm text-gray-600 leading-relaxed text-sm">
              <p>{product.shortDesc}</p>
              <p>
                Designed for enthusiasts, gamers, and professionals alike, the{" "}
                {product.name} offers unparalleled customization and
                performance. With its gasket-mounted structure and tri-mode
                connectivity, it adapts seamlessly to any setup.
              </p>
              <p>
                The premium build quality ensures durability, while the
                hot-swappable PCB allows you to customize your typing experience
                without soldering.
              </p>
            </div>
          </div>

          <div className="w-full">
            <ProductSpecs specs={product.specs} />
          </div>
        </div>

        {/* --- COMPLETE SETUP --- */}
        {relatedProducts.length > 0 && (
          <div className="mb-20 pt-16 border-t border-gray-100">
            <CompleteSetup products={relatedProducts.slice(0, 3)} />
          </div>
        )}

        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsContainer slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}
