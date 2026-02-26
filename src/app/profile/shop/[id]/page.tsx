import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/src/components/Profile/ProfileHeader";
import { ProfileView } from "@/src/components/Profile/ProfileView";
import { shopService } from "@/src/services/shopService";
import { CommunityService } from "@/src/services/community.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

// [SEO] Tạo metadata động theo tên Shop
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await shopService.getShopById(id);
    const shop = response.data;

    if (!response.success || !shop) return { title: "Shop Not Found" };

    return {
      title: "AMEKO - " + shop.shopName,
      description: shop.bio || "Shop profile on AMEKO",
      openGraph: {
        images: shop.bannerUrl ? [shop.bannerUrl] : [],
      },
    };
  } catch (error) {
    return { title: "Shop Not Found" };
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;

  try {
    // 1. Fetch dữ liệu Shop Profile và Posts đồng thời trên Server
    const [shopResponse, postsData] = await Promise.all([
      shopService.getShopById(id),
      CommunityService.getPosts(1),
    ]);

    const shop = shopResponse.data;

    // Nếu gọi API thất bại hoặc không có data -> đá sang trang 404
    if (!shopResponse.success || !shop) {
      notFound();
    }

    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-2 lg:px-2">
          {/* Truyền trực tiếp dữ liệu ShopPublicProfile vào component */}
          <ProfileHeader profile={shop} />
          <ProfileView profile={shop} initialPosts={postsData?.data || []} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Lỗi khi tải trang Profile:", error);
    notFound();
  }
}
