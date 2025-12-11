"use client";

import { FC, useState, useEffect } from "react";
import Image from "next/image";
import { COUNTRIES } from "../../data/countries";

// --- ICONS (Inline SVG cho gọn) ---
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 1L5 5L9 1" />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    className="w-6 h-6 text-gray-500 hover:text-black transition"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const CountrySelector: FC = () => {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Logic lọc danh sách quốc gia theo từ khóa tìm kiếm
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Logic Scroll Lock: Khi mở modal thì cấm body cuộn
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      {/* --- TRIGGER BUTTON (Giữ nguyên vẻ đẹp cũ) --- */}
      <button
        type="button"
        className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-primary-600 transition-colors py-1 group"
        onClick={() => setOpen(true)}
      >
        <Image
          src={country.flagUrl}
          alt={country.name}
          width={20}
          height={15}
          className="rounded-[2px] object-cover border border-gray-200 group-hover:border-primary-200 transition-colors"
        />
        <span className="hidden sm:inline-block">{country.name}</span>
        <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </button>

      {/* --- MODAL OVERLAY & CONTENT --- */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop (Nền tối làm mờ) - Click vào đây để đóng */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          ></div>

          {/* Modal Panel */}
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header Modal: Title + Search + Close */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Chọn quốc gia
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 transition"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm quốc gia..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus // Tự động focus vào ô tìm kiếm khi mở
                />
              </div>
            </div>

            {/* Body Modal: Danh sách quốc gia (Grid Layout) */}
            <div className="p-2 max-h-[60vh] overflow-y-auto bg-gray-50/50">
              {filteredCountries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountry(c);
                        setOpen(false);
                        setSearchTerm(""); // Reset search khi chọn xong
                      }}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg transition-all border
                        ${
                          country.code === c.code
                            ? "bg-primary-50 border-primary-200 ring-1 ring-primary-500"
                            : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
                        }
                      `}
                    >
                      <Image
                        src={c.flagUrl}
                        alt={c.name}
                        width={32}
                        height={24}
                        className="rounded-[3px] object-cover border border-gray-100 shadow-sm"
                      />
                      <div className="text-left">
                        <p
                          className={`text-sm font-medium ${
                            country.code === c.code
                              ? "text-primary-700"
                              : "text-gray-900"
                          }`}
                        >
                          {c.name}
                        </p>
                        {/* Có thể hiện thêm tên tiếng Anh hoặc mã vùng nếu muốn */}
                        <p className="text-xs text-gray-400">{c.code}</p>
                      </div>

                      {/* Check icon */}
                      {country.code === c.code && (
                        <div className="ml-auto text-primary-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  {`Không tìm thấy quốc gia nào khớp với "${searchTerm}"`}
                </div>
              )}
            </div>

            {/* Footer Modal (Optional) */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-center text-gray-400">
              Việc thay đổi quốc gia có thể thay đổi đơn vị tiền tệ và phí vận
              chuyển.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
