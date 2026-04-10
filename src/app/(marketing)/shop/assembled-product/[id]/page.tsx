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
      <p className="text-[14px] font-black uppercase tracking-[0.3em] text-amazon-link mb-2">
        Breakdown
      </p>
      <h3 className="text-2xl lg:text-[28px] font-black uppercase text-amazon-text mb-2 leading-tight">
        Build Components
      </h3>
      <p className="text-sm text-amazon-textMuted mb-10">
        Every part hand-selected and assembled for the perfect typing
        experience.
      </p>

      {Object.entries(grouped).map(([kitName, components]) => (
        <div key={kitName} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-amazon-link" />
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-amazon-text">
              Base Kit: {kitName}
            </h4>
          </div>

          <div className="border border-amazon-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-amazon-textMuted">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Component</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-center">Sound Test</div>
            </div>

            {components.map((comp, idx) => (
              <div
                key={comp.id || idx}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-amazon-border last:border-0 items-center hover:bg-neutral-50 transition-colors"
              >
                <div className="col-span-1 text-xs text-amazon-textMuted font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-amazon-text">
                    {comp.componentName || comp.componentId}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <span className="inline-flex items-center justify-center bg-white border border-amazon-border px-2 py-0.5 text-xs font-bold text-amazon-text">
                    ×{comp.quantity}
                  </span>
                </div>
                <div className="col-span-3 text-center">
                  {comp.soundUrl ? (
                    <a
                      href={comp.soundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-black text-amazon-link hover:underline uppercase tracking-wider"
                    >
                      <Music className="w-3 h-3" />
                      Listen
                    </a>
                  ) : (
                    <span className="text-amazon-textMuted text-xs">—</span>
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
    <div className="bg-white min-h-screen pb-16 overflow-x-hidden w-full font-sans animate-pulse">
      {/* Hero strip */}
      <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row border-b border-amazon-border">
        {/* Gallery placeholder */}
        <div className="w-full lg:w-[65%] h-[600px] lg:h-[800px] bg-neutral-200" />
        {/* Info placeholder */}
        <div className="w-full lg:w-[35%] bg-white border-l border-amazon-border p-6 lg:p-12 space-y-5">
          <div className="h-3 w-16 bg-neutral-200" />
          <div className="h-7 w-full bg-neutral-200" />
          <div className="h-6 w-3/4 bg-neutral-200" />
          <div className="space-y-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-2.5 w-52 bg-neutral-200" />
            ))}
          </div>
          <div className="h-12 w-40 bg-neutral-200 mt-4" />
          <div className="h-[52px] w-full bg-neutral-200 mt-4" />
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
      <div className="bg-white min-h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white border border-amazon-border rounded-md shadow-sm flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-amazon-link" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-amazon-text">
            Product Not Found
          </h2>
          <p className="text-sm text-amazon-textMuted max-w-sm">
            {error || "The assembled product you're looking for doesn't exist."}
          </p>
          <Link
            href="/shop/all-products"
            className="inline-block text-[11px] font-black uppercase tracking-widest text-amazon-link hover:underline mt-2"
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
    <div className="bg-white min-h-screen pb-16 w-full font-sans overflow-x-clip">

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
        <div className="w-full lg:w-[45%] bg-white border-l border-amazon-border p-6 lg:p-10 xl:p-10 ">
          <ProductInfo
            product={product}
            shopId={assembledProduct.shopId}
            shopName={assembledProduct.shopName}
            logoUrl={assembledProduct.logoUrl}
          />
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
            <p className="text-[14px] font-black uppercase tracking-[0.3em] text-amazon-link mb-2">
              Details
            </p>
            <h3 className="text-2xl lg:text-[28px] font-black uppercase text-amazon-text mb-6 leading-tight">
              Product Description
            </h3>
            <div className="relative">
              <div
                className={`text-[13px] text-amazon-text leading-relaxed space-y-4 overflow-hidden transition-all duration-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:mx-auto [&_img]:my-6 [&_p]:mb-4 ${
                  isDescriptionExpanded ? "" : "max-h-[300px]"
                }`}
              >
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <>
                    <p>{product.shortDesc}</p>
                    <p>
                      Designed for enthusiasts, gamers, and professionals alike,
                      the{" "}
                      <strong className="text-amazon-text font-bold">
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
              
              {/* Fade out gradient when collapsed */}
              {!isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="mt-6 text-amazon-link hover:text-amazon-focus hover:underline text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              {isDescriptionExpanded ? "Show Less" : "Read More"}
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isDescriptionExpanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="lg:col-span-5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amazon-link mb-2">
              Specs
            </p>
            <h3 className="text-2xl lg:text-[28px] font-black uppercase text-amazon-text mb-6 leading-tight">
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
