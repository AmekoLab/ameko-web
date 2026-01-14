import { Metadata } from "next";

import { notFound } from "next/navigation";
import { ProfileHeader } from "@/src/components/Profile/ProfileHeader";
import { ProfileView } from "@/src/components/Profile/ProfileView";
import { ProfileService } from "@/src/services/profile.service";
import { CommunityService } from "@/src/services/community.service";

interface PageProps {
  params: Promise<{ username: string }>;
}

// TODO: [SEO] Tạo metadata động theo tên Shop/User
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;

  const profile = await ProfileService.getProfile(username);
  if (!profile) return { title: "Profile Not Found" };

  return {
    title: "AMEKO - " + profile.displayName,
    description: profile.bio,
    openGraph: {
      images: [profile.coverImage],
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  // 1. Fetch dữ liệu Profile trên Server
  const profileData = ProfileService.getProfile(username);
  const postsData = CommunityService.getPosts(1);

  const [profile, posts] = await Promise.all([profileData, postsData]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-2 lg:px-2">
        <ProfileHeader profile={profile} />
        <ProfileView profile={profile} initialPosts={posts.data} />
      </div>
    </div>
  );
}
