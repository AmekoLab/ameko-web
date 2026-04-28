"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Check,
  XCircle,
  Truck,
  Package,
  RotateCcw,
  Loader2,
  Store,
  Star,
} from "lucide-react";
import { Product } from "@/src/types/product";
import { useAppDispatch } from "@/src/store/hook";
import { fetchServerCart, setCartOpen } from "@/src/store/slices/cartSlice";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";

interface ProductInfoProps {
  product: Product;
  relatedProducts?: Product[];
  shopId?: string;
  shopName?: string;
  logoUrl?: string;
}

export const ProductInfo = ({
  product,
  relatedProducts = [],
  shopId,
  shopName,
  logoUrl,
}: ProductInfoProps) => {
  const t = useTranslations("ProductInfo");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
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
    // Auth guard: redirect unauthenticated users to login
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info(t("loginRequired"), {
        position: "top-right",
        theme: "dark",
      });
      router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
      return;
    }

    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await orderService.addToCart({
        productId: product.id,
        quantity: quantity,
        isCustom: false,
      });
      toast.success(t("addedToCart", { name: product.name }), {
        position: "top-right",
        theme: "dark",
      });
      dispatch(fetchServerCart());
      dispatch(setCartOpen(true));
    } catch (err: any) {
      // Interceptor already unwraps to err.message
      const errorMessage = err?.message || err?.response?.data?.message || t("addToCartFailed");
      toast.error(errorMessage, {
        position: "top-right",
        theme: "dark",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      {/* ====================================================
          PRODUCT INFO PANEL
          ==================================================== */}
      <div className="flex flex-col gap-2 font-sans text-amazon-text justify-start ">
        {/* --- STATUS + NEW BADGE ROW --- */}
        <div className="relative flex items-center">
          {!isOutOfStock ? (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-amazon-link uppercase tracking-[0.22em]">
              <Check className="w-3.5 h-3.5" />
              {t("inStock")}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-amazon-textMuted uppercase tracking-[0.22em]">
              <XCircle className="w-3.5 h-3.5" />
              {t("outOfStock")}
            </span>
          )}
          <span className="absolute right-0 top-0 bg-amazon-btnSecondary text-amazon-text text-[14px] rounded-sm font-black uppercase tracking-[0.2em] px-2 py-0.5">
            {t("new")}
          </span>
        </div>

        {/* --- SHOP BADGE --- */}
        {shopId && shopName && (
          <Link
            href={`/profile/shop/${shopId}`}
            className="group/shop flex items-center gap-3 bg-white  hover:shadow-sm rounded-sm px-3 py-2.5 transition-all duration-200 w-fit"
          >
            {/* Shop Logo */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-amazon-border group-hover/shop:border-amazon-focus transition-colors shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={shopName}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-amazon-textMuted" />
                </div>
              )}
            </div>
            {/* Shop Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amazon-textMuted leading-none mb-0.5">
                {t("soldBy")}
              </span>
              <span className="text-[20px] font-bold text-amazon-text group-hover/shop:text-amazon-link transition-colors truncate leading-tight">
                {shopName}
              </span>
            </div>
            {/* Arrow indicator */}
            {/* <svg
              className="w-3.5 h-3.5 text-gray-600 group-hover/shop:text-[#f5d800] transition-colors ml-1 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg> */}
          </Link>
        )}

        {/* --- PRODUCT NAME --- */}
        <h1 className="text-3xl lg:text-[32px] font-black uppercase tracking-tight leading-[1.1] mb-1">
          {product.name}
        </h1>

        {/* --- RATING & REVIEWS --- */}
        <div className="flex items-center gap-2 mb-4 mt-1">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-bold text-amazon-text">
              {product.rating}
            </span>
          </div>
          <span className="text-amazon-textMuted text-sm select-none">•</span>
          <button 
            type="button" 
            className="text-amazon-link text-sm hover:underline transition-all"
            onClick={() => {
              // Optional: Scroll to reviews section if you have one
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
          >
            {product.reviewsCount || 0} {t("reviews") || "đánh giá"}
          </button>
        </div>

        {/* --- FEATURE BULLETS --- */}
        {product.specs && (
          <ul className="space-y-1">
            {product.specs.layout && (
              <li className="text-[14px] text-amazon-link flex items-start gap-1">
                <span className="text-amazon-textMuted mt-0.5 select-none">
                  —
                </span>
                {t("layout")}: {product.specs.layout}
              </li>
            )}
            {product.specs.mounting && (
              <li className="text-[14px] text-amazon-link flex items-start gap-1">
                <span className="text-amazon-textMuted  select-none">—</span>
                {t("mounting")}: {product.specs.mounting}
              </li>
            )}
            {product.specs.pcb && (
              <li className="text-[14px] text-amazon-link flex items-start gap-1">
                <span className="text-amazon-textMuted  select-none">—</span>
                {t("pcb")}: {product.specs.pcb}
              </li>
            )}
            {product.specs.connection && (
              <li className="text-[14px] text-amazon-link flex items-start gap-1">
                <span className="text-amazon-textMuted  select-none">—</span>
                {t("connection")}: {product.specs.connection}
              </li>
            )}
            {product.shortDesc && (
              <li className="text-[14px] text-amazon-link flex items-start gap-1">
                <span className="text-amazon-textMuted  select-none">—</span>
                {product.shortDesc}
              </li>
            )}
          </ul>
        )}

        {/* --- PRICE BLOCK --- */}
        <div>
          <div className="text-[20px] font-black leading-none text-amazon-price">
            {formatPrice(product.basePrice)}
          </div>
          {product.originalPrice && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[18px] text-amazon-textMuted line-through decoration-1">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[14px] font-black bg-amazon-price text-white rounded-sm px-2 py-0.5">
                -{discountPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* --- STOCK NOTICE BOX --- */}
        <div className="bg-white border border-amazon-border rounded-sm p-2">
          <p className="text-[10px] text-amazon-textMuted leading-relaxed text-left tracking-wider">
            {t("stockNotice")}
          </p>
        </div>

        {/* --- BUNDLE AND SAVE --- */}
        {relatedProducts.length > 0 && (
          <div>
            <p className="text-[13px] font-black text-amazon-text uppercase tracking-[0.12em] mb-1">
              {t("bundleAndSave")}
            </p>
            <p className="text-[12px] text-amazon-textMuted mb-3">
              {t("bundleDiscount")}
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {relatedProducts.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/product/${item.slug}`}
                  className="group shrink-0 block"
                >
                  <div className="w-16 h-16 border border-amazon-border hover:border-amazon-focus transition-colors bg-white shadow-sm relative overflow-hidden">
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
          <div className="flex items-center justify-between border border-amazon-border bg-white rounded-md shadow-sm w-[120px] transition-colors shrink-0">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="w-10 h-full flex items-center justify-center text-amazon-text hover:bg-neutral-100 text-lg font-black transition-colors disabled:opacity-30"
              disabled={isOutOfStock}
              type="button"
              aria-label={t("decreaseQuantityAria")}
            >
              −
            </button>
            <span className="font-black text-sm text-amazon-text select-none">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="w-10 h-full flex items-center justify-center text-amazon-text hover:bg-neutral-100 text-lg font-black transition-colors disabled:opacity-30"
              disabled={isOutOfStock}
              type="button"
              aria-label={t("increaseQuantityAria")}
            >
              +
            </button>
          </div>

          {/* Add to Cart Button — solid yellow block */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            type="button"
            className={`flex-1 h-full flex items-center justify-center gap-2 text-[14px] font-black uppercase tracking-[0.2em] transition-colors active:scale-[0.98] rounded-full
              ${
                isOutOfStock || isAddingToCart
                  ? "bg-neutral-200 text-amazon-textMuted cursor-not-allowed"
                  : "bg-amazon-btnPrimary hover:brightness-95 text-amazon-text"
              }
            `}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("adding")}
              </>
            ) : isOutOfStock ? (
              t("outOfStock")
            ) : (
              t("addToCart")
            )}
          </button>
        </div>

        {/* Price repeat below CTA */}
        {/* <div className="text-right text-[13px] font-black text-white -mt-2">
          {formatPrice(product.basePrice)}
        </div> */}

        {/* --- SHIPPING INFO BOX --- */}
        <div className="bg-white border border-amazon-border rounded-md p-3 space-y-4 mt-4">
          {/* Free shipping row */}
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amazon-link shrink-0" />
            <p className="text-[12px] text-amazon-textMuted">
              {t("qualifiesFor")}{" "}
              <span className="text-amazon-text font-bold">
                {t("freeShipping")}
              </span>
            </p>
          </div>
          {/* Delivery row */}
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-amazon-link shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-amazon-textMuted">
                {t("orderTodayTo")}{" "}
                <span className="text-amazon-text font-bold">
                  {t("receiveIncentives")}
                </span>
              </p>
            </div>
            <span className="flex items-center gap-1 border border-amazon-link text-amazon-link bg-neutral-50 text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 shrink-0">
              <RotateCcw className="w-2.5 h-2.5" />
              {t("day30")}
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
            <Check className="w-4 h-4 text-amazon-link shrink-0" />
            <span className="text-[12px] font-medium text-amazon-textMuted">
              {t("trustSatisfaction")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amazon-link shrink-0" />
            <span className="text-[12px] font-medium text-amazon-textMuted">
              {t("trustPremium")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amazon-link shrink-0" />
            <span className="text-[12px] font-medium text-amazon-textMuted">
              {t("trustFastShipping")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amazon-link shrink-0" />
            <span className="text-[12px] font-medium text-amazon-textMuted">
              {t("trustSupport247")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amazon-link shrink-0" />
            <span className="text-[12px] font-medium text-amazon-textMuted">
              {t("trustEasyReturns")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-amazon-link shrink-0" />
            <span className="text-[12px] font-medium text-amazon-textMuted">
              {t("trustSecurePayments")}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================
          STICKY BOTTOM BAR
          ==================================================== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-amazon-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 ${
          isStickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-[1080px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: product name */}
          <p className="text-sm font-bold text-amazon-text truncate min-w-0 hidden sm:block">
            {product.name}
          </p>
          {/* Right: price + button */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="text-lg font-black text-amazon-price">
              {formatPrice(product.basePrice)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              type="button"
              className="h-10 px-6 bg-amazon-btnPrimary hover:brightness-95 rounded-full text-amazon-text text-[11px] font-black uppercase tracking-[0.18em] transition-all disabled:bg-neutral-200 disabled:text-amazon-textMuted disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("adding")}
                </>
              ) : (
                t("addToCart")
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
