"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Product } from "@/src/types/profile";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/src/store/hook";
import { fetchServerCart, setCartOpen } from "@/src/store/slices/cartSlice";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";

export const ProductCard: FC<{ product: Product }> = ({ product }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Auth guard: redirect unauthenticated users to login
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please login to add product to cart", {
        position: "top-right",
        theme: "light",
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
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        theme: "light",
      });
      dispatch(fetchServerCart());
      dispatch(setCartOpen(true));
    } catch (err: any) {
      // Interceptor already unwraps to err.message
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to add item to cart. Please try again.";
      toast.error(errorMessage, { position: "top-right", theme: "light" });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group/card relative flex flex-col h-full w-full overflow-hidden rounded-sm transition-all duration-300 border border-amazon-border bg-white shadow-sm hover:shadow-md">
      {/* IMAGE AREA */}
      <div
        className="relative block w-full aspect-square overflow-hidden shrink-0 bg-neutral-50"
      >
        {/* Diagonal stripe texture overlay removed for light theme */}

        {/* Badge */}
        {product.status !== "In Stock" && (
          <span className="absolute top-0 left-0 z-20 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-br-sm bg-neutral-200 text-amazon-text border-b border-r border-amazon-border">
            {product.status}
          </span>
        )}

        {/* Product Image */}
        <Link href={`/shop/assembled-product/${product.id}`}>
          <Image
            src={product.image || "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-contain relative z-10 transition-transform duration-500 ease-out group-hover/card:scale-[1.1]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>
      </div>

      {/* Thin separator */}
      <div className="w-full h-px shrink-0" />

      {/* INFO AREA */}
      <div className="px-4 py-4 flex flex-col flex-grow bg-white border-t border-amazon-border">
        {/* Category */}
        <p className="text-[10px] text-amazon-textMuted font-bold uppercase mb-1 tracking-wider">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="text-[13px] font-bold text-amazon-link leading-snug uppercase tracking-wide line-clamp-2 min-h-[25px] mb-1">
          <Link href={`/shop/assembled-product/${product.id}`} className="hover:text-amazon-link hover:underline transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <div className="mb-1">
          <p className="text-[18px] font-black text-amazon-price leading-none">
            {product.price}
          </p>
        </div>

        {/* Always-visible Add to Cart text link */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.shopIsActive === false}
          className="mt-auto flex items-center gap-2 text-amazon-text hover:text-amazon-focus hover:underline text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer w-fit disabled:opacity-60 disabled:cursor-not-allowed"
          title={product.shopIsActive === false ? "Shop đang tạm nghỉ" : ""}
        >
          {isAddingToCart ? (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm">
            {product.shopIsActive === false 
              ? "Shop đang tạm nghỉ" 
              : isAddingToCart 
                ? "Adding..." 
                : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
};
