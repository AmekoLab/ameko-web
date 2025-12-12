"use client";

import { FC } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Logo } from "../Header/Logo";

export const Footer: FC = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        {/* --- MAIN FOOTER CONTENT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* COL 1: BRAND & SOCIAL */}
          <div className="space-y-6">
            <div className="brightness-0 invert">
              <Logo />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              CHERRY XTRFY - German engineering meets Swedish design.
              Professional gaming gear for esports athletes.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Youtube className="w-5 h-5" />} />
            </div>
          </div>

          {/* COL 2: PRODUCTS & SUPPORT */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <FooterLink href="/downloads">Downloads & Drivers</FooterLink>
              <FooterLink href="/shipping">Shipping Policy</FooterLink>
              <FooterLink href="/returns">Returns & Refunds</FooterLink>
              <FooterLink href="/warranty">Warranty</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </ul>
          </div>

          {/* COL 3: COMPANY */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/news">News & Press</FooterLink>
              <FooterLink href="/esports">Esports Teams</FooterLink>
              <FooterLink href="/distributors">Distributors</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </ul>
          </div>

          {/* COL 4: NEWSLETTER */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">
              Stay Updated
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>

            <form className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/10 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/20 transition-all"
                />
              </div>
              <button className="w-full bg-[#ce2a32] text-white font-bold uppercase tracking-widest text-xs py-3 rounded-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2025 Cherry Xtrfy. All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookies"
              className="hover:text-white transition-colors"
            >
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- HELPER COMPONENTS ---

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <li>
    <Link
      href={href}
      className="hover:text-[#ce2a32] transition-colors duration-200 block w-fit"
    >
      {children}
    </Link>
  </li>
);

const SocialLink = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#ce2a32] hover:text-white transition-all duration-300 text-gray-400"
  >
    {icon}
  </a>
);
