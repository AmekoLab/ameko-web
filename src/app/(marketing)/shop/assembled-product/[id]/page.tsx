"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, XCircle, Layers, Music } from "lucide-react";

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
    <div className="border-t border-gray-100 pt-16 mb-20">
      <h3 className="text-xl font-black uppercase tracking-tight mb-2 font-oswald">
        Build Components
      </h3>
      <p className="text-sm text-gray-400 mb-8">
        Every part hand-selected and assembled for the perfect typing
        experience.
      </p>

      {Object.entries(grouped).map(([kitName, components]) => (
        <div key={kitName} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#ce2a32]" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">
              Base Kit: {kitName}
            </h4>
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Component</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-center">Sound Test</div>
            </div>
            {components.map((comp, idx) => (
              <div
                key={comp.id || idx}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 last:border-0 items-center hover:bg-white transition-colors"
              >
                <div className="col-span-1 text-xs text-gray-400 font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-gray-900">
                    {comp.componentName || comp.componentId}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <span className="inline-flex items-center justify-center bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-bold">
                    ×{comp.quantity}
                  </span>
                </div>
                <div className="col-span-3 text-center">
                  {comp.soundUrl ? (
                    <a
                      href={comp.soundUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ce2a32] hover:underline uppercase tracking-wider"
                    >
                      <Music className="w-3 h-3" />
                      Listen
                    </a>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
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
      <div className="max-w-[1080px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-2 py-6">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          <div className="lg:col-span-7">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 w-20">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded" />
                ))}
              </div>
              <div className="flex-1 aspect-square bg-gray-200 rounded" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-full bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 w-48 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded mt-4" />
            <div className="h-12 w-full bg-gray-200 rounded mt-4" />
          </div>
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
      <div className="bg-white min-h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            {error || "The assembled product you're looking for doesn't exist."}
          </p>
          <Link
            href="/shop/all-products"
            className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#ce2a32] hover:underline mt-2"
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
    <div className="bg-white min-h-screen pb-16 overflow-x-hidden w-full font-sans text-slate-900">
      <div className="max-w-[1080px] mx-auto px-4 lg:px-6">
        {/* --- BREADCRUMB --- */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-6 overflow-hidden whitespace-nowrap w-full">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link
            href="/shop/all-products"
            className="hover:text-black transition-colors"
          >
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-black truncate min-w-0">{product.name}</span>
        </nav>

        {/* --- MAIN SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          {/* Gallery — reuses ProductGallery with view3DUrl for direct 3D */}
          <div className="lg:col-span-7 w-full">
            <ProductGallery
              images={product.images}
              productName={product.name}
              productId={product.id}
              view3DUrl={assembledProduct.view3DUrl || undefined}
              enable3DScreenshot={false}
              enable3DFPS={false}
            />
          </div>

          {/* Product Info — reuses ProductInfo */}
          <div className="lg:col-span-5 pt-1 sticky top-6">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* --- SOUND TEST --- */}
        {soundTestUrl && (
          <div className="mt-16 mb-24">
            <SoundTestSection
              videoUrl={soundTestUrl}
              description={`Listen to the satisfying sound of the ${product.name}. Each component has been carefully selected to create the perfect acoustic profile.`}
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
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <>
                  <p>{product.shortDesc}</p>
                  <p>
                    Designed for enthusiasts, gamers, and professionals alike,
                    the{" "}
                    <strong className="text-slate-900">{product.name}</strong>{" "}
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
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 font-oswald">
              Technical Specs
            </h3>
            <ProductSpecs specs={product.specs} />
          </div>
        </div>

        {/* --- BUILD COMPONENTS  --- */}
        {assembledProduct.details && assembledProduct.details.length > 0 && (
          <ComponentDetailsSection details={assembledProduct.details} />
        )}
      </div>
    </div>
  );
}
