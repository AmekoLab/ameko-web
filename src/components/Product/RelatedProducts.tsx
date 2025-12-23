import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/src/types/product";

export const RelatedProducts = ({ products }: { products: Product[] }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-20 pt-10 border-t border-gray-100">
      <h3 className="text-2xl font-black uppercase tracking-tight mb-8 font-oswald text-center">
        You Might Also Like
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/product/${product.slug}`}
            className="group block"
          >
            {/* Image Card */}
            <div className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden mb-3 border border-transparent group-hover:border-gray-200 transition-all">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badge (Optional) */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm">
                {product.status === "IN_STOCK" ? "In Stock" : "Pre-order"}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#ce2a32] transition-colors">
                {product.name}
              </h4>
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-900">
                  ${product.basePrice}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 fill-gray-300 text-gray-300" />
                  <span>{product.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
