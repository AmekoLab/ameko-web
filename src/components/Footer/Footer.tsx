"use client";

import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
  Store,
} from "lucide-react";
import { Logo } from "../Header/Logo";
import { useAppSelector } from "@/src/store/hook";

export const Footer: FC = () => {
  const router = useRouter();

  const { user } = useAppSelector((state) => state.auth);
  const { currentShop } = useAppSelector((state) => state.shop);

  const handleSellerClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (currentShop) {
      router.push("/profile");
    } else {
      router.push("/shop/register");
    }
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        {/* --- MAIN FOOTER CONTENT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* COL 1: BRAND & SOCIAL  */}
          <div className="space-y-6">
            <div className="brightness-0 invert">
              <Logo />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              AMEKO - German engineering meets Swedish design. Professional
              gaming gear for esports athletes.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Youtube className="w-5 h-5" />} />
            </div>
          </div>

          {/* COL 2: SUPPORT  */}
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

          {/* COL 3: COMPANY  */}
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

          {user?.role !== "Admin" ? (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-[#ce2a32]">
                Partner with Ameko
              </h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Join the largest marketplace for mechanical keyboard
                enthusiasts. Start your business and reach thousands of
                customers today.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSellerClick}
                  className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-sm hover:bg-[#ce2a32] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <Store className="w-4 h-4" />
                  {/* Thay đổi Text nút dựa trên trạng thái */}
                  {currentShop ? "Check Application Status" : "Become a Seller"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-gray-600 text-center">
                  * Free registration. No hidden fees.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">
                Admin Panel
              </h4>
              <p className="text-gray-500 text-sm mb-6">
                You are logged in as Administrator. Access the dashboard to
                manage system.
              </p>
              {/* <Link
                href="/admin/dashboard"
                className="text-white hover:text-[#ce2a32] font-bold text-sm flex items-center gap-2 transition-colors"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link> */}
            </div>
          )}
          {/* ======================================================= */}
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2025 AMEKO. All rights reserved.</p>

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
