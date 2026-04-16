"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Product } from "@/src/types/product";
import { useAppDispatch } from "@/src/store/hook";
import { fetchServerCart, setCartOpen } from "@/src/store/slices/cartSlice";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
  /** Override the default product link path */
  href?: string;
}

export const ProductCard: FC<ProductCardProps> = ({ product, href }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("ProductCard");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const thumbnail =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder.png";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Auth guard: redirect unauthenticated users to login
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info(t("loginRequired"), {
        position: "top-right",
        theme: "dark",
      });
    setTimeout(() => {
    router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }, 2000);
      return;
    }

    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await orderService.addToCart({
        productId: product.id,
        quantity: 1,
        isCustom: false,
      });
      toast.success(t("addedToCart", { productName: product.name }), {
        position: "top-right",
        theme: "dark",
      
      });
      dispatch(fetchServerCart());
      dispatch(setCartOpen(true));
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      toast.error(
        e2.response?.data?.message || t("addFailed"),
        { position: "top-right", theme: "dark" },
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Badge colour logic
  const badgeClass =
    product.tag === "SALE"
      ? "bg-amazon-price text-white"
      : product.tag === "NEW"
        ? "bg-amazon-btnSecondary text-amazon-text"
        : "bg-amazon-price text-white";

  return (
    <div className="group/card relative flex flex-col h-full w-full overflow-hidden rounded-none bg-white ">
      {/* Yellow power-stripe — appears on hover at the very top */}
      {/* <div className="absolute top-0 inset-x-0 h-[2px] bg-[#f5d800] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-30" /> */}

      {/* IMAGE AREA */}
      {/* IMAGE AREA */}
      <Link
        href={href || `/shop/product/${product.slug}`}
        className="relative block w-full aspect-square overflow-hidden shrink-0 bg-white"
      >
        {/* Diagonal stripe texture overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
        />

        {/* Badge */}
        {product.tag && (
          <span
            className={`absolute top-0 left-0 z-20 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none ${badgeClass}`}
          >
            {product.tag}
          </span>
        )}

        {/* Product Image */}
        <Image
          src={thumbnail}
          alt={product.name}
          fill
          className="object-contain  relative z-10 transition-transform duration-500 ease-out group-hover/card:scale-[1.1]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Slide-up ADD TO CART CTA */}
        {/* <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#f5d800] hover:bg-[#ffe500] text-black text-[11px] font-black uppercase tracking-[0.12em] transition-colors cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>Add to Cart</span>
          </button>
        </div> */}
      </Link>

      {/* Thin separator */}
      {/* <div className="w-full h-px  shrink-0" /> */}

      {/* INFO AREA */}
      <div className="px-4 py-2 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="text-[13px] font-bold text-amazon-link hover:text-amazon-hover leading-snug uppercase tracking-wide line-clamp-2 min-h-[25px]  ">
          <Link href={href || `/shop/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <div className="mb-1">
          <p className="text-[18px] font-bold text-amazon-price leading-none">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(product.basePrice)}
          </p>
        </div>

        {/* Always-visible Add to Cart text link */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="mt-auto flex items-center gap-2 text-amazon-text text-[12px] hover:text-amazon-focus hover:underline font-bold uppercase tracking-wider transition-colors cursor-pointer w-fit disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm">{isAddingToCart ? t("adding") : t("addToCart")}</span>
        </button>
      </div>
    </div>
  );
};
