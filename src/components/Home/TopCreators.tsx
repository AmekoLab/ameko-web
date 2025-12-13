"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, UserPlus, Star } from "lucide-react";

// Mock Data: Các Builder hoặc Shop nổi bật
const CREATORS = [
  {
    id: 1,
    name: "KBD Fans Club",
    role: "Verified Shop",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
    followers: "12.5k",
    rating: 4.9,
    tags: ["Custom", "Lubing"],
  },
  {
    id: 2,
    name: "Tín Dev",
    role: "Top Builder",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
    followers: "8.2k",
    rating: 5.0,
    tags: ["Artisan", "Reviewer"],
  },
  {
    id: 3,
    name: "Mochi Keycaps",
    role: "Artisan Maker",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg",
    followers: "5.1k",
    rating: 4.8,
    tags: ["Keycaps", "Cute"],
  },
  {
    id: 4,
    name: "Gia Thinh Setup",
    role: "Desk Setup",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg",
    followers: "3.4k",
    rating: 4.7,
    tags: ["Minimalist", "Space"],
  },
];

export const TopCreators: FC = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        {/* Title */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
            Top Creators <BadgeCheck className="w-5 h-5 text-[#ce2a32]" />
          </h2>
          <Link
            href="/creators"
            className="text-xs font-bold uppercase text-gray-500 hover:text-black"
          >
            View All
          </Link>
        </div>

        {/* Creator List (Horizontal Scroll trên mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREATORS.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-lg hover:border-[#ce2a32]/20 transition-all bg-gray-50 group"
            >
              {/* Avatar */}
              <div className="relative">
                <Image
                  src={creator.avatar}
                  alt={creator.name}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  {creator.rating}
                </div>
              </div>

              {/* Info */}
              <div className="flex-grow">
                <h3 className="font-bold text-sm text-black group-hover:text-[#ce2a32] transition-colors">
                  {creator.name}
                </h3>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                  {creator.role}
                </p>
                <div className="flex flex-wrap gap-1">
                  {creator.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-white border border-gray-200 px-1.5 rounded text-gray-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Follow Button */}
              <button className="p-2 rounded-full bg-white border border-gray-200 hover:bg-black hover:text-white transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
