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
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        theme: "dark",
      });
      dispatch(fetchServerCart());
      dispatch(setCartOpen(true));
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      toast.error(
        e2.response?.data?.message ||
          "Failed to add item to cart. Please try again.",
        { position: "top-right", theme: "dark" },
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group/card relative flex flex-col h-full w-full overflow-hidden rounded-none transition-all duration-300 border border-transparent">
      {/* IMAGE AREA */}
      <Link
        href={`/shop/assembled-product/${product.id}`}
        className="relative block w-full aspect-square overflow-hidden shrink-0"
        style={{
          background:
            "radial-gradient(ellipse at center, #242424 0%, #0f0f0f 100%)",
        }}
      >
        {/* Diagonal stripe texture overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, #222324ff 38%, #141415ff 70%)",
          }}
        />

        {/* Badge */}
        {product.status !== "In Stock" && (
          <span className="absolute top-0 left-0 z-20 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none bg-black text-white">
            {product.status}
          </span>
        )}

        {/* Product Image */}
        <Image
          src={product.image || "/images/placeholder.png"}
          alt={product.name}
          fill
          className="object-contain relative z-10 transition-transform duration-500 ease-out group-hover/card:scale-[1.1]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </Link>

      {/* Thin separator */}
      <div className="w-full h-px shrink-0" />

      {/* INFO AREA */}
      <div className="px-4 py-4 flex flex-col flex-grow">
        {/* Category */}
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="text-[13px] font-bold text-white leading-snug uppercase tracking-wide line-clamp-2 min-h-[40px] mb-3">
          <Link href={`/shop/assembled-product/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <div className="mb-3">
          <p className="text-[18px] font-black text-white leading-none">
            {product.price}
          </p>
        </div>

        {/* Always-visible Add to Cart text link */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="mt-auto flex items-center gap-2 text-[#f5d800] hover:text-[#ffe500] hover:underline text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer w-fit disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm">
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
};
