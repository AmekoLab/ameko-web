export type ProductStatus =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "PRE_ORDER"
  | "GROUP_BUY";

export type ProductTag = "NEW" | "HOT" | "SALE" | "LIMITED";

export interface ProductAccessory {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string; // Đường dẫn để click vào xem chi tiết
}

export interface ProductSoundTest {
  videoUrl: string;
  description: string;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  value: string; // Mã màu hex (#000000) hoặc giá trị text
  priceModifier?: number; // Số tiền cộng thêm (VD: +$20 cho Brass Plate)
  image?: string; // Ảnh đại diện cho option này (nếu có)
}

export interface ProductOption {
  id: string;
  name: string; // VD: "Color", "Switch", "Plate"
  type: "color" | "button" | "select";
  values: ProductOptionValue[];
}

export interface ProductSpecs {
  // Các thông số cơ bản (Hiển thị ở ProductInfo)
  layout: string; // VD: "75% (82 Keys)"
  mounting: string; // VD: "Gasket Mount"
  pcb: string; // VD: "1.2mm Flex-cut, Hotswap"
  connection: string; // VD: "Tri-mode (BT/2.4G/Wired)"

  // Các thông số mở rộng (Hiển thị ở bảng Winning Ingredients - ProductSpecs.tsx)
  battery?: string; // VD: "4000mAh"
  caseMaterial?: string; // VD: "CNC Aluminum"
  plateMaterial?: string; // VD: "Polycarbonate / FR4"
  pollingRate?: string; // VD: "1000Hz"
  antiGhosting?: string; // VD: "NKRO"
  weight?: string; // VD: "1.8kg (Fully Assembled)"
  warranty?: string; // VD: "12 Months"

  // Cho phép thêm các key động khác nếu cần mở rộng sau này
  [key: string]: string | undefined;
}

export interface Product {
  // --- Identity ---
  id: string;
  slug: string;
  name: string;

  // --- Pricing ---
  basePrice: number;
  originalPrice?: number; // Dùng để hiện giá gốc khi có giảm giá (gạch ngang)

  // --- Categorization ---
  category: string; // VD: "Keyboards", "Custom Kits", "Mice"
  brand?: string; // VD: "AMEKO", "GMMK"
  tag?: ProductTag; // Badge hiển thị trên Card (NEW, HOT...)

  // --- Status & Social Proof ---
  status: ProductStatus;
  rating: number; // 0.0 - 5.0
  reviewsCount: number;

  // --- Content ---
  shortDesc: string; // Mô tả ngắn (hiển thị ở ProductInfo)
  description?: string; // Mô tả chi tiết (HTML/Markdown)
  features: string[]; // Danh sách tính năng nổi bật (hiển thị 3 dòng ở ProductCard)

  // --- Media ---
  images: string[]; // Mảng ảnh sản phẩm (images[0] là thumbnail chính)
  model3dId?: string; // ID để load model 3D (nếu có tính năng 3D View)
  soundTest?: ProductSoundTest; // Dữ liệu cho SoundTestSection

  // --- Configuration ---
  options?: ProductOption[]; // Các lựa chọn cấu hình (Màu sắc, Switch...)
  specs: ProductSpecs; // Bảng thông số kỹ thuật chi tiết

  // --- Cross-sell ---
  boughtTogether?: ProductAccessory[]; // Gợi ý phụ kiện mua kèm
  relatedProducts?: Product[]; // Gợi ý sản phẩm tương tự (Complete Setup)

  // --- Inventory (Optional) ---
  stockQuantity?: number;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
  // Key là optionId (VD: "color"), Value là optionValueId (VD: "black")
  selectedOptions: Record<string, ProductOptionValue>;
  finalPrice: number;
}
