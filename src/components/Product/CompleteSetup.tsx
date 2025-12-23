"use client";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/src/types/product";

interface CompleteSetupProps {
  products: Product[];
}

export const CompleteSetup = ({ products }: CompleteSetupProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-xl font-black uppercase tracking-tight mb-8 font-oswald">
        Complete Your Setup
      </h3>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {products.map((product) => (
          <div key={product.id} className="group flex flex-col">
            <Link
              href={`/shop/product/${product.slug}`}
              className="relative aspect-square bg-[#f5f5f5] mb-6 overflow-hidden"
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            {/* 2. Thông tin sản phẩm */}
            <div className="flex flex-col items-start">
              {/* Tên - In đậm, viết hoa */}
              <Link
                href={`/shop/product/${product.slug}`}
                className="text-sm font-bold uppercase tracking-tight text-black hover:underline mb-1"
              >
                {product.name}
              </Link>

              {/* Giá tiền */}
              <span className="text-sm font-medium text-black mb-4">
                ${product.basePrice.toFixed(2)} (USD)
              </span>

              {/* 3. Danh sách tính năng (Bullet Points) - Giống ảnh mẫu */}

              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 marker:text-black">
                <li>Pro-grade wireless performance</li>
                <li>Lightweight construction</li>
                <li>Optimized for esports</li>
                {product.specs.connection && (
                  <li>{product.specs.connection}</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
