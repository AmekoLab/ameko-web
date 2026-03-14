"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { XCircle, Layers, Music } from "lucide-react";

import { assembledProductService } from "@/src/services/assembledProduct.service";
import {
  AssembledProductItem,
  AssembledProductDetailItem,
} from "@/src/types/assembledProduct.types";
import { ProductGallery } from "@/src/components/Product/ProductGallery";
import { ProductInfo } from "@/src/components/Product/ProductInfo";
import { ProductSpecs } from "@/src/components/Product/ProductSpecs";
import { SoundTestSection } from "@/src/components/Product/SoundTestSection";
import type { Product, ProductSpecs as SpecsType } from "@/src/types/product";
import Link from "next/link";

/* ============================================================
   HELPER: Map AssembledProductItem → Product
   ============================================================ */

function mapToProduct(ap: AssembledProductItem): Product {
  const images = [ap.image1, ap.image2, ap.image3].filter(
    (img): img is string => Boolean(img),
  );

  const specs: SpecsType = {
    layout: ap.layout || "N/A",
    mounting: ap.mounting || "N/A",
    pcb: ap.pcb || "N/A",
    connection: ap.connection || "N/A",
    battery: ap.battery || undefined,
  };

  return {
    id: ap.id,
    slug: ap.slug || ap.id,
    name: ap.name,
    basePrice: ap.price,
    category: "Custom Assembled Keyboard",
    status: (ap.quantity ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    rating: 0,
    reviewsCount: 0,
    shortDesc:
      ap.description || "A fully assembled custom mechanical keyboard.",
    description: ap.description || undefined,
    features: [],
    images: images.length > 0 ? images : ["/placeholder.png"],
    model3dId: ap.id,
    specs,
    stockQuantity: ap.quantity ?? 0,
  };
}

/* ============================================================
   COMPONENT DETAILS SECTION
   ============================================================ */

function ComponentDetailsSection({
  details,
}: {
  details: AssembledProductDetailItem[];
}) {
  const grouped = details.reduce(
    (acc, detail) => {
      const kitName = detail.baseKitName || detail.baseKitId;
      if (!acc[kitName]) acc[kitName] = [];
      acc[kitName].push(detail);
      return acc;
    },
    {} as Record<string, AssembledProductDetailItem[]>,
  );

  return (
    <div className="pt-16 mb-20">
      {/* Section eyebrow */}
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f5d800] mb-2">
        Breakdown
      </p>
      <h3 className="text-2xl lg:text-[28px] font-black uppercase text-white mb-2 leading-tight">
        Build Components
      </h3>
      <p className="text-sm text-gray-400 mb-10">
        Every part hand-selected and assembled for the perfect typing
        experience.
      </p>

      {Object.entries(grouped).map(([kitName, components]) => (
        <div key={kitName} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#f5d800]" />
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-300">
              Base Kit: {kitName}
            </h4>
          </div>

          <div className="border border-white/10 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#1e1e1e] text-[10px] font-black uppercase tracking-widest text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Component</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-center">Sound Test</div>
            </div>

            {components.map((comp, idx) => (
              <div
                key={comp.id || idx}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 last:border-0 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-1 text-xs text-gray-500 font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-gray-200">
                    {comp.componentName || comp.componentId}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <span className="inline-flex items-center justify-center bg-[#1e1e1e] border border-white/10 px-2 py-0.5 text-xs font-bold text-gray-300">
                    ×{comp.quantity}
                  </span>
                </div>
                <div className="col-span-3 text-center">
                  {comp.soundUrl ? (
                    <a
                      href={comp.soundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-black text-[#f5d800] hover:underline uppercase tracking-wider"
                    >
                      <Music className="w-3 h-3" />
                      Listen
                    </a>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
   ============================================================ */

function PageSkeleton() {
  return (
    <div className="bg-[#0d0d0d] min-h-screen pb-16 overflow-x-hidden w-full font-sans animate-pulse">
      {/* Hero strip */}
      <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row border-b border-[#2a2d31]">
        {/* Gallery placeholder */}
        <div className="w-full lg:w-[65%] h-[600px] lg:h-[800px] bg-[radial-gradient(circle_at_center,_#1e2024_0%,_#0d0d0d_100%)]" />
        {/* Info placeholder */}
        <div className="w-full lg:w-[35%] bg-black border-l border-[#2a2d31] p-6 lg:p-12 space-y-5">
          <div className="h-3 w-16 bg-[#f5d800]/20" />
          <div className="h-7 w-full bg-white/10" />
          <div className="h-6 w-3/4 bg-white/10" />
          <div className="space-y-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-2.5 w-52 bg-white/10" />
            ))}
          </div>
          <div className="h-12 w-40 bg-white/10 mt-4" />
          <div className="h-[52px] w-full bg-white/10 mt-4" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE COMPONENT
   ============================================================ */

export default function AssembledProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [assembledProduct, setAssembledProduct] =
    useState<AssembledProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const response =
        await assembledProductService.getAssembledProductDetail(productId);
      setAssembledProduct(response.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // --- LOADING ---
  if (loading) return <PageSkeleton />;

  // --- ERROR ---
  if (error || !assembledProduct) {
    return (
      <div className="bg-[#0d0d0d] min-h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-[#f5d800]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Product Not Found
          </h2>
          <p className="text-sm text-gray-500 max-w-sm">
            {error || "The assembled product you're looking for doesn't exist."}
          </p>
          <Link
            href="/shop/all-products"
            className="inline-block text-[11px] font-black uppercase tracking-widest text-[#f5d800] hover:underline mt-2"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // --- MAP TO PRODUCT ---
  const product = mapToProduct(assembledProduct);

  // Extract soundUrl from the first detail item (data.details[0].soundUrl)
  const soundTestUrl = assembledProduct.details?.[0]?.soundUrl?.trim() || null;

  return (
    <div className="bg-[#0d0d0d] min-h-screen pb-16 w-full font-sans">

      {/* ================================================================
          HERO — Full-bleed 60 / 40 split, no max-width cap
          ================================================================ */}
      <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row items-start ">

        {/* Gallery — 60% left, sticky */}
        <div className="w-full lg:w-[55%] lg:sticky lg:top-[104px] z-10">
          <ProductGallery
            images={product.images}
            productName={product.name}
            productId={product.id}
            view3DUrl={assembledProduct.view3DUrl || undefined}
            enable3DScreenshot={false}
            enable3DFPS={false}
          />
        </div>

        {/* Product Info — 40% right, black panel */}
        <div className="w-full lg:w-[45%] bg-black p-6 lg:p-10 xl:p-14 ">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* ================================================================
          BELOW-FOLD — restricted readable width
          ================================================================ */}
      <div className="max-w-[1080px] mx-auto px-4 lg:px-6">
 
        {/* Sound Test */}
        {soundTestUrl && (
          <div className="py-8">
            <SoundTestSection
              videoUrl={soundTestUrl}
              description={`Listen to the satisfying sound of the ${product.name}. Each component has been carefully selected to create the perfect acoustic profile.`}
            />
          </div>
        )}

        {/* Description & Specs */}
        <div className=" pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f5d800] mb-2">
              Details
            </p>
            <h3 className="text-2xl lg:text-[28px] font-black uppercase text-white mb-6 leading-tight">
              Product Description
            </h3>
            <div className="text-[13px] text-gray-100 leading-relaxed space-y-4">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <>
                  <p>{product.shortDesc}</p>
                  <p>
                    Designed for enthusiasts, gamers, and professionals alike,
                    the{" "}
                    <strong className="text-white font-black">
                      {product.name}
                    </strong>{" "}
                    offers unparalleled customization and performance. With its
                    gasket-mounted structure and tri-mode connectivity, it
                    adapts seamlessly to any setup.
                  </p>
                  <p>
                    The premium build quality ensures durability, while the
                    hot-swappable PCB allows you to customize your typing
                    experience without soldering.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f5d800] mb-2">
              Specs
            </p>
            <h3 className="text-2xl lg:text-[28px] font-black uppercase text-white mb-6 leading-tight">
              Technical Specs
            </h3>
            <ProductSpecs specs={product.specs} />
          </div>
        </div>

        {/* Build Components */}
        {assembledProduct.details && assembledProduct.details.length > 0 && (
          <ComponentDetailsSection details={assembledProduct.details} />
        )}
      </div>
    </div>
  );
}
