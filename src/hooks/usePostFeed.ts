import { useState, useRef, useCallback } from "react";
import { CommunityService } from "@/src/services/community.service";
import { Post } from "@/src/types/community";

// TODO: [FILTER] Thêm tham số filter vào Hook nếu muốn hỗ trợ lọc (VD: 'trending', 'newest', 'following')
export const usePostFeed = (initialData: Post[]) => {
  const [posts, setPosts] = useState<Post[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2); // Bắt đầu load từ trang 2 vì trang 1 Server đã lấy
  const [error, setError] = useState<string | null>(null);

  // Set lưu ID để lọc trùng lặp tuyệt đối
  const loadedIds = useRef(new Set<number>(initialData.map((p) => p.id)));

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: [API] Khi hệ thống lớn, nên chuyển sang Cursor-based Pagination (dùng ID bài cuối cùng làm mốc) thay vì Page-based
      // const { data, nextCursor } = await CommunityService.getPosts(cursor);
      const { data, hasMore: moreData } = await CommunityService.getPosts(page);

      // Lọc bài viết trùng lặp (Client-side Deduplication)
      // Logic này rất quan trọng để tránh crash key React khi mạng chập chờn
      const newPosts = data.filter((post) => {
        if (loadedIds.current.has(post.id)) return false;
        loadedIds.current.add(post.id);
        return true;
      });

      if (newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(moreData);
      if (moreData) setPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      // TODO: [UX] Tích hợp thư viện Toast để hiển thị lỗi đẹp hơn
      // toast.error("Lỗi kết nối mạng");
      setError("Không thể tải thêm bài viết. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const retry = () => {
    setError(null);
    loadMore();
  };

  // TODO: [FEATURE] Thêm hàm này để component CreatePost gọi sau khi đăng bài thành công
  // Giúp bài viết mới hiện lên đầu ngay lập tức mà không cần reload trang
  const addNewPostToFeed = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    loadedIds.current.add(newPost.id);
  };

  return {
    posts,
    isLoading,
    hasMore,
    error,
    loadMore,
    retry,
    // addNewPostToFeed // Export hàm này ra khi cần dùng
  };
};
