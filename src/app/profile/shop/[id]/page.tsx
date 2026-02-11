import { Metadata } from "next";

import { notFound } from "next/navigation";
import { ProfileHeader } from "@/src/components/Profile/ProfileHeader";
import { ProfileView } from "@/src/components/Profile/ProfileView";
import { ProfileService } from "@/src/services/profile.service";
import { CommunityService } from "@/src/services/community.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1";

/** Fetch categories for a shop and return the "kit" category ID */
async function getKitCategoryId(shopId: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${API_URL}/catalog/categories?ShopId=${shopId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return undefined;
    const kitCategory = json.data.find(
      (c: { slug: string }) => c.slug === "kit",
    );
    return kitCategory?.id;
  } catch {
    return undefined;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// TODO: [SEO] Tạo metadata động theo tên Shop/User
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const profile = await ProfileService.getProfile(id);
  if (!profile) return { title: "Profile Not Found" };

  return {
    title: "AMEKO - " + profile.displayName,
    description: profile.bio || "Shop profile on AMEKO",
    openGraph: {
      images: profile.coverImage ? [profile.coverImage] : [],
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch dữ liệu Profile trên Server
  const profileData = ProfileService.getProfile(id);
  const postsData = CommunityService.getPosts(1);
  const kitCategoryData = getKitCategoryId(id);

  const [profile, posts, kitCategoryId] = await Promise.all([
    profileData,
    postsData,
    kitCategoryData,
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-2 lg:px-2">
        <ProfileHeader profile={profile} kitCategoryId={kitCategoryId} />
        <ProfileView profile={profile} initialPosts={posts.data} />
      </div>
    </div>
  );
}
