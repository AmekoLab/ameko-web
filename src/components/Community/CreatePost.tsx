"use client";
import { FC } from "react";
import Image from "next/image";
import { Image as ImageIcon, Smile, Send } from "lucide-react";

export const CreatePost: FC = () => {
  // TODO: [AUTH] Lấy thông tin user hiện tại từ Context/Redux/NextAuth
  // const { user } = useAuth();

  // Placeholder avatar (Dùng ảnh cứng cho đến khi có Auth)
  const userAvatar =
    "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg";

  const handlePost = () => {
    // TODO: [LOGIC] Kiểm tra user đã đăng nhập chưa? Nếu chưa -> Mở Modal Login
    // if (!user) return openLoginModal();
    // TODO: [VALIDATION] Kiểm tra nội dung input không được để trống
    // if (!content.trim() && images.length === 0) return;
    // TODO: [API] Gọi API tạo bài viết mới
    // setIsLoading(true);
    // await CommunityService.createPost({ content, images });
    // toast.success("Đăng bài thành công!");
  };

  const handleImageUpload = () => {
    // TODO: [UPLOAD] Tạo thẻ input type="file" ẩn và kích hoạt click()
    // TODO: [API] Upload ảnh lên Cloudinary/S3 -> Lấy URL về lưu vào state images[]
    // TODO: [UI] Hiển thị ảnh Preview nhỏ bên dưới ô input (cho phép xóa ảnh nếu chọn nhầm)
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex gap-4 mb-4">
        {/* Avatar User */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-200">
          <Image
            src={userAvatar}
            alt="My Avatar"
            fill
            className="object-cover"
          />
        </div>

        {/* Input Field */}
        <div className="flex-grow">
          <input
            type="text"
            // TODO: [STATE] Binding value vào state (e.g., const [content, setContent] = useState(""))
            // value={content}
            // onChange={(e) => setContent(e.target.value)}
            placeholder="Khoe 'con cưng' bàn phím của bạn đi nào? (Layout, Specs...)"
            className="w-full bg-gray-50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ce2a32]/20 transition-all hover:bg-gray-100"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
        <div className="flex gap-2">
          {/* Nút đăng ảnh */}
          <button
            onClick={handleImageUpload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-500 hover:text-[#ce2a32] transition-colors text-xs font-bold uppercase tracking-wide"
          >
            <ImageIcon className="w-4 h-4" />
            Photo/Video
          </button>

          {/* Nút cảm xúc */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-500 hover:text-[#ce2a32] transition-colors text-xs font-bold uppercase tracking-wide">
            {/* TODO: [FEATURE] Tích hợp Emoji Picker khi click vào đây */}
            <Smile className="w-4 h-4" />
            Feeling/Activity
          </button>
        </div>

        {/* Nút Đăng bài */}
        <button
          onClick={handlePost}
          className="bg-black text-white px-6 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-[#ce2a32] transition-colors flex items-center gap-2"
        >
          {/* TODO: [UI] Nếu đang loading (isPosting) thì hiện icon xoay vòng (Loader) */}
          Post <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
