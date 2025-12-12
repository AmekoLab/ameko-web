"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  link: string;
  date?: string;
}

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

export const NewsCard: FC<NewsCardProps> = ({ item, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col h-full"
    >
      {/* 1. TITLE  */}
      <h3 className="text-sm md:text-base font-black uppercase leading-tight mb-4 min-h-[3rem] ">
        <Link href={item.link}>{item.title}</Link>
      </h3>

      {/* 2. IMAGE */}
      <Link
        href={item.link}
        className="block w-full aspect-[16/9] relative overflow-hidden mb-4 bg-gray-100"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>

      {/* 3. EXCERPT & READ MORE */}
      <div className="flex flex-col flex-grow">
        <p className="text-xs md:text-sm text-gray-600 italic mb-4 leading-relaxed flex-grow">
          {item.excerpt}
        </p>

        <Link
          href={item.link}
          className="inline-block text-xs font-bold uppercase border-b border-black w-fit hover:text-[#ce2a32] hover:border-[#ce2a32] transition-colors pb-0.5"
        >
          Read more...
        </Link>
      </div>
    </motion.article>
  );
};
