"use client";

import { useState } from "react";
import {
  GitMerge,
  Info,
  MousePointer2,
  PlayCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";

const steps = [
  {
    icon: MousePointer2,
    title: "1. Cách Nối Dây",
    content:
      "Nhấn giữ chuột vào chấm tròn bên phải của linh kiện nguồn, kéo sợi dây và thả vào chấm tròn bên trái của linh kiện đích.",
  },
  {
    icon: GitMerge,
    title: "2. Nối Đa Nhánh",
    content:
      "Một Case có thể lắp vừa nhiều Plate? Cứ thoải mái kéo nhiều sợi dây từ Case đó cắm vào các Plate tương ứng.",
  },
  {
    icon: Trash2,
    title: "3. Sửa Sai",
    content:
      "Nếu lỡ tay nối nhầm, Click chuột vào sợi dây (dây sẽ phát sáng), sau đó nhấn phím Delete hoặc Backspace để xóa.",
  },
  {
    icon: Save,
    title: "4. Lưu Hệ Thống",
    content:
      "Sau khi nối hoàn chỉnh, bắt buộc phải nhấn Lưu Quy Trình để áp dụng luật lên Cửa hàng.",
  },
];

export default function RuleBuilderGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-50"
      >
        <span className="text-blue-700">[?]</span>
        <span>Xem hướng dẫn thao tác</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 rounded-md border border-blue-200 bg-white p-1.5 text-blue-700 transition-colors hover:bg-blue-50"
              aria-label="Đóng hướng dẫn"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2.5 pr-10">
                <div className="rounded-full border border-blue-200 bg-white p-1.5">
                  <Info className="h-4 w-4 text-blue-700" />
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-blue-900">
                    Hướng dẫn sử dụng
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug text-blue-900/90">
                    Công cụ này giúp bạn quy định linh kiện nào được phép lắp
                    ráp với nhau. Khách hàng sẽ dựa vào sơ đồ này để build phím
                    mà không bao giờ sợ chọn nhầm đồ.
                  </p>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-3 py-1.5">
                  <PlayCircle className="h-4 w-4 text-blue-700" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                    Video minh họa nhanh
                  </span>
                </div>

                <div className="flex justify-center p-2">
                  <div className="w-auto max-h-[250px] overflow-hidden rounded-lg border border-blue-100">
                    <video
                      src="https://res.cloudinary.com/doezwafgz/video/upload/v1776516223/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_K%C3%A9o_Th%E1%BA%A3_Linh_Ki%E1%BB%87n_mane3b.mp4"
                      controls
                      playsInline
                      className="h-full max-h-[250px] w-auto object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="rounded-lg border border-blue-200 bg-white p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-blue-100 p-1.5">
                          <Icon className="h-4 w-4 text-blue-700" />
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-blue-900">
                            {step.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] leading-snug text-blue-900/90">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
