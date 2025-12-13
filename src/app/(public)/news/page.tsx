"use client";

import { FC } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const NEWS_ITEMS = [
  {
    id: 1,
    date: "25 September, 2025",
    title: "Ameko Gaming Products are now distributed in Vietnam",
    excerpt:
      "Ameko has entered a distribution agreement with GearVN, making their artisan keyboards and accessories available to resellers across Vietnam. Ameko has grown rapidly over the past years and is continuing to expand their distribution network in 2025.",
    slug: "distribution-vietnam",
  },
  {
    id: 2,
    date: "29 July, 2025",
    title: "Ameko Introduces M8 Wireless Gaming Mouse",
    excerpt:
      "A new, uniquely designed mouse is coming this November. Meet the new M8 from Ameko. After launching wireless versions of their popular M4, M42 and MZ1 mice during the past year, Ameko now reveals a completely new mouse that is expected to arrive this November.",
    slug: "m8-wireless-intro",
  },
  {
    id: 3,
    date: "16 August, 2025",
    title: "Ameko Partners with Heroic Esports",
    excerpt:
      "Swedish gaming gear specialists Ameko team up with one of the most prominent esports organizations in the Nordics, Heroic. As top contenders globally with the number one CS:GO team in Denmark, Norwegian esports organization Heroic has rapidly grown to become a household name.",
    slug: "heroic-partnership",
  },
  {
    id: 4,
    date: "12 May, 2025",
    title: "Jesse Lingard and JLINGZ Esports partner with Ameko",
    excerpt:
      "Manchester United's Jesse Lingard and his esports organization JLINGZ have entered a partnership with gaming gear specialists Ameko. Professional footballer Jesse Lingard entered the competitive gaming scene in 2021, launching his own esports organization JLINGZ.",
    slug: "jlingz-partnership",
  },
  {
    id: 5,
    date: "04 April, 2025",
    title:
      "Ameko's Big Announcement: Custom Artisan Keycaps & Switches Collaboration",
    excerpt:
      "Multiple new products are introduced as Ameko reveals the upcoming additions to their range of esports equipment. We are now announcing the launch of a number of highly anticipated artisan keycaps designed by the community's top creators.",
    slug: "big-announcement",
  },
];

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
          {NEWS_ITEMS.map((item, index) => (
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
