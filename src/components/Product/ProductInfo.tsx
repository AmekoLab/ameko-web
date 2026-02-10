"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check, XCircle } from "lucide-react";
import { Product } from "@/src/types/product";
import { useAppDispatch } from "@/src/store/hook";
import { addToCart, setCartOpen } from "@/src/store/slices/cartSlice";
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

  // 1. Tính toán giảm giá
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.basePrice) / product.originalPrice) *
          100,
      )
    : 0;

  // Format price with thousand separators (USD)
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  // 2. Kiểm tra tồn kho
  const isOutOfStock = product.status === "OUT_OF_STOCK";

  // 3. Xử lý thay đổi số lượng
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  // 4. Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.basePrice,
        image: product.images?.[0] || "/placeholder.png",
        slug: product.slug,
        quantity: quantity,
        variant: "Default",
      }),
    );
    // Mở Sidebar ngay sau khi thêm
    // dispatch(setCartOpen(true));
    toast.success(`${product.name} added to cart!`, {
      position: "top-right",
      theme: "dark",
    });
  };

  return (
    <div className="flex flex-col gap-5 text-black font-sans animate-fadeIn">
      {/* --- HEADER --- */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {!isOutOfStock ? (
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
              <Check className="w-3 h-3" /> In Stock
            </span>
          ) : (
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Out of Stock
            </span>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-1 font-oswald leading-none">
          {product.name}
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          {product.category || "Mechanical Keyboard Kit"}
        </p>

        {/* Specs List (Giữ nguyên style của bạn) */}
        {product.specs && (
          <div className="space-y-1 text-xs text-gray-600 leading-relaxed font-medium border-l-2 border-gray-100 pl-3">
            {product.specs.layout && <p>• Layout: {product.specs.layout}</p>}
            {product.specs.mounting && (
              <p>• Mounting: {product.specs.mounting}</p>
            )}
            {product.specs.pcb && <p>• PCB: {product.specs.pcb}</p>}
            {product.specs.connection && (
              <p>• Connection: {product.specs.connection}</p>
            )}
            {product.specs.battery && <p>• Battery: {product.specs.battery}</p>}
          </div>
        )}

        <div className="mt-3 text-gray-400 text-[10px] italic">
          {product.shortDesc}
        </div>
      </div>

      {/* --- PRICE AREA --- */}
      <div className="mt-1 pt-3 flex items-baseline gap-3 border-t border-gray-50">
        <span className="text-2xl font-bold font-oswald block text-[#ce2a32]">
          {formatPrice(product.basePrice)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-sm text-gray-400 line-through decoration-1">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-[10px] font-bold text-white bg-[#ce2a32] px-1.5 py-0.5 rounded-sm">
              -{discountPercentage}%
            </span>
          </>
        )}
      </div>

      {/* --- ACTIONS (Quantity + Button) --- */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Quantity Selector */}
        <div className="flex items-center border border-gray-300 h-11 w-32 shrink-0">
          <button
            onClick={() => handleQuantityChange("decrease")}
            className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
            disabled={isOutOfStock}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="flex-1 text-center font-bold text-sm">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange("increase")}
            className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
            disabled={isOutOfStock}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all shadow-sm active:scale-[0.98]
            ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#ce2a32] hover:bg-[#b01e25] text-white"
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* --- RELATED PRODUCTS --- */}
      {relatedProducts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[15px] font-bold text-black uppercase tracking-widest mb-3">
            Also Available
          </p>
          <div className="grid grid-cols-4 gap-2">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/shop/product/${item.slug}`}
                className="group block"
              >
                <div className="aspect-square border border-gray-200 bg-white p-0.5 transition-all group-hover:border-black relative">
                  <Image
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5 uppercase tracking-wide truncate group-hover:text-black text-center">
                  {item.name.split(" ").slice(0, 2).join(" ")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
