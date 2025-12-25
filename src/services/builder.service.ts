import { BuilderResponse } from "@/src/types/builder";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const BuilderService = {
  // 1. Lấy dữ liệu khởi tạo
  async initSession(sessionId?: string): Promise<BuilderResponse> {
    const url = sessionId
      ? `${API_URL}/builder/init?sessionId=${sessionId}`
      : `${API_URL}/builder/init`;

    const res = await fetch(url, {
      cache: "no-store", // Luôn lấy dữ liệu mới nhất, không lưu cache cũ
      mode: "cors", // Báo hiệu đây là gọi chéo server
    });

    if (!res.ok) throw new Error("Không kết nối được với Backend Builder");

    const json = await res.json();
    return json.data;
  },

  // 2. Gửi lựa chọn của khách về bếp
  async selectProduct(
    sessionId: string,
    categorySlug: string,
    productId: number
  ): Promise<BuilderResponse> {
    const res = await fetch(`${API_URL}/builder/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, categorySlug, productId }),
    });

    if (!res.ok) throw new Error("Lỗi khi chọn sản phẩm");

    const json = await res.json();
    return json.data;
  },

  // Lấy danh sách các Tab
  getAllSteps: async () => {
    const res = await fetch(`${API_URL}/builder/steps`);
    return res.json();
  },

  // Lấy sản phẩm khi click vào Tab
  getStepProducts: async (slug: string) => {
    const res = await fetch(`${API_URL}/builder/step/${slug}`);
    return res.json();
  },
};
