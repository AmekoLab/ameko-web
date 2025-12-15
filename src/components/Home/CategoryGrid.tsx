"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    id: 1,
    name: "Keycaps",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    link: "/shop/keycaps",
  },
  {
    id: 2,
    name: "Switches",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    link: "/shop/switches",
  },
  {
    id: 3,
    name: "Cases",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    link: "/shop/cases",
  },
  {
    id: 4,
    name: "Deskmats",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    link: "/shop/deskmats",
  },
];

export const CategoryGrid: FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4">
          Browse by Category <div className="h-px flex-grow bg-gray-200"></div>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group relative h-40 md:h-60 overflow-hidden rounded-sm bg-gray-100"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-4 left-4">
                <span className="block text-white text-lg font-black uppercase tracking-widest drop-shadow-md">
                  {cat.name}
                </span>
                <span className="text-xs text-white/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
