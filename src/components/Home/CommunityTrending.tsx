"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, User, ArrowUpRight } from "lucide-react";

const TRENDING_BUILDS = [
  {
    id: 1,
    title: "Cyberpunk Neon City Build",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602790/1944c8e7dce82db7f058944f88fb73d8_wnw1tb.jpg",
    author: "AlexKeys",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
    likes: 1240,
    comments: 45,
    slug: "cyberpunk-neon",
  },
  {
    id: 2,
    title: "Minimalist White Setup",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602790/1944c8e7dce82db7f058944f88fb73d8_wnw1tb.jpg",
    author: "Sarah_Dev",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg",
    likes: 856,
    comments: 23,
    slug: "minimalist-white",
  },
  {
    id: 3,
    title: "Wooden Case Retro Style",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602790/1944c8e7dce82db7f058944f88fb73d8_wnw1tb.jpg",
    author: "WoodWorker",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg",
    likes: 2105,
    comments: 112,
    slug: "retro-wood",
  },
  {
    id: 4,
    title: "TKL Carbon Edition",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602790/1944c8e7dce82db7f058944f88fb73d8_wnw1tb.jpg",
    author: "ProGamer99",
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
    likes: 567,
    comments: 18,
    slug: "tkl-carbon",
  },
];

export const CommunityTrending: FC = () => {
  return (
    <section className="py-20 bg-[#f9f9f9]">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        {/* --- HEADER: Social Vibes --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black">
              Community Trending
            </h2>
            <p className="text-gray-500 font-medium max-w-md">
              Explore the most popular custom keyboard builds from our vibrant
            </p>
            <div className="h-1 w-12 bg-[#ce2a32] mt-4"></div>
          </motion.div>

          {/* Button tham gia cộng đồng */}
          <Link
            href="/community"
            className="group flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors rounded-sm"
          >
            Join the Collective
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* --- GRID GALLERY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRENDING_BUILDS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[4/5] md:aspect-square overflow-hidden bg-gray-200 cursor-pointer rounded-sm"
            >
              {/* 1. BACKGROUND IMAGE */}
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* 2. OVERLAY  */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                {/* Top: User Info */}
                <div className="flex items-center gap-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Image
                    src={post.avatar}
                    alt={post.author}
                    width={32}
                    height={32}
                    className="rounded-full border border-white/20"
                  />
                  <span className="text-white text-sm font-bold tracking-wide">
                    {post.author}
                  </span>
                </div>

                {/* Center: Title & Action */}
                <div className="text-center">
                  <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2 transform scale-90 group-hover:scale-100 transition-transform duration-300 delay-75">
                    {post.title}
                  </h3>
                  <span className="inline-block text-[#ce2a32] text-xs font-bold uppercase tracking-widest border-b border-[#ce2a32]">
                    View Build Details
                  </span>
                </div>

                {/* Bottom: Social Stats */}
                <div className="flex justify-between items-center text-white/80 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-[#ce2a32] fill-[#ce2a32]" />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">{post.comments}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest opacity-60">
                    2 hours ago
                  </span>
                </div>
              </div>

              <Link
                href={`/community/build/${post.slug}`}
                className="absolute inset-0 z-10"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
