"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Settings, MousePointer2, Layers } from "lucide-react";

export const BuilderCTA: FC = () => {
  return (
    <section className="relative bg-black text-white py-24 overflow-hidden">
      {/* Background Pattern  */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#ce2a32] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* LEFT: Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#ce2a32] font-bold tracking-widest uppercase text-sm mb-2 block">
                The Core Experience
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                Build Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Own Legacy
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Do not just settle for pre-built keyboards. With our
                state-of-the-art <strong>Ameko 3D Builder</strong>, you have the
                power to create a keyboard that reflects your unique style and
                preferences. Choose from a vast selection of components,
                customize layouts, and see your design come to life in real-time
                3D preview.
              </p>
            </motion.div>

            {/* Features Icon */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <Layers className="w-8 h-8 text-[#ce2a32]" />
                <span className="text-xs font-bold uppercase text-gray-300">
                  Multi-Layer <br />
                  Customization
                </span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <MousePointer2 className="w-8 h-8 text-[#ce2a32]" />
                <span className="text-xs font-bold uppercase text-gray-300">
                  Drag & Drop <br />
                  Interface
                </span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <Settings className="w-8 h-8 text-[#ce2a32]" />
                <span className="text-xs font-bold uppercase text-gray-300">
                  Real-time <br />
                  3D Preview
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/builder"
                className="inline-flex items-center justify-center bg-[#ce2a32] text-white px-10 py-4 text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 clip-path-slant"
              >
                Start Building Now
              </Link>
            </div>
          </div>

          {/* RIGHT: Image (Exploded Keyboard) */}
          <div className="flex-1 w-full relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-[4/3]"
            >
              <Image
                src="https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png"
                alt="Keyboard Builder Preview"
                fill
                className="object-contain drop-shadow-2xl"
              />

              {/* Floating Badge */}
              <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-sm text-center">
                <span className="block text-3xl font-black text-white">
                  100+
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-300">
                  Parts Available
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
