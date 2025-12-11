"use client"; // Đảm bảo chạy client-side

import { searchProducts } from "@/src/lib/api";
import Link from "next/link"; // Dùng Link của Next.js thay cho thẻ a
import { FC, useEffect, useRef, useState } from "react";

// 1. Định nghĩa Type rõ ràng (Fix lỗi unexpected any)
interface ProductResult {
  id: number | string;
  name: string;
  slug: string;
  category: string;
}

export const SearchBar: FC = () => {
  const [q, setQ] = useState("");
  // Fix lỗi any: Thay any[] bằng ProductResult[]
  const [results, setResults] = useState<ProductResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ref để xử lý click outside
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQ = useDebounce(q, 300);

  // 2. Hook tự đóng dropdown khi click ra ngoài (UX Pro)
  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    // Kỹ thuật "Abort flag" để tránh Race Condition (kết quả cũ đè kết quả mới)
    let active = true;

    const fetchResults = async () => {
      if (!debouncedQ.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      setOpen(true); // Mở dropdown ngay khi bắt đầu search để hiện loading

      try {
        // Ép kiểu kết quả trả về từ API (hoặc sửa ở hàm api.ts)
        const data = (await searchProducts(debouncedQ)) as ProductResult[];

        if (active) {
          setResults(data);
        }
      } catch (error) {
        console.error("Search failed", error);
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchResults();

    return () => {
      active = false;
    };
  }, [debouncedQ]);

  // Handler khi user chọn 1 item -> đóng search vào
  const handleSelect = () => {
    setOpen(false);
    setQ(""); // Tùy chọn: Xóa text sau khi chọn hoặc giữ nguyên
  };

  return (
    // Gán ref vào div cha để bắt sự kiện click outside
    <div ref={containerRef} className="relative w-full max-w-xs">
      <label className="sr-only" htmlFor="site-search">
        Search
      </label>
      <input
        id="site-search"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (e.target.value) setOpen(true); // Gõ lại thì mở lại
        }}
        placeholder="SEARCH"
        className="w-full rounded-sm border border-gray-500 bg-white/5 px-3 py-2 text-sm text-black placeholder-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all"
        autoComplete="off"
      />

      {open && (debouncedQ || loading) && (
        <div className="absolute z-20 mt-2 w-full rounded-sm bg-white border border-gray-200 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 animate-pulse">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-auto py-1">
              {results.map((r) => (
                <li key={r.id}>
                  {/* 3. Dùng Link thay cho a để tối ưu Next.js */}
                  <Link
                    href={`/product/${r.slug}`}
                    onClick={handleSelect}
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium truncate mr-2">{r.name}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider shrink-0">
                      {r.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {`No results found for "${debouncedQ}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Utils (Nên tách ra file riêng như hooks/useDebounce.ts) ---

function useDebounce<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// Hook xử lý click ra ngoài (Copy cái này vào file hooks/useClickOutside.ts dùng cho tiện)
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>, // Cho phép null
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Nếu click vào bên trong ref thì không làm gì
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
