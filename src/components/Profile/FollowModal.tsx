"use client";
import { FC, useState, useEffect } from "react";
import { X, UserPlus, UserMinus, Search } from "lucide-react";
import Image from "next/image";
import { followsApi, FollowUserInfo } from "@/src/services/follows.service";
import Link from "next/link";

interface FollowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: "Followers" | "Following";
  shopUserId: string;
}

export const FollowsModal: FC<FollowsModalProps> = ({
  isOpen,
  onClose,
  title,
  shopUserId,
}) => {
  const [users, setUsers] = useState<FollowUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Gọi API lấy danh sách khi Popup mở ra
  useEffect(() => {
    if (isOpen && shopUserId) {
      const fetchList = async () => {
        setIsLoading(true);
        try {
          let response;
          if (title === "Followers") {
            response = await followsApi.getShopFollowers(shopUserId);
          } else {
            response = await followsApi.getShopFollowing(shopUserId);
          }

          if (response.success && response.data) {
            // BE trả về mảng object, chúng ta gán thẳng vào state
            setUsers(response.data);
          }
        } catch (error) {
          console.error(`Lỗi lấy danh sách ${title}:`, error);
          setUsers([]); // Reset nếu lỗi
        } finally {
          setIsLoading(false);
        }
      };

      fetchList();
    }
  }, [isOpen, shopUserId, title]);

  // 2. Logic tìm kiếm (filter) cục bộ trên danh sách đã lấy về
  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null; // Nếu không mở thì không render gì cả

  return (
    // Backdrop xám mờ phía sau
    <div
      className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Cửa sổ Modal chính (Instagram Style) */}
      <div
        className="bg-white rounded-xl w-full max-w-[400px] h-[400px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Ngăn click bên trong modal làm đóng modal
      >
        {/* Header của Modal */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
          <div className="w-8"></div> {/* Placeholder balancing */}
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Thanh tìm kiếm (IG Style) */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#efefef] rounded-lg py-1.5 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Nội dung danh sách (Có thể cuộn) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {isLoading ? (
            // Loading State
            <div className="flex items-center justify-center h-full text-sm text-gray-500">
              Loading...
            </div>
          ) : filteredUsers.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-gray-900" />
              </div>
              <p className="text-xl font-bold text-gray-900">No {title} yet</p>
              <p className="text-sm text-gray-500 mt-1">
                {title === "Followers"
                  ? "When someone follows this shop, you'll see them here."
                  : "This shop is not following anyone yet."}
              </p>
            </div>
          ) : (
            // Hiển thị danh sách user thực tế
            filteredUsers.map((item) => (
              <div
                key={item.userId}
                className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {/* Avatar & Tên */}
                <Link
                  href={`/profile/${item.userId}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={onClose}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                    {item.avatarUrl ? (
                      <Image
                        src={item.avatarUrl}
                        alt={item.fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      // Avatar mặc định nếu không có ảnh
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-lg uppercase">
                        {item.fullName?.charAt(0) || item.userName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate hover:underline">
                      {item.userName || item.fullName}
                    </span>
                    <span className="text-sm text-gray-500 truncate">
                      {item.fullName}
                    </span>
                  </div>
                </Link>

                {/* Nút hành động (Ví dụ: Nút Follow lại người này - Tùy chọn làm sau) */}
                {/* <button className="px-4 py-1.5 bg-[#efefef] hover:bg-gray-200 text-black font-semibold text-xs rounded-lg transition-colors">
                  Follow
                </button> */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
