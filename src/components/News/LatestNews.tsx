"use client";

import { FC } from "react";
import { NewsCard, NewsItem } from "../News/NewsCard";
import { motion } from "framer-motion";

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title:
      "CHERRY XTRFY LAUNCHES ULTRA-FAST LOW-PROFILE MECHANICAL GAMING KEYBOARD WITH ALUMINUM FRAME AND DISPLAY",
    excerpt:
      "First revealed at CES 2025, the CHERRY XTRFY MX 10.1 Wireless mechanical gaming keyboard is now ready for launch.",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554094/G8A-25100-2_image017-1_acu2rz.png",
    link: "/news/mx-10-1-launch",
  },
  {
    id: 2,
    title:
      "CHERRY XTRFY LAUNCHES HIGH-END GAMING GEAR FOR ENTHUSIASTS AND SERIOUS GAMERS",
    excerpt:
      "First unveiled at CES 2025, the CHERRY XTRFY MX 8.3 TKL Wireless keyboard and the innovative GP6 and GP7 mousepads are now here.",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    link: "/news/high-end-launch",
  },
  {
    id: 3,
    title: "CHERRY LEADS THE REVOLUTION FROM MECHANICAL TO SMART SWITCHES",
    excerpt:
      "At COMPUTEX, CHERRY introduces the IK Inductive switch, a preview of the MK magnetic switch platform, and the latest additions to its legendary MX mechanical switch family.",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554094/20250729_Cherry_MX8.3_16x9-scaled_g3xnph.jpg",
    link: "/news/computex-switches",
  },
];

export const LatestNews: FC = () => {
  return (
    <section className="w-full py-12 ">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        {/* HEADER SECTION */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black">
              News
            </h2>
            <div className="h-1 w-12 bg-[#ce2a32]"></div>
          </motion.div>
        </div>

        {/* NEWS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {NEWS_DATA.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
