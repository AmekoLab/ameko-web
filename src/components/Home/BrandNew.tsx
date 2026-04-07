"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "../Product/ProductCard";

import "swiper/css";
import "swiper/css/navigation";
import { ProductSkeleton } from "../Product/ProductSkeleton";
import { MOCK_PRODUCTS } from "@/src/data/product";
import { Product } from "@/src/types/product";

export const BrandNew: FC = () => {
  const swiperRef = useRef<SwiperType>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
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
              Brand New
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
            aria-label="Previous slide"
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
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
