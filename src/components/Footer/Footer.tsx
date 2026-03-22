"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
  Store,
  MapPin,
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

  // Link Google Maps Direct (Chỉ đường)
  const mapUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Lô+E2a,+7+Đ.+D1,+Long+Thạnh+Mỹ,+Thủ+Đức,+Hồ+Chí+Minh+700000,+Việt+Nam";

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        {/* --- MAIN FOOTER CONTENT --- */}
        {/* Chuyển sang grid-cols-4 nhưng chia tỷ lệ nội dung lại */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COL 1: BRAND, IMAGE & SOCIAL */}
          <div className="space-y-6">
            <div className="brightness-0 invert">
              <Logo />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              AMEKO - German engineering meets Swedish design. Professional
              gaming gear for esports athletes.
            </p>
            
            {/* Website Preview Image */}
            <div className="relative w-full aspect-[21/9] rounded-sm overflow-hidden border border-[#1e2126] group cursor-pointer">
              {/* Sếp thay "/images/website-preview.jpg" bằng ảnh chụp web thật của sếp nhé */}
              <Image 
                src="https://res.cloudinary.com/doezwafgz/image/upload/v1773515613/home2_xpdnpr.png" 
                alt="Ameko Website Preview" 
                fill 
                className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <p className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-widest text-[#f5d800]">
                Explore Ameko
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Youtube className="w-5 h-5" />} />
            </div>
          </div>

          {/* COL 2: QUICK LINKS (Gộp Support & Company) */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-gray-400">
                <FooterLink href="/about">About Us</FooterLink>
                <FooterLink href="/news">News & Press</FooterLink>
                <FooterLink href="/esports">Esports Teams</FooterLink>
                <FooterLink href="/distributors">Distributors</FooterLink>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
              </ul>
              <ul className="space-y-3 text-sm text-gray-400">
                <FooterLink href="/downloads">Drivers</FooterLink>
                <FooterLink href="/shipping">Shipping</FooterLink>
                <FooterLink href="/returns">Returns</FooterLink>
                <FooterLink href="/warranty">Warranty</FooterLink>
                <FooterLink href="/contact">Contact Us</FooterLink>
              </ul>
            </div>
          </div>

          {/* COL 3: LOCATION MAP */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">
              Visit Us
            </h4>
            
            {/* Khung chứa Google Map */}
            <div className="relative w-full h-48 bg-[#151515] border border-[#1e2126] rounded-sm overflow-hidden mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6100105370224!2d106.80730807503112!3d10.8411228893116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1711210000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 leading-relaxed flex items-start gap-2 hover:text-[#ce2a32] transition-colors group"
            >
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:-translate-y-1 transition-transform" />
              <span>
                Lô E2a, 7 Đ. D1, Long Thạnh Mỹ, <br />
                Thủ Đức, Hồ Chí Minh 700000, VN
              </span>
            </a>
          </div>

          {/* COL 4: PARTNER / ADMIN CTA */}
          <div>
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
              </div>
            )}
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 AMEKO. All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- HELPER COMPONENTS ---
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link
      href={href}
      className="hover:text-[#ce2a32] transition-colors duration-200 block w-fit"
    >
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a
    href={href}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#ce2a32] hover:text-white transition-all duration-300 text-gray-400"
  >
    {icon}
  </a>
);