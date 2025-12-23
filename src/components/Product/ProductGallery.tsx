"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 w-full h-full">
      {/* 1. Thumbnails  */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-hide shrink-0 lg:w-14 lg:h-[420px]">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`relative w-14 h-14 shrink-0 bg-[#f8f8f8] rounded-sm overflow-hidden transition-all border ${
              selectedImage === img
                ? "border-black opacity-100"
                : "border-transparent opacity-60 hover:opacity-100 hover:bg-gray-200"
            }`}
          >
            <Image
              src={img}
              alt={`Angle ${idx}`}
              fill
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>

      {/* 2. Main Image */}
      <div className="flex-1 relative aspect-square lg:aspect-auto lg:h-[420px] bg-[#f8f8f8] rounded-sm overflow-hidden group cursor-zoom-in border border-transparent hover:border-gray-200 transition-colors">
        <Image
          src={selectedImage}
          alt="Product Main"
          fill
          className="object-contain p-6 lg:p-8 transition-transform duration-500 ease-out group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
        />
      </div>
    </div>
  );
};
