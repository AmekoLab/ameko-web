"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  tag?: "NEW" | "HOT" | "SALE";
  category: string;
  slug: string;
  features: string[];
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group/card relative bg-white flex flex-col h-full w-full overflow-hidden transition-all duration-300 hover:shadow-2xl border border-transparent hover:border-gray-100 rounded-sm">
      {/* 2. IMAGE AREA */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full aspect-square bg-[#f9f9f9] overflow-hidden shrink-0"
      >
        {/* Tag */}
        {product.tag && (
          <span
            className={`absolute top-4 left-4 z-10 text-[10px] font-bold text-white px-3 py-1 uppercase tracking-widest rounded-sm shadow-sm
            ${product.tag === "NEW" ? "bg-[#ce2a32]" : "bg-black"}
          `}
          >
            {product.tag}
          </span>
        )}

        {/* Product Image */}

        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-8 transition-transform duration-500 group-hover/card:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Action Button (Hover) */}

        <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 z-20">
          <button
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              console.log("Add to cart:", product.id);
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </Link>

      {/* 3. INFO AREA */}
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          {product.category}
        </p>

        {/* Name */}

        <h3 className="text-sm font-black text-black uppercase leading-tight mb-2 group-hover/card:text-[#ce2a32] transition-colors min-h-[40px] line-clamp-2">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="text-sm font-bold text-gray-900 mb-4">
          ${product.price.toFixed(2)} (USD)
        </p>

        {/* Features */}

        <ul className="space-y-1 mt-auto pt-4 border-t border-transparent group-hover/card:border-gray-100 transition-colors">
          {product.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed"
            >
              <span className="mt-1.5 w-1 h-1 bg-gray-300 rounded-full shrink-0" />
              <span className="line-clamp-2">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
