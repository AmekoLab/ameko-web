"use client";

import { FC } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NEWS_DATABASE } from "@/src/lib/mockData";

export default function NewsPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
        <div className="mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black mb-8"
          >
            News
          </motion.h1>

          <div className="w-full border-t border-gray-200"></div>
        </div>

        {/* --- NEWS LIST (Text Only Layout) --- */}
        <div className="flex flex-col">
          {NEWS_DATABASE.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 py-10 last:border-0 group"
            >
              <div className="text-gray-400 text-sm mb-3 font-medium">
                {item.date}
              </div>

              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight mb-4 group-hover:text-[#ce2a32] transition-colors duration-200">
                <Link href={`/news/${item.slug}`}>{item.title}</Link>
              </h2>

              <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-4xl">
                {item.excerpt}
                <span className="hidden group-hover:inline text-[#ce2a32]">
                  {" "}
                  [...]
                </span>
              </p>
            </motion.article>
          ))}
        </div>

        {/* --- PAGINATION (Minimalist) --- */}
        <div className="flex justify-start mt-12 gap-2">
          <span className="text-black font-bold border-b-2 border-black pb-1 cursor-pointer">
            1
          </span>
          <span className="text-gray-400 font-bold hover:text-black cursor-pointer px-2">
            2
          </span>
          <span className="text-gray-400 font-bold hover:text-black cursor-pointer px-2">
            3
          </span>
          <span className="text-gray-400 font-bold hover:text-black cursor-pointer px-2">
            Next »
          </span>
        </div>
      </div>
    </div>
  );
}
