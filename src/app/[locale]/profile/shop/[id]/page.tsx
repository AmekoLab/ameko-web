import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProfileHeader } from "@/src/components/Profile/ProfileHeader";
import { ProfileView } from "@/src/components/Profile/ProfileView";
import { shopService } from "@/src/services/shopService";
import { socialService } from "@/src/services/social.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

// [SEO] Tạo metadata động theo tên Shop
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("ProfilePage");

  try {
    const response = await shopService.getShopById(id);
    const shop = response.data;

    if (!response.success || !shop) return { title: t("shopNotFound") };

    return {
      title: "AMEKO - " + shop.shopName,
      description: shop.bio || t("shopProfileDescription"),
      openGraph: {
        images: shop.bannerUrl ? [shop.bannerUrl] : [],
      },
    };
  } catch (error) {
    // console.error(error);
    return { title: t("shopNotFound") };
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;

  try {
    // 1. Fetch dữ liệu Shop Profile và Posts đồng thời trên Server
    const [shopResponse, postsData] = await Promise.all([
      shopService.getShopById(id),
      socialService.getUserPosts(id).catch(() => ({ data: { items: [] } })),
    ]);

    const shop = shopResponse.data;

    // Nếu gọi API thất bại hoặc không có data -> đá sang trang 404
    if (!shopResponse.success || !shop) {
      notFound();
    }

    return (
      <div className="bg-amazon-bgSecondary min-h-screen text-amazon-text">
        <div className="max-w-[1280px] mx-auto px-2 lg:px-2">
          {/* Truyền trực tiếp dữ liệu ShopPublicProfile vào component */}
          <ProfileHeader profile={shop} />
          <ProfileView
            profile={shop}
            initialPosts={postsData?.data?.items || []}
          />
        </div>
      </div>
    );
  } catch (error) {
    // console.error("Lỗi khi tải trang Profile:", error);
    notFound();
  }
}
