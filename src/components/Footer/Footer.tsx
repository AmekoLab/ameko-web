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
import { useTranslations } from "next-intl";

export const Footer: FC = () => {
  const router = useRouter();
  const t = useTranslations("Footer");

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
      router.push("/profile/register");
    }
  };

  // Link Google Maps Direct (Chỉ đường)
  const mapUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Lô+E2a,+7+Đ.+D1,+Long+Thạnh+Mỹ,+Thủ+Đức,+Hồ+Chí+Minh+700000,+Việt+Nam";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="font-sans">
      {/* ═══════════════════════════════════════════
          TIER 0 — "Back to Top" Bar
      ═══════════════════════════════════════════ */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm font-medium py-3.5 text-center cursor-pointer transition-colors"
      >
        {t("backToTop")}
      </button>

      {/* ═══════════════════════════════════════════
          TIER 1 — Main Footer Body
      ═══════════════════════════════════════════ */}
      <div className="bg-amazon-headerLight text-gray-300">
        <div className="max-w-7xl mx-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* COL 1: Get to Know Us */}
            <div>
              <h4 className="text-white font-bold text-base mb-4">
                {t("getToKnowUs")}
              </h4>
              <ul className="space-y-2.5">
                <FooterLink href="/about">{t("aboutAmeko")}</FooterLink>
                
                <FooterLink href="/community">{t("community")}</FooterLink>
              </ul>

              {/* Seller CTA */}
              {user?.role !== "Admin" && (
                <div className="mt-6">
                  <button
                    onClick={handleSellerClick}
                    className="bg-amazon-btnSecondary text-amazon-text font-bold px-4 py-2 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                  >
                    <Store className="w-4 h-4" />
                    {currentShop
                      ? t("checkApplicationStatus")
                      : t("becomeSeller")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    {t("freeRegistrationNote")}
                  </p>
                </div>
              )}
            </div>

            {/* COL 2: Customer Service */}
            <div>
              <h4 className="text-white font-bold text-base mb-4">
                {t("customerService")}
              </h4>
              <ul className="space-y-2.5">
                <FooterLink href="/contact">{t("contactUs")}</FooterLink>
                <FooterLink href="/orders">{t("shippingInfo")}</FooterLink>
                <FooterLink href="/my-warranty-requests">{t("returnsExchanges")}</FooterLink>
                <FooterLink href="/my-warranty-requests">{t("warranty")}</FooterLink>
              </ul>
            </div>

            {/* COL 3: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-base mb-4">
                {t("quickLinks")}
              </h4>
              <ul className="space-y-2.5">
                <FooterLink href="/shop/all-products">{t("allProducts")}</FooterLink>
                <FooterLink href="/commissions-pool">{t("commissionsPool")}</FooterLink>
                <FooterLink href="/custom-build">{t("buildYourOwnKeyboard")}</FooterLink>
                <FooterLink href="/orders">{t("yourOrders")}</FooterLink>
                <FooterLink href="/profile">{t("yourAccount")}</FooterLink>
                <FooterLink href="/privacy-policy">{t("privacyPolicy")}</FooterLink>
              </ul>
            </div>

            {/* COL 4: Visit Us + Socials */}
            <div>
              <h4 className="text-white font-bold text-base mb-4">
                {t("visitUs")}
              </h4>

              {/* Google Map */}
              <div className="relative w-full h-40 bg-amazon-header border border-white/10 rounded-sm overflow-hidden mb-3">
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
                className="text-sm text-gray-300 leading-relaxed flex items-start gap-2 hover:underline hover:text-white transition-colors group"
              >
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {t("addressLine1")}
                  <br />
                  {t("addressLine2")}
                </span>
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-3 mt-5">
                <SocialLink href="#" icon={<Facebook className="w-4 h-4" />} />
                <SocialLink href="#" icon={<Instagram className="w-4 h-4" />} />
                <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} />
                <SocialLink href="#" icon={<Youtube className="w-4 h-4" />} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TIER 2 — Logo + Brand Divider
      ═══════════════════════════════════════════ */}
      <div className="bg-amazon-headerLight border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center py-6 px-6">
          <div className="brightness-0 invert">
            <Logo />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            {t("slogan")}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TIER 3 — Bottom Copyright Bar
      ═══════════════════════════════════════════ */}
      <div className="bg-amazon-header py-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 px-6">
          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <Link href="/terms-of-service" className="hover:underline hover:text-white">
              {t("termsOfService")}
            </Link>
            <Link href="/privacy-policy" className="hover:underline hover:text-white">
              {t("privacyPolicy")}
            </Link>
            <Link href="/return-policy" className="hover:underline hover:text-white">
              {t("returnsPolicy")}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ─── Helper Components ─── */

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
      className="text-gray-300 text-sm hover:underline hover:text-white transition-colors block w-fit"
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
    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
  >
    {icon}
  </a>
);