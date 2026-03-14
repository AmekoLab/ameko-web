"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, TrendingUp } from "lucide-react";

export const BecomeSellerSection = () => {
  return (
    <section className="relative w-full pt-20 pb-26 lg:pb-40 px-4 lg:px-8 bg-black text-white overflow-hidden ">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#151515] to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* --- LEFT: CONTENT --- */}
          <div className="space-y-8">
            <div>
              <span className="text-[#ce2a32] font-bold tracking-widest uppercase text-xs mb-3 block">
                Partner with AMEKO
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-oswald uppercase leading-[0.9] mb-6">
                Turn Your Passion <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                  Into Profit.
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                Join the premier marketplace for mechanical keyboard
                enthusiasts. Reach thousands of potential buyers and build your
                own brand with our professional tools today.
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <BenefitItem
                icon={<Users className="w-6 h-6 text-[#ce2a32]" />}
                title="Dedicated Community"
                desc="Connect directly with thousands of custom keyboard collectors and enthusiasts."
              />
              <BenefitItem
                icon={<TrendingUp className="w-6 h-6 text-[#ce2a32]" />}
                title="Maximize Revenue"
                desc="Access powerful analytics and management tools to scale your business."
              />
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link
                href="/shop/register"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#ce2a32] text-white font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-red-700 transition-all duration-300"
              >
                Start Selling Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Free registration. Approval within 24 hours.
              </p>
            </div>
          </div>

          {/* --- RIGHT: IMAGE / VISUAL --- */}
          <div className="relative h-[400px] lg:h-[600px] w-full rounded-2xl overflow-hidden group border border-white/5">
            <Image
              src="https://res.cloudinary.com/doezwafgz/image/upload/v1770454504/CHERRY-XTRFY_TMR_divqop.jpg"
              alt="Mechanical Keyboard Workspace"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />

            {/* Floating Badge */}
            <div className="absolute bottom-8 left-8 bg-[#0d0d0d]/80 backdrop-blur-md border border-white/10 p-5 rounded-xl max-w-xs shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#ce2a32] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Success Story
                </span>
              </div>
              <p className="text-sm font-medium text-white italic">
                "AMEKO helped me scale my artisan keycap business to over 500
                orders a month."
              </p>
              <p className="text-xs text-gray-500 mt-2 font-bold uppercase not-italic">
                — Alex D., Keycap Artisan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper Component
const BenefitItem = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="flex gap-4">
    <div className="mt-1 p-2 bg-white/5 rounded-lg h-fit">{icon}</div>
    <div>
      <h4 className="font-bold text-white uppercase text-sm mb-2 font-oswald tracking-wide">
        {title}
      </h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);
