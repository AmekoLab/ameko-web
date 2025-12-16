import { CommunityService } from "@/src/services/community.service";
import FeedClient from "@/src/components/Community/FeedClient";
import { CreatePost } from "@/src/components/Community/CreatePost";
import { LeftSidebar, RightSidebar } from "@/src/components/Community/Sidebar";

// Đây là Server Component mặc định
export default async function CommunityPage() {
  // Fetch dữ liệu khởi tạo trên Server để tối ưu SEO
  // Google Bot sẽ thấy 5 bài viết đầu tiên ngay lập tức
  const { data: initialPosts } = await CommunityService.getPosts(1);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-6 pb-10">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột Trái: Menu */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftSidebar />
          </div>

          {/* Cột Giữa: Nội dung chính */}
          <div className="lg:col-span-6">
            <CreatePost />
            {/* Truyền dữ liệu Server xuống Client Component */}
            <FeedClient initialPosts={initialPosts} />
          </div>

          {/* Cột Phải: Trending */}
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
