"use client";
import { FC } from "react";
import { MapPin, Calendar, ShoppingBag, Facebook, Globe } from "lucide-react";
import { ShopPublicProfile } from "@/src/types/shop.types";
import Link from "next/link";

export const ProfileSidebar: FC<{ profile: ShopPublicProfile }> = ({
  profile,
}) => {
  const formattedJoinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="space-y-4 ">
      {/* Intro Box */}
      <div className="bg-white p-4 rounded-sm shadow-sm border border-amazon-border">
        <h3 className="text-xs font-black uppercase text-amazon-text mb-3 tracking-widest">
          Intro
        </h3>
        <p className="text-sm text-amazon-textMuted mb-4 leading-relaxed">
          {profile.bio || "No description provided."}
        </p>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm text-amazon-textMuted">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span>
              Based in <span className="font-bold text-amazon-text">Vietnam</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-amazon-textMuted">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>Joined {formattedJoinDate}</span>
          </div>
        </div>
      </div>

      {/* Socials & Links */}

      {(profile as any).socials && (profile as any).socials.length > 0 && (
        <div className="bg-white p-4 rounded-sm shadow-sm border border-amazon-border">
          <h3 className="text-xs font-black uppercase text-amazon-text mb-3 tracking-widest">
            Connect
          </h3>
          <div className="space-y-3">
            {((profile as any).socials as any[]).map((social, idx) => (
              <Link
                href={social.url}
                key={idx}
                target="_blank"
                className="flex items-center gap-3 text-sm text-amazon-link hover:underline"
              >
                {social.platform === "shopee" ? (
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                ) : social.platform === "facebook" ? (
                  <Facebook className="w-4 h-4 text-blue-500" />
                ) : (
                  <Globe className="w-4 h-4 text-neutral-400" />
                )}
                <span className="capitalize">{social.platform}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Skills / Services */}

      {(profile as any).skills && (profile as any).skills.length > 0 && (
        <div className="bg-white p-4 rounded-sm shadow-sm border border-amazon-border">
          <h3 className="text-xs font-black uppercase text-amazon-text mb-3 tracking-widest">
            Skills & Services
          </h3>
          <div className="flex flex-wrap gap-2">
            {((profile as any).skills as string[]).map((skill) => (
              <span
                key={skill}
                className="bg-neutral-100 text-amazon-text text-xs px-2 py-1 rounded-sm font-medium border border-amazon-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
