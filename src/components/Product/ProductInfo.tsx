"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  XCircle,
  Truck,
  Package,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Product } from "@/src/types/product";
import { useAppDispatch } from "@/src/store/hook";
import {
  fetchServerCart,
  setCartOpen,
} from "@/src/store/slices/cartSlice";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";

interface ProductInfoProps {
  product: Product;
  relatedProducts?: Product[];
}

export const ProductInfo = ({
  product,
  relatedProducts = [],
}: ProductInfoProps) => {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Sticky bar state
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for sticky bar
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Discount calculation
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.basePrice) / product.originalPrice) *
          100,
      )
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const isOutOfStock = product.status === "OUT_OF_STOCK";

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await orderService.addToCart({
        productId: product.id,
        quantity: quantity,
        isCustom: false,
      });
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        theme: "dark",
      });
      dispatch(fetchServerCart());
      dispatch(setCartOpen(true));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        e.response?.data?.message || "Failed to add item to cart. Please try again.",
        { position: "top-right", theme: "dark" },
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      {/* ====================================================
          PRODUCT INFO PANEL
          ==================================================== */}
      <div className="flex flex-col gap-6 font-sans text-white justify-start pt-4">

        {/* --- STATUS + NEW BADGE ROW --- */}
        <div className="relative flex items-center">
          {!isOutOfStock ? (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-[#f5d800] uppercase tracking-[0.22em]">
              <Check className="w-3.5 h-3.5" />
              In Stock
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-gray-500 uppercase tracking-[0.22em]">
              <XCircle className="w-3.5 h-3.5" />
              Out of Stock
            </span>
          )}
          <span className="absolute right-0 top-0 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
            NEW
          </span>
        </div>

        {/* --- PRODUCT NAME --- */}
        <h1 className="text-3xl lg:text-[32px] font-black uppercase tracking-tight leading-[1.1] mb-2">
          {product.name}
        </h1>

        {/* --- FEATURE BULLETS --- */}
        {product.specs && (
          <ul className="space-y-2 mb-6">
            {product.specs.layout && (
              <li className="text-[14px] text-gray-100 flex items-start gap-3">
                <span className="text-gray-600 mt-0.5 select-none">—</span>
                Layout: {product.specs.layout}
              </li>
            )}
            {product.specs.mounting && (
              <li className="text-[14px] text-gray-100 flex items-start gap-3">
                <span className="text-gray-600 mt-0.5 select-none">—</span>
                Mounting: {product.specs.mounting}
              </li>
            )}
            {product.specs.pcb && (
              <li className="text-[14px] text-gray-100 flex items-start gap-3">
                <span className="text-gray-600 mt-0.5 select-none">—</span>
                PCB: {product.specs.pcb}
              </li>
            )}
            {product.specs.connection && (
              <li className="text-[14px] text-gray-100 flex items-start gap-3">
                <span className="text-gray-600 mt-0.5 select-none">—</span>
                Connection: {product.specs.connection}
              </li>
            )}
            {product.shortDesc && (
              <li className="text-[14px] text-gray-100 flex items-start gap-3">
                <span className="text-gray-600 mt-0.5 select-none">—</span>
                {product.shortDesc}
              </li>
            )}
          </ul>
        )}

        {/* --- PRICE BLOCK --- */}
        <div>
          <div className="text-sm font-black leading-none mb-1 text-white">
            {formatPrice(product.basePrice)}
          </div>
          {product.originalPrice && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500 line-through decoration-1">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[11px] font-black bg-[#f5d800] text-black px-2 py-0.5">
                -{discountPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* --- STOCK NOTICE BOX --- */}
        <div className=" bg-white/100 rounded-sm p-2">
          <p className="text-[10px] text-gray-800 leading-relaxed text-left  tracking-wider">
            Due to exceptionally high demand and limited stock,
            some orders may experience slight delays.
          </p>
        </div>

        {/* --- BUNDLE AND SAVE --- */}
        {relatedProducts.length > 0 && (
          <div>
            <p className="text-[13px] font-black text-white uppercase tracking-[0.12em] mb-1">
              Bundle and Save
            </p>
            <p className="text-[12px] text-gray-500 mb-3">
              Discount applied when purchased together
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {relatedProducts.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/product/${item.slug}`}
                  className="group shrink-0 block"
                >
                  <div className="w-16 h-16 border border-[#3a3a3a] hover:border-[#f5d800] transition-colors bg-[#1a1a1a] relative overflow-hidden">
                    <Image
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- CTA ROW --- */}
        <div ref={ctaRef} className="flex gap-4 h-[56px] w-full mt-2">
          {/* Quantity Selector — clean bordered box, text +/- buttons */}
          <div className="flex items-center justify-between border-2 border-[#333] hover:border-[#555] bg-black w-[120px] transition-colors shrink-0">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white text-lg font-black transition-colors disabled:opacity-30"
              disabled={isOutOfStock}
              type="button"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="font-black text-sm text-white select-none">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white text-lg font-black transition-colors disabled:opacity-30"
              disabled={isOutOfStock}
              type="button"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button — solid yellow block */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            type="button"
            className={`flex-1 h-full flex items-center justify-center gap-2 text-[14px] font-black uppercase tracking-[0.2em] transition-colors active:scale-[0.98]
              ${
                isOutOfStock || isAddingToCart
                  ? "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                  : "bg-[#f5d800] hover:bg-[#ffe500] text-black"
              }
            `}
          >
            {isAddingToCart ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>

        {/* Price repeat below CTA */}
        {/* <div className="text-right text-[13px] font-black text-white -mt-2">
          {formatPrice(product.basePrice)}
        </div> */}

        {/* --- SHIPPING INFO BOX --- */}
        <div className="bg-[#111] border border-white/10 p-5 space-y-4 mt-4">
          {/* Free shipping row */}
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-[#f5d800] shrink-0" />
            <p className="text-[12px] text-gray-400">
              This product qualifies for{" "}
              <span className="text-white font-bold">free shipping</span>
            </p>
          </div>
          {/* Delivery row */}
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-[#f5d800] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-gray-400">
                Order today for estimated delivery by{" "}
                <span className="text-white font-bold">03/18–03/19/2026</span>
              </p>
            </div>
            <span className="flex items-center gap-1 border border-[#f5d800] text-[#f5d800] text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 shrink-0">
              <RotateCcw className="w-2.5 h-2.5" />
              60-day
            </span>
          </div>
        </div>

        {/* --- KLARNA LINE --- */}
        {/* <p className="text-[12px] text-gray-500">
          From{" "}
          <span className="text-white font-bold">
            {formatPrice(product.basePrice / 4)}/mo
          </span>
          , or 4 payments at 0% interest with{" "}
          <span className="text-[#f5d800] font-bold">Klarna</span>.{" "} */}
          {/* <button
            type="button"
            className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors"
          >
            Check purchase power
          </button> */}
        {/* </p> */}


        {/* --- GUARANTEES / TRUST BADGES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-2">
          
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[#f5d800] shrink-0" />
            <span className="text-[12px] font-medium text-gray-400">
              100% Satisfaction Guarantee
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[#f5d800] shrink-0" />
            <span className="text-[12px] font-medium text-gray-400">
              Premium Quality
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[#f5d800] shrink-0" />
            <span className="text-[12px] font-medium text-gray-400">
              Fast Shipping
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[#f5d800] shrink-0" />
            <span className="text-[12px] font-medium text-gray-400">
              24/7 Customer Support
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[#f5d800] shrink-0" />
            <span className="text-[12px] font-medium text-gray-400">
              Easy Returns
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-[#f5d800] shrink-0" />
            <span className="text-[12px] font-medium text-gray-400">
              Secure Payments
            </span>
          </div>

        

        </div>
      </div>


      {/* ====================================================
          STICKY BOTTOM BAR
          ==================================================== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-white/10 shadow-2xl transition-transform duration-300 ${
          isStickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-[1080px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: product name */}
          <p className="text-sm font-bold text-white truncate min-w-0 hidden sm:block">
            {product.name}
          </p>
          {/* Right: price + button */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="text-lg font-black text-white">
              {formatPrice(product.basePrice)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              type="button"
              className="h-10 px-6 bg-[#f5d800] hover:bg-[#ffe014] text-black text-[11px] font-black uppercase tracking-[0.18em] transition-all disabled:bg-[#2a2a2a] disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAddingToCart ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
