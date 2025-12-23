"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/src/types/product";

interface ProductInfoProps {
  product: Product;
  relatedProducts?: Product[];
}

export const ProductInfo = ({
  product,
  relatedProducts = [],
}: ProductInfoProps) => {
  return (
    <div className="flex flex-col gap-5 text-black font-sans">
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-1 font-oswald leading-none">
          {product.name}
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Mechanical Keyboard Kit
        </p>

        <div className="space-y-1 text-xs text-gray-600 leading-relaxed font-medium border-l-2 border-gray-100 pl-3">
          <p>• Layout: {product.specs.layout}</p>
          <p>• Mounting: {product.specs.mounting}</p>
          <p>• PCB: {product.specs.pcb}</p>
          <p>• Connection: {product.specs.connection}</p>
          <p>• Battery: {product.specs.battery || "N/A"}</p>
        </div>

        <div className="mt-3 text-gray-400 text-[10px] italic">
          {product.shortDesc}
        </div>
      </div>

      <div className="mt-1 pt-3 ">
        <span className="text-2xl font-bold font-oswald block text-[#ce2a32]">
          ${product.basePrice.toFixed(2)}
        </span>
      </div>

      <button
        className="w-50 bg-[#ce2a32] hover:bg-[#b01e25] text-white py-3 px-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all shadow-sm active:scale-[0.98]"
        onClick={() => alert(`Added to cart`)}
      >
        Add to Cart
      </button>

      {relatedProducts.length > 0 && (
        <div className="mt-6 pt-6 ">
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
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
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
