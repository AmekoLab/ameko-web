"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "../Product/ProductCard";
import { useTranslations } from "next-intl";

import "swiper/css";
import "swiper/css/navigation";
import { ProductSkeleton } from "../Product/ProductSkeleton";
import { Product, ProductSpecs } from "@/src/types/product";
import { assembledProductService } from "@/src/services/assembledProduct.service";
import type { AssembledProductItem } from "@/src/types/assembledProduct.types";

function mapToProduct(ap: AssembledProductItem): Product {
  const images = [ap.image1, ap.image2, ap.image3].filter(
    (img): img is string => Boolean(img),
  );

  const specs: ProductSpecs = {
    layout: ap.layout || "N/A",
    mounting: ap.mounting || "N/A",
    pcb: ap.pcb || "N/A",
    connection: ap.connection || "N/A",
    battery: ap.battery || undefined,
  };

  return {
    id: ap.id,
    slug: ap.id,
    name: ap.name,
    basePrice: ap.price,
    category: "Assembled Keyboard",
    status: (ap.quantity ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    rating: 0,
    reviewsCount: 0,
    shortDesc: ap.description || "Custom assembled mechanical keyboard.",
    description: ap.description || undefined,
    features: [
      ap.layout ? `Layout: ${ap.layout}` : "",
      ap.mounting ? `Mounting: ${ap.mounting}` : "",
      ap.connection ? `Connection: ${ap.connection}` : "",
    ].filter(Boolean),
    images: images.length > 0 ? images : ["/placeholder.png"],
    model3dId: ap.id,
    specs,
    stockQuantity: ap.quantity ?? 0,
  };
}

export const BrandNew: FC = () => {
  const t = useTranslations("BrandNew");
  const swiperRef = useRef<SwiperType>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        const response = await assembledProductService.getAssembledProducts(1, 10);
        if (!cancelled) {
          const fetchedItems = response.data?.items ?? [];
          setProducts(fetchedItems.map(mapToProduct));
        }
      } catch (err) {
        console.error("Failed to fetch assembled products for BrandNew:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full py-12 bg-amazon-bg">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 relative ">
        {/* --- HEADER --- */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-amazon-text">
              {t("title")}
            </h2>
            <div className="h-1 w-12 bg-amazon-btnSecondary"></div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-black border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-1/2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("previousSlide")}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1400: { slidesPerView: 4 },
            }}
            loop={!loading}
            autoplay={
              loading
                ? false
                : {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
            }
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="w-full !pb-10 !px-2"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <SwiperSlide
                    key={`skeleton-${index}`}
                    className="!h-auto flex"
                  >
                    <ProductSkeleton />
                  </SwiperSlide>
                ))
              : products.map((product) => (
                  <SwiperSlide key={product.id} className="!h-auto flex">
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))}
          </Swiper>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-black border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-1/2 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("nextSlide")}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
