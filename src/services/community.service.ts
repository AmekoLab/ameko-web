import { Post, PostComment } from "@/src/types/community";

// TODO: [ENV] Cấu hình biến môi trường cho API URL trong file .env.local
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ameko.com/v1';

// Dữ liệu giả lập (Mock DB)
const MOCK_DB_POSTS: Post[] = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  author: {
    name: i % 3 === 0 ? "Tín Dev" : `User ${i + 1}`,
    avatar:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
    role: i % 5 === 0 ? "Pro Builder" : "Member",
  },
  time: `${Math.floor(Math.random() * 24) + 1} hours ago`,
  content: `Đây là bài viết demo số ${
    i + 1
  }. Chia sẻ góc máy và bàn phím custom của mình! AE cho ý kiến nhé. 🔥`,
  specs:
    i % 2 === 0
      ? {
          keyboard: "GMMK Pro (White Ice)",
          switches: "Gateron Oil King",
          keycaps: "GMK Samurai",
        }
      : undefined,
  images:
    i % 3 === 0
      ? [
          "https://res.cloudinary.com/doezwafgz/image/upload/v1765604136/5840bb3b17fd0a397760281ffb56cf8d_biiqko.jpg",
        ]
      : [],
  stats: {
    likes: 10 + i * 5,
    comments: 5 + i,
    shares: i,
  },
  isLiked: false,
}));

export const CommunityService = {
  /**
   * Lấy danh sách bài viết phân trang
   * @param page Trang hiện tại
   * @param limit Số lượng bài lấy
   */
  getPosts: async (
    page: number,
    limit: number = 5
  ): Promise<{ data: Post[]; hasMore: boolean }> => {
    // TODO: [API] Thay thế logic mock bằng fetch API thực tế
    // const res = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`);
    // const payload = await res.json();
    // return {
    //   data: payload.items.map(mapDtoToPost), // Cần map dữ liệu từ Backend về Frontend
    //   hasMore: payload.currentPage < payload.totalPages
    // };

    // Giả lập độ trễ mạng (Network Delay)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const start = (page - 1) * limit;
    const end = start + limit;
    const data = MOCK_DB_POSTS.slice(start, end);
    const hasMore = end < MOCK_DB_POSTS.length;

    return { data, hasMore };
  },

  /**
   * Giả lập hành động Like bài viết
   */
  likePost: async (postId: number): Promise<void> => {
    // TODO: [AUTH] Kiểm tra User đã đăng nhập chưa (Get Token)
    // const token = localStorage.getItem('accessToken');

    // TODO: [API] Gọi API Like (Method POST)
    // await fetch(`${API_URL}/posts/${postId}/like`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    await new Promise((resolve) => setTimeout(resolve, 300));
    // Logic backend sẽ xử lý việc tăng giảm like ở đây
    console.log(`Liked post ${postId}`);
  },

  /**
   * Lấy danh sách comment của 1 bài viết
   */
  getComments: async (postId: number): Promise<PostComment[]> => {
    // TODO: [API] Gọi API lấy danh sách comment
    // const res = await fetch(`${API_URL}/posts/${postId}/comments`);
    // return res.json();

    // TODO: [PAGINATION] Nếu bài viết có hàng trăm comment, cần thêm tham số page/limit vào hàm này

    await new Promise((resolve) => setTimeout(resolve, 600));

    return Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      postId,
      author: {
        name: `Commenter ${i + 1}`,
        avatar: `https://ui-avatars.com/api/?name=Commenter+${
          i + 1
        }&background=random&color=fff`,
        role: i === 0 ? "Pro Builder" : undefined,
      },
      content:
        i === 0
          ? "Quá đẹp bạn ơi! Cho mình xin info keycap với 😍"
          : "Build này tốn khoảng bao nhiêu lúa thế?",
      time: `${i + 5} mins ago`,
    }));
  },

  /**
   * Gửi comment mới
   */
  addComment: async (postId: number, content: string): Promise<PostComment> => {
    // TODO: [AUTH] Lấy Token xác thực người dùng

    // TODO: [API] Gửi nội dung lên server
    // const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    //   method: 'POST',
    //   body: JSON.stringify({ content }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`
    //   }
    // });
    // const newComment = await res.json();
    // return newComment; // Trả về object comment thật từ server (có ID thật)

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data trả về
    return {
      id: Date.now(),
      postId,
      author: {
        name: "Me", // TODO: [AUTH] Thay bằng tên user hiện tại
        avatar: "https://ui-avatars.com/api/?name=Me&background=000&color=fff",
      },
      content,
      time: "Just now",
    };
  },
};
