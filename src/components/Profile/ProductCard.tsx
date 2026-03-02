import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/src/types/profile";
import { ShoppingCart } from "lucide-react";

export const ProductCard: FC<{ product: Product }> = ({ product }) => {
  return (
    <Link href={`/shop/assembled-product/${product.id}`} className="block">
      <div className="bg-white rounded-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.status !== "In Stock" && (
            <div className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase px-2 py-1 tracking-wider">
              {product.status}
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">
            {product.category}
          </p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] mb-2 group-hover:text-[#ce2a32] transition-colors">
            {product.name}
          </h3>
          <div className="flex justify-between items-center">
            <span className="font-bold text-black">{product.price}</span>
            <button className="p-1.5 bg-gray-100 rounded-sm hover:bg-[#ce2a32] hover:text-white transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
