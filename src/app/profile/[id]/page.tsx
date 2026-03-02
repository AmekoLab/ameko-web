import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/src/components/Profile/ProfileHeader";
import { ProfileView } from "@/src/components/Profile/ProfileView";
import { shopService } from "@/src/services/shopService";
import { CommunityService } from "@/src/services/community.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await shopService.getShopById(id);
    const profile = response.data;

    if (!profile) return { title: "Shop Not Found" };

    return {
      title: "AMEKO - " + profile.shopName,
      description: profile.bio || "Shop profile on AMEKO",
      openGraph: {
        images: profile.bannerUrl ? [profile.bannerUrl] : [],
      },
    };
  } catch (error) {
    return { title: "Shop Not Found" };
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;

  let profile;
  let posts;

  try {
    const shopPromise = shopService.getShopById(id);
    const postsPromise = CommunityService.getPosts(1);

    const [shopResponse, postsResponse] = await Promise.all([
      shopPromise,
      postsPromise,
    ]);

    profile = shopResponse.data;
    posts = postsResponse;

    if (!profile) {
      notFound();
    }
  } catch (error) {
    console.error("Lỗi khi tải trang Shop Profile:", error);
    notFound();
  }

  // 2. Render giao diện nằm HOÀN TOÀN BÊN NGOÀI try/catch
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-2 lg:px-2">
        <ProfileHeader profile={profile} />
        <ProfileView profile={profile} initialPosts={posts.data} />
      </div>
    </div>
  );
}
